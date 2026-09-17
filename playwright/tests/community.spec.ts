import { test, expect } from '@playwright/test';
import { CommunityPage } from '../pages/CommunityPage';

/**
 * Coverage for the public Community/events page
 * (https://public-site.stage.exclusiveresorts.com/the-community/).
 *
 * Out of scope for the take-home assignment (which is /inquire/ only) --
 * added as bonus coverage, in the same spirit as BUG-10/11 in
 * BUG-REPORT.md, which were originally found on this page's mobile
 * "Filter by Category" panel. See CommunityPage.ts's docstring for the
 * live-DOM notes this file relies on (duplicate header markup, the
 * desktop-vs-mobile filter UI split, the unconfirmed search trigger).
 *
 * Tags: @community (all of this file), @regression, @smoke.
 */
test.describe('Community page (bonus, outside /inquire/ scope) @community', () => {
  test('TC-C01 page loads with header, main content, and event cards visible @smoke', async ({
    page,
  }) => {
    const community = new CommunityPage(page);
    await community.open();
    await expect(community.header).toBeVisible();
    await expect(community.footer).toBeVisible();
    await expect(community.eventCards.first()).toBeVisible();
    expect(await community.eventCards.count()).toBeGreaterThan(0);
  });

  test('TC-C02 primary nav links point at the right destinations @regression', async ({ page }) => {
    const community = new CommunityPage(page);
    await community.open();
    await expect(community.headerGetStartedLink).toHaveAttribute('href', '/inquire/');
    await expect(community.headerMemberLoginLink).toHaveAttribute(
      'href',
      'https://member.exclusiveresorts.com/'
    );
    await expect(community.headerCollectionNavLink).toHaveAttribute('href', /\/the-collection\/?$/);
    await expect(community.headerMembershipNavLink).toHaveAttribute('href', /\/membership\/?$/);
    await expect(community.headerCommunityNavLink).toHaveAttribute('href', /\/the-community\/?$/);
  });

  test('TC-C03 "Community Events" filter navigates to the filtered URL @regression', async ({
    page,
  }) => {
    const community = new CommunityPage(page);
    await community.open();
    await community.communityEventsFilterLink.click();
    await expect(page).toHaveURL(/\?category=community-events/);
  });

  test('TC-C04 "View More Events" pagination navigates to page 2 @regression', async ({ page }) => {
    const community = new CommunityPage(page);
    await community.open();
    await expect(community.resultsCountText).toBeVisible();
    await community.viewMoreEventsLink.click();
    await expect(page).toHaveURL(/\?page=2/);
  });

  test('TC-C05 footer links point at the right destinations @regression', async ({ page }) => {
    const community = new CommunityPage(page);
    await community.open();
    await expect(community.footerRequestInfoLink).toHaveAttribute('href', '/inquire/');
    await expect(community.footerResidencesLink).toHaveAttribute('href', /\/residences\/?$/);
    await expect(community.footerExperiencesLink).toHaveAttribute('href', /\/experiences\/?$/);
    await expect(community.footerClubJournalLink).toHaveAttribute('href', /\/club-journal\/?$/);
    await expect(community.footerServicesStandardsLink).toHaveAttribute(
      'href',
      /\/membership\/services-standards\/?$/
    );
    await expect(community.footerSitemapLink).toHaveAttribute('href', /\/sitemap\/?$/);
    await expect(community.footerPrivacyPolicyLink).toHaveAttribute('href', /\/privacy-policy\/?$/);
    await expect(community.footerCookiePreferencesButton).toBeVisible();
  });

  test.describe('Mobile "Filter by Category" panel', () => {
    // Forces this block to the 375px viewport regardless of which project
    // runs it -- the "Filters" button + full-panel UI only appears at
    // narrow widths (confirmed live; the 1440px layout shows an inline
    // filter bar instead, with no "Filters" button at all).
    test.use({ viewport: { width: 375, height: 812 } });

    test('TC-C06 Filters button opens the panel; close button closes it @regression', async ({
      page,
    }) => {
      const community = new CommunityPage(page);
      await community.open();
      await expect(community.filterPanelHeading).not.toBeVisible();

      await community.filtersButton.click();
      await expect(community.filterPanelHeading).toBeVisible();
      await expect(community.filterPanelApplyButton).toBeVisible();
      await expect(community.filterPanelClearButton).toBeVisible();

      await community.filterPanelCloseButton.click();
      await expect(community.filterPanelHeading).not.toBeVisible();
    });

    test('TC-C07 background scroll is not locked while the panel is open -> BUG-11 @regression', async ({
      page,
    }) => {
      const community = new CommunityPage(page);
      await community.open();
      await community.filtersButton.click();
      await expect(community.filterPanelHeading).toBeVisible();

      const beforeScrollY = await community.pageScrollY();
      // Attempt to scroll from inside the open panel -- per BUG-11 (found
      // during exploratory testing, see BUG-REPORT.md), this moves the page
      // behind the overlay instead of the panel's own content.
      await page.mouse.move(200, 400);
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(200);
      const afterScrollY = await community.pageScrollY();

      // Documents ACTUAL live behavior (the bug: background scroll is not
      // locked). Once BUG-11 is fixed, flip this to
      // expect(afterScrollY).toBe(beforeScrollY).
      expect(afterScrollY).not.toBe(beforeScrollY);
    });
  });
});
