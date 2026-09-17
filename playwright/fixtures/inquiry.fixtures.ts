import { test as base, expect, Route } from '@playwright/test';
import { InquiryPage, InquiryFormData } from '../pages/InquiryPage';

type InquiryFixtures = {
  inquiryPage: InquiryPage;
  /**
   * Stubs the POST to the submit-form endpoint so no test ever creates a
   * real CRM lead. Captures the outgoing request(s) so tests can assert
   * on the payload and on how many times the endpoint was actually
   * called (e.g. for a double-submit test). Fulfils with the real shape
   * observed from the live endpoint: `{ data: { id: <number> } }`.
   */
  stubbedSubmit: { getLastRequestBody: () => unknown; getCallCount: () => number };
};

export const validContact: InquiryFormData = {
  firstName: 'QA Candidate',
  lastName: 'Karina Zhdanova',
  // NOTE: the live validate-email endpoint (see BUG-01 in the bug report)
  // rejects several syntactically-valid addresses inconsistently, so tests
  // that stub the network (the default here) use a domain confirmed to
  // pass validation during exploratory testing. Tests that exercise the
  // *unstubbed* live validation should use validEmailOnLiveSite below.
  email: 'qa.candidate+test@example.com',
  postalCode: '80202',
  phone: '912965084',
  contactMethod: 'Email',
};

// Confirmed against the live /validate-email/ endpoint on 2026-09-15.
export const validEmailOnLiveSite = 'karina.zhd+test@gmail.com';

export const test = base.extend<InquiryFixtures>({
  // Depends on stubbedSubmit so the CRM route is always intercepted,
  // even in tests that don't declare stubbedSubmit explicitly.
  inquiryPage: async ({ page, stubbedSubmit: _ }, use) => {
    const inquiryPage = new InquiryPage(page);
    await inquiryPage.open();
    await use(inquiryPage);
  },

  stubbedSubmit: async ({ page }, use) => {
    let lastBody: unknown = null;
    let callCount = 0;

    await page.route('**/submit-form/', async (route: Route) => {
      callCount += 1;
      const request = route.request();
      try {
        lastBody = request.postDataJSON();
      } catch {
        lastBody = request.postData();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 999999 } }),
      });
    });

    // Never let a test using this fixture hit the real CRM even if a step
    // forgets to await the route above -- also stub validate-email so
    // client-side checks don't block on the live (rate-limited) endpoint.
    await page.route('**/validate-email/', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true }),
      });
    });

    await use({ getLastRequestBody: () => lastBody, getCallCount: () => callCount });
  },
});

export { expect };
