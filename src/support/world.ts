import { World, setWorldConstructor, type IWorldOptions } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { env } from '../config/env';
import { GdsPage } from '../gds/gds-page';
import { detectPage, readHeading, type PageDefinition } from '../pages';

export class ChWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  /** The page the browser is currently on, once identified. */
  private current?: GdsPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Open a page definition directly, filling its `{value}` placeholder if present. */
  async open(definition: PageDefinition, value?: string): Promise<void> {
    if (!definition.path) {
      throw new Error(
        `Page "${definition.name}" has no path, so it cannot be opened directly. ` +
          `Reach it by navigating from another page.`,
      );
    }

    let path = definition.path;
    if (path.includes('{value}')) {
      if (value === undefined) {
        throw new Error(`Page "${definition.name}" needs a value, e.g. the ... page for "..."`);
      }
      path = path.replace('{value}', encodeURIComponent(value));
    }

    await this.page.goto(new URL(path, env.baseUrl).toString());
    await this.dismissCookieBanner();
    this.current = new GdsPage(this.page, definition);
  }

  /**
   * Re-identify the current page after a navigation. Called by every step that
   * causes one, so the .feature file never has to say which page it is on twice.
   */
  async sync(): Promise<void> {
    await this.dismissCookieBanner();
    const definition = await detectPage(this.page);
    if (definition) this.current = new GdsPage(this.page, definition);
  }

  /** The current page, or a clear error explaining that no page is open. */
  gds(): GdsPage {
    if (!this.current) {
      throw new Error('No page is open. Start the scenario with a Given ... page step.');
    }
    return this.current;
  }

  /** What the framework thinks it is looking at, for assertion failures. */
  async describeCurrent(): Promise<string> {
    const heading = await readHeading(this.page);
    return `${this.current?.definition.name ?? 'an unrecognised page'} (h1 "${heading}", ${this.page.url()})`;
  }

  /**
   * Decline non-essential cookies. Companies House shows the banner on the
   * first page of every fresh context; declining keeps runs consistent and
   * avoids the banner overlapping controls.
   */
  async dismissCookieBanner(): Promise<void> {
    const reject = this.page.locator('#reject-cookies-button');
    if (await reject.isVisible().catch(() => false)) {
      await reject.click();
      const hide = this.page.locator('#hide-rejected-message-button');
      if (await hide.isVisible().catch(() => false)) await hide.click();
    }
  }
}

setWorldConstructor(ChWorld);
