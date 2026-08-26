import type { Locator, Page } from '@playwright/test';
import type { FieldSpec, PageDefinition } from '../pages/types';

/**
 * Drives one page using its PageDefinition.
 *
 * Every Companies House service is built from the same GOV.UK Design System
 * components, so the knowledge of *how* to operate a text input, a radio group,
 * a checkbox group or a day/month/year date input lives here, once. A page
 * definition only has to say which component a field is.
 */
export class GdsPage {
  private sectionsRevealed = false;

  constructor(
    readonly page: Page,
    readonly definition: PageDefinition,
  ) {}

  // -- writing ------------------------------------------------------------

  async set(fieldName: string, value: string): Promise<void> {
    const spec = this.field(fieldName);
    await this.revealSections();

    switch (spec.type) {
      case 'text':
        await this.page.locator(`#${spec.id}`).fill(value);
        return;

      case 'select':
        await this.page.locator(`#${spec.id}`).selectOption({ label: value });
        return;

      case 'radioGroup': {
        const option = await this.option(spec.name, value);
        await this.setChecked(option, true);
        return;
      }

      case 'checkbox': {
        const input = this.page.locator(`#${spec.id}`);
        const label = this.page.locator(`label[for="${spec.id}"]`);
        await this.setChecked({ input, label }, isAffirmative(value));
        return;
      }

      case 'checkboxGroup': {
        for (const choice of splitList(value)) {
          const option = await this.option(spec.name, choice);
          await this.setChecked(option, true);
        }
        return;
      }

      case 'date': {
        const { day, month, year } = parseDate(value);
        await this.page.locator(`#${spec.day}`).fill(day);
        await this.page.locator(`#${spec.month}`).fill(month);
        await this.page.locator(`#${spec.year}`).fill(year);
        return;
      }
    }
  }

  // -- reading ------------------------------------------------------------

  async heading(): Promise<string> {
    const h1 = this.page.locator('h1').first();
    if ((await h1.count()) === 0) return '';
    return (await h1.innerText()).trim();
  }

  /** Messages listed in the GOV.UK error summary, in page order. */
  async errors(): Promise<string[]> {
    const items = this.page.locator('.govuk-error-summary__list li');
    return (await items.allInnerTexts()).map((text) => text.trim()).filter(Boolean);
  }

  value(name: string): Locator {
    return this.page.locator(this.lookup('values', name));
  }

  list(name: string): Locator {
    return this.page.locator(this.lookup('lists', name));
  }

  // -- acting -------------------------------------------------------------

  async submit(): Promise<void> {
    const selector = this.definition.submit;
    if (!selector) {
      throw new Error(
        `Page "${this.definition.name}" has no submit control defined. ` +
          `Add a "submit" selector to its page definition.`,
      );
    }
    await this.page.locator(selector).click();
    await this.settle();
  }

  /**
   * Go back the way a user would. Companies House uses `.govuk-back-link` on
   * most pages and `.link-back` (a `history.back()` anchor) on the accounts
   * guide pages; where neither exists, browser history is the same journey.
   */
  async back(): Promise<void> {
    const backLink = this.page.locator('.govuk-back-link, .link-back').first();
    if ((await backLink.count()) > 0) {
      await backLink.click();
    } else {
      await this.page.goBack();
    }
    await this.settle();
  }

  /** Click a named control, falling back to any link or button with that text. */
  async click(name: string): Promise<void> {
    const declared = this.definition.actions?.[name];
    const target = declared
      ? this.page.locator(declared)
      : this.page.getByRole('link', { name, exact: false }).or(
          this.page.getByRole('button', { name, exact: false }),
        );

    if ((await target.count()) === 0) {
      throw new Error(
        `No control called "${name}" on page "${this.definition.name}". ` +
          `Declared actions: ${Object.keys(this.definition.actions ?? {}).join(', ') || '(none)'}`,
      );
    }
    await target.first().click();
    await this.settle();
  }

  private async settle(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * GOV.UK accordions and <details> collapse as soon as JavaScript runs, so
   * their fields exist in the DOM but are not operable. Advanced search puts
   * every filter inside one. Open them the way a user does, once per page.
   */
  private async revealSections(): Promise<void> {
    if (this.sectionsRevealed) return;
    this.sectionsRevealed = true;

    const showAll = this.page.locator('.govuk-accordion__show-all').first();
    if ((await showAll.count()) > 0 && (await showAll.getAttribute('aria-expanded')) !== 'true') {
      await showAll.click();
    }

    const collapsed = this.page.locator('details:not([open]) > summary');
    for (let index = 0; index < (await collapsed.count()); index += 1) {
      await collapsed.nth(index).click();
    }
  }

  // -- internals ----------------------------------------------------------

  private field(name: string): FieldSpec {
    const spec = this.definition.fields?.[name];
    if (spec) return spec;
    throw new Error(
      `Page "${this.definition.name}" has no field called "${name}". ` +
        `Known fields: ${Object.keys(this.definition.fields ?? {}).join(', ') || '(none)'}`,
    );
  }

  private lookup(kind: 'values' | 'lists', name: string): string {
    const selector = this.definition[kind]?.[name];
    if (selector) return selector;
    throw new Error(
      `Page "${this.definition.name}" declares no ${kind} entry called "${name}". ` +
        `Known: ${Object.keys(this.definition[kind] ?? {}).join(', ') || '(none)'}`,
    );
  }

  /**
   * Resolve one option of a radio/checkbox group by its visible label.
   *
   * GOV.UK renders the real input visually hidden behind a styled label, so the
   * label is both what the user sees and what the user clicks.
   */
  private async option(
    groupName: string,
    optionLabel: string,
  ): Promise<{ input: Locator; label: Locator }> {
    const inputs = this.page.locator(`input[name="${groupName}"]`);
    const count = await inputs.count();
    const wanted = optionLabel.trim().toLowerCase();
    const seen: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const input = inputs.nth(index);
      const id = await input.getAttribute('id');
      if (!id) continue;

      const label = this.page.locator(`label[for="${id}"]`);
      if ((await label.count()) === 0) continue;

      const text = (await label.innerText()).trim();
      seen.push(text);
      if (text.toLowerCase() === wanted) return { input, label: label.first() };
    }

    throw new Error(
      `No option "${optionLabel}" in group "${groupName}" on page ` +
        `"${this.definition.name}". Available: ${seen.join(', ') || '(none)'}`,
    );
  }

  private async setChecked(
    option: { input: Locator; label: Locator },
    desired: boolean,
  ): Promise<void> {
    const isChecked = await option.input.isChecked();
    if (isChecked !== desired) await option.label.click();
  }
}

// -- value parsing --------------------------------------------------------

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function isAffirmative(value: string): boolean {
  return ['yes', 'true', 'on', 'checked'].includes(value.trim().toLowerCase());
}

/** Accepts 27/11/1947, 27-11-1947, 27 11 1947 and 1947-11-27. */
export function parseDate(value: string): { day: string; month: string; year: string } {
  const parts = value.trim().split(/[/\-.\s]+/).filter(Boolean);
  if (parts.length !== 3) {
    throw new Error(`Cannot read "${value}" as a date. Use 27/11/1947 or 1947-11-27.`);
  }
  const [first, middle, last] = parts as [string, string, string];
  return first.length === 4
    ? { day: last, month: middle, year: first }
    : { day: first, month: middle, year: last };
}
