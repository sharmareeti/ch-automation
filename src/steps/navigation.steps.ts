import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { pageByName } from '../pages';
import type { ChWorld } from '../support/world';

Given('I am on the {string} page', async function (this: ChWorld, name: string) {
  await this.open(pageByName(name));
});

Given(
  'I am on the {string} page for {string}',
  async function (this: ChWorld, name: string, value: string) {
    await this.open(pageByName(name), value);
  },
);

When('I continue', async function (this: ChWorld) {
  await this.gds().submit();
  await this.sync();
});

When('I continue without answering', async function (this: ChWorld) {
  await this.gds().submit();
  await this.sync();
});

When('I go back', async function (this: ChWorld) {
  await this.gds().back();
  await this.sync();
});

When('I click {string}', async function (this: ChWorld, name: string) {
  await this.gds().click(name);
  await this.sync();
});

Then('I should be on the {string} page', async function (this: ChWorld, name: string) {
  const expected = pageByName(name);
  const actual = this.gds().definition;

  expect(
    actual.id,
    `Expected the "${expected.name}" page but found ${await this.describeCurrent()}`,
  ).toBe(expected.id);

  if (expected.urlPattern) expect(this.page.url()).toMatch(expected.urlPattern);
});
