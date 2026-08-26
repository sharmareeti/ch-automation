# Companies House UI automation

BDD automation for Companies House online forms, built with Cucumber, TypeScript
and Playwright.

The suite runs against the live public service at
`find-and-update.company-information.service.gov.uk`.

## The idea

Every Companies House service is assembled from the same GOV.UK Design System
components: text inputs, radio groups, checkbox groups, day/month/year date
inputs, an error summary, a back link, a continue button.

So the framework separates two things:

- **How a component works** lives in `src/gds/gds-page.ts`, written once.
- **What is on a page** lives in `src/pages/*.pages.ts`, written as data.

Step definitions read those page definitions at runtime. Adding a new form means
adding a page definition and writing Gherkin against it. It does not mean writing
new step definitions.

That is what lets one deliverable cover different forms and flows.

## Quick start

```bash
npm install          # also installs the Chromium build Playwright needs
npm test             # run everything
npm run test:smoke   # the @smoke subset
npm run test:headed  # watch it in a real browser
npm run test:debug   # headed, slowed down to 250ms per action
```

Reports land in `reports/cucumber-report.html`.

## What is covered

| Feature | What it exercises |
| --- | --- |
| `accounts-type-wizard.feature` | The public part of the "File your company annual accounts" journey: a five-way branching question, its validation, and going back to change the answer |
| `advanced-search.feature` | The widest form on the service: free text, date inputs and two large checkbox groups, all inside a collapsible accordion |
| `company-search.feature` | Search the register, open a company record, move to its filing history |

## Step vocabulary

The whole vocabulary is below. It is deliberately small, and none of it is
specific to a particular form.

**Navigation**

```gherkin
Given I am on the "Advanced company search" page
Given I am on the "Company profile" page for "00445790"
When I continue
When I continue without answering
When I go back
When I click "Filing history"
Then I should be on the "Advanced search results" page
```

**Filling forms**

```gherkin
When I set "company name contains" to "tesco"

When I fill in:
  | company name contains | tesco      |
  | company status        | Active     |
  | incorporated from     | 01/01/1990 |
```

One step drives every component type. The page definition decides whether
`company status` is a checkbox group and `incorporated from` is a date input;
the feature file just states the intent.

**Assertions**

```gherkin
Then I should see the heading "Search results"
Then I should see "Companies House"
Then the "company number" should be "00445790"
Then the "incorporation date" should contain "1947"
Then there should be at least 1 "results"
Then the list of "results" should include "TESCO PLC"
Then I should see the error summary:
  | Select the type of accounts you have prepared |
Then I should not see an error summary
```

## Adding a form or a flow

1. Add a `PageDefinition` to a file in `src/pages/`:

```ts
{
  id: 'confirmation-statement',
  name: 'Confirmation statement',
  path: '/confirmation-statement',
  heading: 'Review your confirmation statement',
  urlPattern: /\/confirmation-statement/,
  fields: {
    'trading status': { type: 'radioGroup', name: 'tradingStatus' },
    'review date': {
      type: 'date',
      day: 'review-day', month: 'review-month', year: 'review-year',
    },
  },
  submit: '#submit',
}
```

2. Register it in `src/pages/index.ts`.
3. Write a `.feature` file using the vocabulary above.

No new step definitions.

A page definition has four optional maps, all keyed by the name you want to use
in Gherkin:

| Map | Purpose |
| --- | --- |
| `fields` | writable controls |
| `values` | read-only text to assert |
| `lists` | repeated items to count or search |
| `actions` | named clickable controls |

### Multi-page journeys

The framework does not encode routes. After a submit it works out which
registered page it landed on by matching URL and heading, and the feature file
states where it expected to be. A branching wizard therefore needs no routing
table -- see the five-way branch in `accounts-type-wizard.feature`.

## Diagnostics

Failures are meant to be readable without opening the browser.

```
Error: Page "Advanced company search" has no field called "compny name contains".
Known fields: company name contains, company name excludes, registered office
address, sic codes, incorporated from, incorporated to, ...

Error: No option "Tiny accounts" in group "selectedAccountTypeName" on page
"Select account type". Available: Micro-entity accounts, Abridged accounts,
Full accounts, Dormant company accounts, Package accounts

Error: Expected the "Package accounts filing" page but found Full accounts
criteria (h1 "File full accounts with Companies House", https://...)
```

Every failing scenario attaches a full-page screenshot and the failing URL.
Run with `TRACE=true` to also write a Playwright trace per failure:

```bash
npm run test:trace
npx playwright show-trace reports/traces/<scenario-name>.zip
```

## Configuration

Copy `.env.example` to `.env`, or set the variables directly.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | the live service | Target environment |
| `BROWSER` | `chromium` | `chromium`, `firefox` or `webkit` |
| `HEADLESS` | `true` | Set `false` to watch the run |
| `SLOW_MO` | `0` | Milliseconds to pause between actions |
| `TIMEOUT` | `30000` | Per-action timeout |
| `TRACE` | `false` | Record Playwright traces for failures |

## Scope: what cannot be automated here

Every Companies House service that actually *files* something is behind
GOV.UK One Login, and the accounts service additionally needs a company
authentication code. Verified against the live service:

- `/close-a-company/who-to-tell` (DS01 strike off) redirects to sign-in
- `/efs-submission/new-submission` (upload a document) redirects to sign-in
- selecting an account type ends at a guidance page that hands off to
  `ewf.companieshouse.gov.uk`, which requires sign-in

So the deep filing wizards are out of reach without credentials, and driving
them with real credentials would submit real statutory filings. This suite
covers the publicly reachable forms and journeys, which between them exercise
every GOV.UK component the driver supports.

If a test environment with credentials becomes available, point `BASE_URL` at it
and add page definitions for the pages behind the sign-in wall. Nothing in the
framework needs to change.

## Layout

```
features/                    Gherkin, one file per journey
src/
  config/env.ts              Environment configuration
  gds/gds-page.ts            How each GOV.UK component is operated
  pages/
    types.ts                 The PageDefinition shape
    registry.ts              Page lookup and "which page am I on?" detection
    *.pages.ts               The page definitions themselves
  steps/                     Generic step definitions (three small files)
  support/
    world.ts                 Per-scenario browser state
    hooks.ts                 Browser lifecycle, screenshots, traces
```

## Requirements

Node 20 or newer.
