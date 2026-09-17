import { test, expect } from '../fixtures/pages.fixtures';
import { LoginPage } from '../pages/LoginPage';

// Auth flow is multi-step (username → Continue → password).
// Only step 1 is testable without real credentials.
test.describe('Member login @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('TC-L01 login page loads with username field and Continue button @smoke', async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    await expect(loginPage.passkeyButton).toBeVisible();
  });

  test('TC-L02 empty username submit does not advance to step 2 @negative', async ({ loginPage, page }) => {
    await loginPage.continueButton.click();
    await expect(page).toHaveURL(LoginPage.URL_PATTERN);
    await expect(loginPage.usernameInput).toBeVisible();
  });

  test('TC-L03 invalid email format shows error and stays on login @negative', async ({ loginPage, page }) => {
    await loginPage.usernameInput.fill('notanemail');
    await loginPage.continueButton.click();
    await expect(page).toHaveURL(LoginPage.URL_PATTERN);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.page.getByText('Email is not valid.', { exact: true })).toBeVisible();
  });
});
