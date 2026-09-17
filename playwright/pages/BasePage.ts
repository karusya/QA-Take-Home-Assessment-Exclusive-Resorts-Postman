import { Page } from '@playwright/test';

/**
 * Shared base class for all page objects.
 * Keep this thin -- page-specific locators/actions belong on the concrete page.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.dismissCookieBanner();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Dismisses the cookie-consent banner ("Accept All"), which must happen
   * before any other interaction on a fresh page load. Confirmed live: with
   * the banner still up, other clicks (e.g. the mobile "Filters" button)
   * register with Playwright as succeeding but the app's own handler never
   * fires -- the consent widget is intercepting the event without visually
   * overlapping the target, so Playwright's actionability check doesn't
   * flag it. No-ops if the banner isn't present (e.g. consent already
   * recorded in this browser context).
   */
  async dismissCookieBanner(): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Accept All' })
      .click({ timeout: 3000 })
      .catch(() => {
        // Banner didn't appear within the timeout -- nothing to dismiss.
      });
  }
}
