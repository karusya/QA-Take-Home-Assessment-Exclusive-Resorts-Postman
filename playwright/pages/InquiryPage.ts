import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type ContactMethod = 'Phone' | 'Text' | 'Email';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | "I'm Flexible";
export type PreferredDays = 'Monday-Friday' | 'Saturday-Sunday' | "I'm Flexible";

export interface InquiryFormData {
  firstName: string;
  lastName: string;
  email: string;
  postalCode: string;
  /** Digits only, no country code -- the country selector defaults from browser locale. */
  phone: string;
  contactMethod: ContactMethod;
  /** Required consent checkbox. Defaults to true in fillRequiredFields(). */
  consent?: boolean;
  smsOptIn?: boolean;
  preferredTime?: TimeOfDay;
  preferredDays?: PreferredDays;
}

/**
 * Page Object for the Exclusive Resorts membership inquiry form.
 *
 * Notes on the live implementation (captured via DOM inspection on
 * https://public-site.stage.exclusiveresorts.com/inquire/, 2026-09-15):
 *
 * - The form is built with FormKit. Field names on the wire are:
 *   FirstName, LastName, Email, ZIP, telephone, preferredContactType,
 *   termsAgreement, smsOptIn, preferredTime, preferredDays, plus a set of
 *   hidden UTM/CRM tracking fields (C_Page_URL, GCLID, msclkid, FBID,
 *   Braze_Campaign_ID, Referrer_URL, utm_*), and a honeypot field named
 *   "MessagingPreferences" (id="hp-field") that MUST be left empty -- a
 *   bot-detection trap, not a real form field. Never fill it in a test.
 * - "Name*" is a single visual label but renders as two separate inputs
 *   (First / Last). Only the First input is associated to that label via
 *   `for`; the Last input has no accessible name at all (see BUG-02 in the
 *   exploratory report), so it's located by placeholder rather than label.
 * - Phone is a vue-tel-input widget: a country-code selector button plus a
 *   `tel` input. The selector defaults from browser locale, not from the
 *   number typed, so a same-region number should be entered without
 *   assuming the country is already correct (see BUG-03).
 * - "Preferred Time of Day" / "Preferred Days" are custom `<div>`-based
 *   dropdowns with no ARIA role/expanded state (see BUG-04) -- there is no
 *   combobox/option role to hook into, so they're located by visible text.
 * - Submitting calls POST /validate-email/ (fired per keystroke/blur, no
 *   debounce -- see BUG-01) and, on success, POST /submit-form/, whose
 *   response is `{ data: { id: <number> } }`.
 * - Every FormKit radio/checkbox (contact-method radios, consent, SMS
 *   opt-in) renders as `<label class="formkit-wrapper"><input ... style
 *   opacity:0, position:absolute, 0x0 box /><span class="formkit-
 *   decorator">...</span></label>`. The native input is visually hidden
 *   by design (the decorator span is the custom on-screen control) --
 *   this is a normal styling technique, not a defect, but it means
 *   `.check()`/`.click()` on the input itself times out (not visible /
 *   0x0 / "outside viewport"). Always interact via toggleBoolean(), which
 *   clicks the wrapping label instead and asserts the resulting state on
 *   the (still perfectly queryable/assertable) underlying input.
 */
export class InquiryPage extends BasePage {
  readonly form: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly emailError: Locator;
  readonly postalCodeInput: Locator;
  readonly countryCodeButton: Locator;
  readonly phoneInput: Locator;
  readonly phoneError: Locator;
  readonly consentCheckbox: Locator;
  readonly smsOptInCheckbox: Locator;
  readonly honeypotField: Locator;
  readonly submitButton: Locator;
  readonly successHeading: Locator;

  constructor(page: Page) {
    super(page);
    // Scope everything to the *first* form on the page -- the DOM also
    // contains a hidden "Share a Referral" follow-up form and a meeting
    // scheduler form later in the flow, both of which also render a
    // "Submit" button, so an unscoped page.getByRole('button', {name:
    // 'Submit'}) would be ambiguous.
    this.form = page.locator('main form').first();

    this.firstNameInput = this.form.getByPlaceholder('First');
    this.lastNameInput = this.form.getByPlaceholder('Last');
    this.emailInput = this.form.locator('input[type="email"][name="Email"]');
    this.emailError = this.form.getByText('Email is not valid.');
    this.postalCodeInput = this.form.getByLabel('Postal Code', { exact: false });
    this.countryCodeButton = this.form.getByRole('button', { name: 'Country Code Selector' });
    // NOT getByPlaceholder: the vue-tel-input wrapper <div> around this
    // input also carries a (non-standard, but present) placeholder=
    // "Enter a phone number" attribute, so getByPlaceholder resolves to
    // 2 elements (strict-mode violation). Only the real <input> exposes
    // role="textbox" (divs have no implicit role), so getByRole
    // disambiguates cleanly -- confirmed against the live DOM.
    this.phoneInput = this.form.getByRole('textbox', { name: 'Enter a phone number' });
    this.phoneError = this.form.getByText('Please enter a valid phone number');
    this.consentCheckbox = this.form.locator('input[name="termsAgreement"]');
    this.smsOptInCheckbox = this.form.locator('input[name="smsOptIn"]');
    // Bot-detection honeypot -- assert it stays empty, never fill it.
    this.honeypotField = this.form.locator('input[name="MessagingPreferences"]');
    this.submitButton = this.form.getByRole('button', { name: 'Submit' });
    this.successHeading = page.getByRole('heading', { name: 'We appreciate your interest.' });
  }

  async open(): Promise<void> {
    await this.goto('/inquire/');
    await expect(this.firstNameInput).toBeVisible();
  }

  contactMethodRadio(method: ContactMethod): Locator {
    return this.form.getByRole('radio', { name: method });
  }

  /** Custom (non-native) select -- located by visible text, see class docstring. */
  private customSelect(labelText: string): Locator {
    return this.form
      .locator('label', { hasText: labelText })
      .locator('xpath=following-sibling::*[1]')
      .locator('.custom-select');
  }

  /**
   * Sets a FormKit radio/checkbox to `checked`. The native input is
   * visually hidden (see class docstring), so we click its wrapping
   * `label.formkit-wrapper` -- exactly what a real user clicks -- rather
   * than calling `.check()`/`.click()` on the input directly, which
   * times out waiting for an element with a 0x0 box to become "visible".
   * No-ops if already in the desired state (clicking again would toggle
   * it back off for a checkbox).
   */
  private async toggleBoolean(input: Locator, checked: boolean): Promise<void> {
    if ((await input.isChecked()) === checked) {
      return;
    }
    await input.locator('xpath=ancestor::label[contains(@class,"formkit-wrapper")][1]').click();
    await expect(input).toBeChecked({ checked });
  }

  async choosePreferredTime(option: TimeOfDay): Promise<void> {
    const select = this.customSelect('Preferred Time of Day');
    await select.click();
    await select.getByText(option, { exact: true }).click();
  }

  async choosePreferredDays(option: PreferredDays): Promise<void> {
    const select = this.customSelect('Preferred Days');
    await select.click();
    await select.getByText(option, { exact: true }).click();
  }

  async fillRequiredFields(data: InquiryFormData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.postalCodeInput.fill(data.postalCode);
    await this.phoneInput.fill(data.phone);
    await this.toggleBoolean(this.contactMethodRadio(data.contactMethod), true);

    if (data.consent ?? true) {
      await this.toggleBoolean(this.consentCheckbox, true);
    }
    if (data.smsOptIn) {
      await this.toggleBoolean(this.smsOptInCheckbox, true);
    }
    if (data.preferredTime) {
      await this.choosePreferredTime(data.preferredTime);
    }
    if (data.preferredDays) {
      await this.choosePreferredDays(data.preferredDays);
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectSuccess(): Promise<void> {
    await expect(this.successHeading).toBeVisible();
  }
}
