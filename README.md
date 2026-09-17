# Exclusive Resorts — QA Suite

Playwright E2E suite for [public-site.stage.exclusiveresorts.com](https://public-site.stage.exclusiveresorts.com).

## Setup

```bash
npm install
npx playwright install --with-deps chromium
```

## Running tests

| Command | What it runs |
|---|---|
| `npm run test:web` | All UI tests (excludes API) |
| `npm run test:api-endpoints` | API contract tests (chromium) |
| `npm run test:smoke` | `@smoke` tagged cases only |
| `npm run test:regression` | `@regression` tagged cases |
| `npm run test:negative` | `@negative` tagged cases |
| `npm run report` | Open last HTML report |

## CI

GitHub Actions workflow at `.github/workflows/playwright.yml`.

**Manual trigger:** Actions → QA Suite → Run workflow → pick `ui`, `api`, or `both`.

**Auto trigger:** runs both suites on every push/PR to `main`.

Report is published to GitHub Pages after each run on `main`.

## Test coverage

### Inquiry form (`playwright/tests/inquiry-form.spec.ts`)

| ID | Description | Tags |
|---|---|---|
| TC-01 | Page loads with all required fields visible | `@smoke` |
| TC-02 | Submit valid lead shows success message | `@smoke` |
| TC-03 | Empty submit blocks and shows errors | `@negative` |
| TC-06 | Consent required — submit blocked when unchecked | `@negative` |
| TC-07 | XSS payload in Name renders as text, not executed | `@security` |
| TC-13 | Form is keyboard-navigable through all fields | `@accessibility` |
| TC-15 | Double-click Submit does not create duplicate leads | `@regression` (fixme) |

### Navigation & footer (`playwright/tests/navigation-footer.spec.ts`)

Nav links, footer links and social hrefs, Community nav click.

### Search (`playwright/tests/search.spec.ts`)

Search panel opens, keyword returns results, empty search stays on page.

### Login (`playwright/tests/login.spec.ts`)

Member portal login page loads, empty submit blocked, invalid email shows error.

### API endpoints (`playwright/tests/api-endpoints.spec.ts`)

Direct Playwright-based API tests against `/submit-form/` and `/validate-email/`.

## Key design decisions

- **No real CRM leads on any run** — every test that touches the inquiry form uses the `stubbedSubmit` fixture which intercepts `POST /submit-form/` and `GET /validate-email/` before they reach production.
- **Single worker** — tests run against live staging; parallel workers risk interleaved requests.
- **FormKit inputs** — filled via `click()` + `fill()` + `blur()` sequence. `blur()` is required for FormKit to flush the value to its internal model; plain `fill()` is silently discarded.
- **vue-tel-input** — filled with `pressSequentially()` after the FormKit fields are done; shares no reactive state with FormKit so the standard approach works.

## Project structure

```
playwright/
├── fixtures/
│   ├── inquiry.fixtures.ts   # stubbedSubmit + inquiryPage fixtures
│   └── pages.fixtures.ts     # navigationPage, searchPage, loginPage fixtures
├── pages/
│   ├── BasePage.ts
│   ├── InquiryPage.ts
│   ├── NavigationPage.ts
│   ├── SearchPage.ts
│   ├── LoginPage.ts
│   └── CommunityPage.ts
└── tests/
    ├── inquiry-form.spec.ts
    ├── navigation-footer.spec.ts
    ├── search.spec.ts
    ├── login.spec.ts
    ├── community.spec.ts
    └── api-endpoints.spec.ts
postman/
├── collection.json
└── environment.json
```
