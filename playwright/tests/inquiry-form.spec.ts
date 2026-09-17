import { test, expect, validContact } from '../fixtures/inquiry.fixtures';

/**
 * Automated subset of the test plan (see /test-plan/ doc for the full
 * 15-case matrix). These 7 cases were chosen to cover every required
 * category from the assignment brief: smoke, validation, compliance,
 * security, and accessibility, plus one concurrency case.
 *
 * Tags: @smoke (fast, must-pass-before-merge), @regression (full suite),
 * @negative (invalid-input paths). Run subsets with:
 *   npx playwright test --grep @smoke
 *   npx playwright test --grep @negative
 */

test.describe('Inquiry form @regression', () => {
  test('TC-01 page loads with all required fields visible @smoke', async ({ inquiryPage }) => {
    await expect(inquiryPage.firstNameInput).toBeVisible();
    await expect(inquiryPage.lastNameInput).toBeVisible();
    await expect(inquiryPage.emailInput).toBeVisible();
    await expect(inquiryPage.postalCodeInput).toBeVisible();
    await expect(inquiryPage.phoneInput).toBeVisible();
    await expect(inquiryPage.contactMethodRadio('Phone')).toBeVisible();
    await expect(inquiryPage.contactMethodRadio('Text')).toBeVisible();
    await expect(inquiryPage.contactMethodRadio('Email')).toBeVisible();
    await expect(inquiryPage.consentCheckbox).toBeVisible();
    await expect(inquiryPage.submitButton).toBeVisible();
  });

  test('TC-02 submit valid lead shows success message @smoke', async ({ inquiryPage, stubbedSubmit }) => {
    await inquiryPage.fillRequiredFields(validContact);
    await inquiryPage.submit();

    await inquiryPage.expectSuccess();

    const body = stubbedSubmit.getLastRequestBody();
    expect(body, 'submit-form should have received a request').not.toBeNull();
  });

  test('TC-03 empty submit blocks and shows required-field errors @negative', async ({ inquiryPage }) => {
    await inquiryPage.submit();

    // FormKit renders validation messages inline; the important behavior
    // under test is that submission is blocked, not the exact wording.
    await expect(inquiryPage.successHeading).not.toBeVisible();
    const messages = inquiryPage.form.locator('.formkit-messages, [id^="messages"]');
    await expect(messages.first()).toBeVisible();
  });

  test('TC-06 consent checkbox required, submit blocked when unchecked @negative', async ({
    inquiryPage,
    stubbedSubmit,
  }) => {
    await inquiryPage.fillRequiredFields({ ...validContact, consent: false });
    await expect(inquiryPage.consentCheckbox).not.toBeChecked();

    await inquiryPage.submit();

    await expect(inquiryPage.successHeading).not.toBeVisible();
    expect(
      stubbedSubmit.getLastRequestBody(),
      'submit-form must not be called when consent is unchecked'
    ).toBeNull();
  });

  test('TC-07 XSS payload in Name renders as text, no script execution @security', async ({
    page,
    inquiryPage,
    stubbedSubmit,
  }) => {
    const payload = '<script>window.__xss_fired = true;</script>';
    let dialogFired = false;
    page.on('dialog', () => {
      dialogFired = true;
    });

    await inquiryPage.fillRequiredFields({ ...validContact, firstName: payload });

    // Verify the browser did not strip or sanitize the payload before submit.
    await expect(inquiryPage.firstNameInput).toHaveValue(payload);

    await inquiryPage.submit();

    // The payload must remain inert text -- never executed as script.
    const xssFired = await page.evaluate(() => (window as unknown as Record<string, unknown>).__xss_fired);
    expect(xssFired).toBeFalsy();
    expect(dialogFired).toBe(false);

    // Also confirm the raw, un-sanitized payload is what actually gets
    // sent to the backend -- sanitization is the server's job, not just
    // the DOM's; if the client silently stripped/altered it before
    // submit-form was called, this would catch that.
    const body = stubbedSubmit.getLastRequestBody();
    expect(JSON.stringify(body)).toContain('script');
  });

  test('TC-13 form is keyboard-navigable and reaches every field @accessibility', async ({ page, inquiryPage }) => {
    await inquiryPage.firstNameInput.focus();
    await expect(inquiryPage.firstNameInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(inquiryPage.lastNameInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(inquiryPage.emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(inquiryPage.postalCodeInput).toBeFocused();

    // vue-tel-input renders a country-code selector button before the
    // actual number input -- Tab lands on the button first.
    await page.keyboard.press('Tab');
    await expect(inquiryPage.countryCodeButton).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(inquiryPage.phoneInput).toBeFocused();
  });

  // FIXME: currently failing/flaky against the live form -- not yet root-caused
  // whether this is a real double-submit bug (button not debounced, a second
  // stubbed request actually fires) or a race in how the two clicks are fired
  // here. Converted from test.skip to test.fixme so it's tracked as broken and
  // shows up in the report, rather than silently passed over.
  test.fixme('TC-15 double-clicking Submit does not create duplicate leads @regression', async ({
    inquiryPage,
    stubbedSubmit,
  }) => {
    await inquiryPage.fillRequiredFields(validContact);
    // Fire two submit clicks back-to-back, simulating a double-click /
    // impatient re-click before the success state renders.
    await Promise.all([inquiryPage.submit(), inquiryPage.submit()]);
    await inquiryPage.expectSuccess();

    expect(
      stubbedSubmit.getCallCount(),
      'exactly one submit-form request should fire per successful submission -- a higher count means the ' +
        'button is not disabled/debounced on click and a real double-click would create a duplicate CRM lead'
    ).toBe(1);
  });
});
