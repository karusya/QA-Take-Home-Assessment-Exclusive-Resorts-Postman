import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the public Community/events page.
 *
 * Notes on the live implementation (captured via DOM/accessibility-tree
 * inspection on https://public-site.stage.exclusiveresorts.com/the-community/,
 * 2026-09-17). This page is outside the take-home's official scope
 * (/inquire/ only) -- added as bonus coverage, same spirit as BUG-10/11 in
 * BUG-REPORT.md, which were found on this same "Filter by Category" panel.
 *
 * - The header renders the SAME link text (e.g. "Get Started", "Member
 *   Login", "Membership") more than once in the DOM at once -- a visible
 *   desktop nav bar plus a hamburger-triggered off-canvas drawer with its
 *   own copy of every link, both apparently living under the <header>
 *   (role=banner) landmark regardless of which is currently laid out.
 *   Locators below are scoped to `header` to exclude the footer's separate
 *   copies, and use `.first()` to resolve the header-internal duplication
 *   -- this suite only asserts against the desktop-visible instance.
 * - The category/interest filter renders as an inline link bar on wide
 *   viewports ("All / Community Events / Once-in-a-Lifetime Journeys /
 *   Member Experiences" plus an "All Interests" dropdown button) and as a
 *   full-screen "Filter by Category" panel on narrow ones, opened by a
 *   "Filters" button -- confirmed live at 571px width; not present in the
 *   1440px layout. This is the exact panel BUG-10 and BUG-11 were found on.
 * - Filter links are plain `<a href>` with a `?category=`/`?interest=`
 *   query param -- clicking one is a real navigation, safe to assert the
 *   resulting URL against.
 * - The header's search trigger (top-right icon) is a bare `<a>` with no
 *   accessible name; clicking it in manual testing did not visibly open
 *   anything (unlike the two explicitly-labeled "Search" buttons inside the
 *   off-canvas drawer, which were never reached). Not implemented here --
 *   confirm the real open mechanism before automating it.
 * - "Member Login" links out to a different origin
 *   (member.exclusiveresorts.com) -- only its href is asserted; there are
 *   no test credentials for that app and it's a separate system outside
 *   this suite's scope.
 */
export class CommunityPage extends BasePage {
  readonly header: Locator;
  readonly footer: Locator;
  readonly main: Locator;

  readonly headerGetStartedLink: Locator;
  readonly headerMemberLoginLink: Locator;
  readonly headerCollectionNavLink: Locator;
  readonly headerMembershipNavLink: Locator;
  readonly headerCommunityNavLink: Locator;

  readonly allFilterLink: Locator;
  readonly communityEventsFilterLink: Locator;
  readonly onceInALifetimeFilterLink: Locator;
  readonly memberExperiencesFilterLink: Locator;
  readonly allInterestsDropdownButton: Locator;

  readonly resultsCountText: Locator;
  readonly viewMoreEventsLink: Locator;
  readonly eventCards: Locator;

  /** Mobile-only "Filter by Category" panel -- see class docstring. */
  readonly filtersButton: Locator;
  readonly filterPanelHeading: Locator;
  readonly filterPanelCloseButton: Locator;
  readonly filterPanelApplyButton: Locator;
  readonly filterPanelClearButton: Locator;

  readonly footerRequestInfoLink: Locator;
  readonly footerResidencesLink: Locator;
  readonly footerExperiencesLink: Locator;
  readonly footerClubJournalLink: Locator;
  readonly footerCommunityLink: Locator;
  readonly footerServicesStandardsLink: Locator;
  readonly footerVipAccessLink: Locator;
  readonly footerHowItWorksLink: Locator;
  readonly footerSitemapLink: Locator;
  readonly footerTermsLink: Locator;
  readonly footerPrivacyPolicyLink: Locator;
  readonly footerCookiePreferencesButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('banner');
    this.footer = page.getByRole('contentinfo');
    this.main = page.getByRole('main');

    // .first() resolves the header-internal duplication -- see docstring.
    this.headerGetStartedLink = this.header.getByRole('link', { name: 'Get Started' }).first();
    this.headerMemberLoginLink = this.header.getByRole('link', { name: 'Member Login' }).first();
    this.headerCollectionNavLink = this.header
      .getByRole('link', { name: 'The Collection', exact: true })
      .first();
    this.headerMembershipNavLink = this.header
      .getByRole('link', { name: 'Membership', exact: true })
      .first();
    this.headerCommunityNavLink = this.header
      .getByRole('link', { name: 'Community', exact: true })
      .first();

    this.allFilterLink = this.main.getByRole('link', { name: 'All', exact: true });
    this.communityEventsFilterLink = this.main
      .getByRole('link', { name: 'Community Events', exact: true })
      .first();
    this.onceInALifetimeFilterLink = this.main
      .getByRole('link', { name: 'Once-in-a-Lifetime Journeys', exact: true })
      .first();
    this.memberExperiencesFilterLink = this.main
      .getByRole('link', { name: 'Member Experiences', exact: true })
      .first();
    this.allInterestsDropdownButton = this.main.getByRole('button', { name: 'All Interests' });

    this.resultsCountText = this.main.getByText(/showing \d+ of \d+/i);
    this.viewMoreEventsLink = this.main.getByRole('link', { name: 'View More Events' });
    // Includes both the "FEATURED" cards and the main grid cards -- fine
    // for a broad "the grid rendered something" smoke check.
    this.eventCards = this.main.locator('article');

    // Rendered near the end of <body> (portal/modal root), not nested
    // under header/main/footer -- scoped at page level.
    this.filtersButton = page.getByRole('button', { name: 'Filters' });
    this.filterPanelHeading = page.getByText('Filter by Category', { exact: true });
    this.filterPanelCloseButton = page.getByRole('button', { name: 'Close quickview' });
    this.filterPanelApplyButton = page.getByRole('button', { name: 'Apply' });
    this.filterPanelClearButton = page.getByRole('button', { name: 'Clear' });

    this.footerRequestInfoLink = this.footer.getByRole('link', { name: 'Request More Information' });
    this.footerResidencesLink = this.footer.getByRole('link', { name: 'Residences' });
    this.footerExperiencesLink = this.footer.getByRole('link', { name: 'Experiences' });
    this.footerClubJournalLink = this.footer.getByRole('link', { name: 'Club Journal' });
    this.footerCommunityLink = this.footer.getByRole('link', { name: 'Community', exact: true });
    this.footerServicesStandardsLink = this.footer.getByRole('link', { name: 'Services & Standards' });
    this.footerVipAccessLink = this.footer.getByRole('link', { name: 'VIP Access' });
    this.footerHowItWorksLink = this.footer.getByRole('link', { name: 'How It Works & Plans' });
    this.footerSitemapLink = this.footer.getByRole('link', { name: 'Sitemap' });
    this.footerTermsLink = this.footer.getByRole('link', { name: 'Terms and Conditions' });
    this.footerPrivacyPolicyLink = this.footer.getByRole('link', { name: 'Privacy Policy' });
    this.footerCookiePreferencesButton = this.footer.getByRole('button', { name: 'Cookie Preferences' });
  }

  async open(): Promise<void> {
    await this.goto('/the-community/');
    await expect(this.main).toBeVisible();
  }

  /** Current vertical scroll position of the page behind any open overlay. */
  async pageScrollY(): Promise<number> {
    return this.page.evaluate(() => window.scrollY);
  }
}
