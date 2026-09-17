import { test as base, expect } from '@playwright/test';
import { NavigationPage } from '../pages/NavigationPage';
import { SearchPage } from '../pages/SearchPage';
import { LoginPage } from '../pages/LoginPage';

type Pages = {
  navigationPage: NavigationPage;
  searchPage: SearchPage;
  loginPage: LoginPage;
};

export const test = base.extend<Pages>({
  navigationPage: async ({ page }, use) => {
    await use(new NavigationPage(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
  loginPage: async ({ page }, use) => {
    // Abort Auth0 login POSTs so no test sends real credentials to the auth server.
    // GETs (initial page load) are allowed through; only form submissions are blocked.
    await page.route('**/u/login**', async route => {
      if (route.request().method() === 'POST') {
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await use(new LoginPage(page));
  },
});

export { expect };
