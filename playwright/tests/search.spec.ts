import { test, expect } from '../fixtures/pages.fixtures';

test.describe('Search @regression', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.open();
  });

  test('TC-S01 search input is visible on community page @smoke', async ({ searchPage }) => {
    await expect(searchPage.searchInput).toBeVisible();
  });

  test('TC-S02 searching a keyword returns results', async ({ searchPage }) => {
    await searchPage.search('villa');
    await searchPage.expectResultsVisible();
  });

  test('TC-S03 empty search does not navigate away @negative', async ({ searchPage, page }) => {
    await searchPage.searchInput.fill('');
    await searchPage.searchInput.press('Enter');
    await expect(page).toHaveURL(/\/the-community/);
  });
});
