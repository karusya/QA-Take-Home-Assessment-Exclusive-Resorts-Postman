import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the search overlay on the Community page.
 *
 * Notes on the live implementation (confirmed via direct DOM inspection and
 * real searches against https://public-site.stage.exclusiveresorts.com/the-community/,
 * 2026-09-18):
 * - The trigger is a bare `<a class="search-btn">` with NO accessible name
 *   (icon-only SVG, no aria-label/aria-controls) -- a real accessibility
 *   gap, same pattern as BUG-02/BUG-04 in BUG-REPORT.md. Two copies exist
 *   in the DOM at once (duplicate header/nav markup, same as
 *   CommunityPage.ts's notes) -- `.first()` is required, not optional; an
 *   unscoped `.click()` here is a strict-mode violation waiting to happen.
 * - `.search-panel` is `display:none` until the trigger is clicked, then
 *   flips to `display:flex` -- confirmed via a real click + visibility
 *   check, not assumed from markup alone.
 * - `.search-results-wrapper` becomes visible on ANY non-empty input,
 *   whether or not there are matches -- confirmed live (a query with zero
 *   matches still shows the wrapper). It is NOT proof that results were
 *   returned, so don't use it alone to assert "search returns results".
 * - The real "zero matches" signal is `.search-results-none-wrapper`:
 *   conditionally RENDERED (not just hidden) only when there are no
 *   matches -- confirmed absent from the DOM entirely on a query with real
 *   hits. Results themselves are grouped into up to four
 *   `.search-result-list` blocks (destinations / experiences / club
 *   journal / a fourth, unlabeled, empty in every query tried).
 *   "villa" is confirmed to return real matches (7 destinations, 2 club
 *   journal articles) -- safe to keep as the TC-S02 query.
 */
export class SearchPage extends BasePage {
  readonly searchTrigger: Locator;
  readonly searchInput: Locator;
  readonly resultsWrapper: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.searchTrigger = page.locator('a.search-btn').first();
    this.searchInput = page.locator('.search-panel .search-input-field');
    this.resultsWrapper = page.locator('.search-results-wrapper');
    this.noResultsMessage = page.locator('.search-results-none-wrapper');
  }

  async open(): Promise<void> {
    await this.goto('/the-community/');
    await this.waitForLoad();
    await this.searchTrigger.click();
    await expect(this.searchInput).toBeVisible();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  /** Asserts at least one real match was returned -- not just that the results area rendered. */
  async expectResultsVisible(): Promise<void> {
    await expect(this.resultsWrapper).toBeVisible();
    await expect(this.noResultsMessage).not.toBeVisible();
  }
}
