import { Page, Locator, expect } from '@playwright/test';

// Member portal lives on a different origin -- does not extend BasePage
// (which uses baseURL = staging public site).
// Auth flow is multi-step: step 1 = username + Continue, step 2 = password.
// The password input exists in the DOM on step 1 but is aria-hidden/display:none
// until step 2 loads -- only step 1 is testable without real credentials.
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly continueButton: Locator;
  readonly passkeyButton: Locator;
  readonly errorMessage: Locator;

  static readonly URL = 'https://member.exclusiveresorts.com/';
  // Auth0 redirects the initial request to login.exclusiveresorts.com --
  // match either domain so URL assertions don't break on the redirect.
  static readonly URL_PATTERN = /exclusiveresorts\.com/;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.passkeyButton = page.getByRole('button', { name: 'Continue with a passkey' });
    this.errorMessage = page.locator('[role="alert"]').first();
  }

  async open(): Promise<void> {
    await this.page.goto(LoginPage.URL);
    await expect(this.usernameInput).toBeVisible();
  }
}
