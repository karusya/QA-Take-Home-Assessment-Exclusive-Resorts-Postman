import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavigationPage extends BasePage {
  readonly nav: Locator;
  readonly footer: Locator;

  // Nav
  readonly theCollectionLink: Locator;
  readonly membershipLink: Locator;
  readonly communityLink: Locator;
  readonly memberLoginLink: Locator;
  readonly getStartedLink: Locator;

  // Footer — primary links
  readonly footerResidencesLink: Locator;
  readonly footerExperiencesLink: Locator;
  readonly footerClubJournalLink: Locator;
  readonly footerMembershipLink: Locator;
  readonly footerPrivacyPolicyLink: Locator;
  readonly footerTermsLink: Locator;
  readonly footerSitemapLink: Locator;

  // Footer — socials
  readonly instagramLink: Locator;
  readonly youtubeLink: Locator;
  readonly facebookLink: Locator;
  readonly linkedinLink: Locator;

  constructor(page: Page) {
    super(page);
    // getByRole resolves implicit ARIA landmarks (header → banner,
    // footer → contentinfo) without needing an explicit role= attribute.
    this.nav = page.getByRole('banner');
    this.footer = page.getByRole('contentinfo');

    // exact + .first(): the header duplicates every link for the desktop
    // nav bar and the hamburger drawer (both live under the same banner
    // landmark) -- exact avoids "Membership" matching "Member Login", and
    // .first() picks the desktop-visible instance. See CommunityPage.ts.
    this.theCollectionLink = this.nav.getByRole('link', { name: 'The Collection', exact: true }).first();
    this.membershipLink = this.nav.getByRole('link', { name: 'Membership', exact: true }).first();
    this.communityLink = this.nav.getByRole('link', { name: 'Community', exact: true }).first();
    this.memberLoginLink = this.nav.getByRole('link', { name: 'Member Login' }).first();
    this.getStartedLink = this.nav.getByRole('link', { name: 'Get Started' }).first();

    this.footerResidencesLink = this.footer.getByRole('link', { name: 'Residences' });
    this.footerExperiencesLink = this.footer.getByRole('link', { name: 'Experiences' });
    this.footerClubJournalLink = this.footer.getByRole('link', { name: 'Club Journal' });
    this.footerMembershipLink = this.footer.getByRole('link', { name: 'Membership', exact: true });
    this.footerPrivacyPolicyLink = this.footer.getByRole('link', { name: 'Privacy Policy' });
    this.footerTermsLink = this.footer.getByRole('link', { name: 'Terms and Conditions' });
    this.footerSitemapLink = this.footer.getByRole('link', { name: 'Sitemap' });

    this.instagramLink = this.footer.getByRole('link', { name: 'Visit Instagram' });
    this.youtubeLink = this.footer.getByRole('link', { name: 'Visit Youtube' });
    this.facebookLink = this.footer.getByRole('link', { name: 'Visit Facebook' });
    this.linkedinLink = this.footer.getByRole('link', { name: 'Visit LinkedIn' });
  }

  async open(): Promise<void> {
    await this.goto('/the-community/');
    await this.waitForLoad();
  }

  async expectNavVisible(): Promise<void> {
    await expect(this.theCollectionLink).toBeVisible();
    await expect(this.membershipLink).toBeVisible();
    await expect(this.communityLink).toBeVisible();
    await expect(this.memberLoginLink).toBeVisible();
    await expect(this.getStartedLink).toBeVisible();
  }

  async expectFooterVisible(): Promise<void> {
    await expect(this.footerResidencesLink).toBeVisible();
    await expect(this.footerExperiencesLink).toBeVisible();
    await expect(this.footerClubJournalLink).toBeVisible();
    await expect(this.footerPrivacyPolicyLink).toBeVisible();
    await expect(this.footerTermsLink).toBeVisible();
    await expect(this.instagramLink).toBeVisible();
    await expect(this.youtubeLink).toBeVisible();
    await expect(this.facebookLink).toBeVisible();
    await expect(this.linkedinLink).toBeVisible();
  }
}
