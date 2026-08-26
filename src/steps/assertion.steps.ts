import { Then, type DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { ChWorld } from '../support/world';

Then('I should see the heading {string}', async function (this: ChWorld, expected: string) {
  expect(await this.gds().heading()).toBe(expected);
});

Then('I should see {string}', async function (this: ChWorld, text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible();
});

// -- declared values ------------------------------------------------------

Then(
  'the {string} should be {string}',
  async function (this: ChWorld, name: string, expected: string) {
    await expect(this.gds().value(name)).toHaveText(expected);
  },
);

Then(
  'the {string} should contain {string}',
  async function (this: ChWorld, name: string, expected: string) {
    await expect(this.gds().value(name)).toContainText(expected);
  },
);

// -- declared lists -------------------------------------------------------

Then(
  'there should be at least {int} {string}',
  async function (this: ChWorld, minimum: number, list: string) {
    const items = this.gds().list(list);
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThanOrEqual(minimum);
  },
);

Then(
  'the list of {string} should include {string}',
  async function (this: ChWorld, list: string, expected: string) {
    await expect(this.gds().list(list).filter({ hasText: expected }).first()).toBeVisible();
  },
);

// -- GOV.UK error summary -------------------------------------------------

/**
 * Assert the GOV.UK error summary, one message per row:
 *
 *   Then I should see the error summary:
 *     | Select the type of accounts you have prepared |
 */
Then('I should see the error summary:', async function (this: ChWorld, table: DataTable) {
  const expected = table.raw().map(([message]) => message?.trim()).filter(Boolean);
  await expect(this.page.locator('.govuk-error-summary')).toBeVisible();
  expect(await this.gds().errors()).toEqual(expected);
});

Then('I should not see an error summary', async function (this: ChWorld) {
  await expect(this.page.locator('.govuk-error-summary')).toHaveCount(0);
});
