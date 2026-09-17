import { test, expect } from '../fixtures/pages.fixtures';

test.describe('Navigation and footer @regression', () => {
  test.beforeEach(async ({ navigationPage }) => {
    await navigationPage.open();
  });

  test('TC-N01 main nav links are visible @smoke', async ({ navigationPage }) => {
    await navigationPage.expectNavVisible();
  });

  test('TC-N02 nav links point to correct hrefs @smoke', async ({ navigationPage }) => {
    await expect(navigationPage.theCollectionLink).toHaveAttribute('href', /\/the-collection/);
    await expect(navigationPage.membershipLink).toHaveAttribute('href', /\/membership/);
    await expect(navigationPage.communityLink).toHaveAttribute('href', /\/the-community/);
    await expect(navigationPage.memberLoginLink).toHaveAttribute('href', 'https://member.exclusiveresorts.com/');
    await expect(navigationPage.getStartedLink).toHaveAttribute('href', /\/inquire/);
  });

  test('TC-N03 footer links are visible @smoke', async ({ navigationPage }) => {
    await navigationPage.expectFooterVisible();
  });

  test('TC-N04 footer links point to correct hrefs', async ({ navigationPage }) => {
    await expect(navigationPage.footerResidencesLink).toHaveAttribute('href', /\/residences/);
    await expect(navigationPage.footerExperiencesLink).toHaveAttribute('href', /\/experiences/);
    await expect(navigationPage.footerClubJournalLink).toHaveAttribute('href', /\/club-journal/);
    await expect(navigationPage.footerPrivacyPolicyLink).toHaveAttribute('href', /\/privacy-policy/);
    await expect(navigationPage.footerTermsLink).toHaveAttribute('href', /\/legal-notices/);
    await expect(navigationPage.footerSitemapLink).toHaveAttribute('href', /\/sitemap/);
  });

  test('TC-N05 footer social links point to correct external hrefs', async ({ navigationPage }) => {
    await expect(navigationPage.instagramLink).toHaveAttribute('href', /instagram\.com\/exclusiveresorts/);
    await expect(navigationPage.youtubeLink).toHaveAttribute('href', /youtube\.com/);
    await expect(navigationPage.facebookLink).toHaveAttribute('href', /facebook\.com\/ExclusiveResorts/);
    await expect(navigationPage.linkedinLink).toHaveAttribute('href', /linkedin\.com\/company\/exclusive-resorts/);
  });

  test('TC-N06 Community nav link navigates to community page', async ({ navigationPage, page }) => {
    await navigationPage.communityLink.click();
    await expect(page).toHaveURL(/\/the-community/);
  });
});
