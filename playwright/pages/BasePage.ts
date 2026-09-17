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
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
