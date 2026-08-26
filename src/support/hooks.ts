import { AfterAll, After, Before, BeforeAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, type Browser } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../config/env';
import { ChWorld } from './world';

const TRACE_DIR = join('reports', 'traces');

setDefaultTimeout(env.timeout * 2);

let browser: Browser;

const launchers = { chromium, firefox, webkit };

BeforeAll(async function () {
  browser = await launchers[env.browserName].launch({
    headless: env.headless,
    slowMo: env.slowMo,
  });
});

AfterAll(async function () {
  await browser?.close();
});

Before(async function (this: ChWorld) {
  this.browser = browser;
  this.context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  this.context.setDefaultTimeout(env.timeout);

  if (env.trace) {
    await this.context.tracing.start({ screenshots: true, snapshots: true });
  }

  this.page = await this.context.newPage();
});

After(async function (this: ChWorld, { result, pickle }) {
  const failed = result?.status === Status.FAILED;

  if (failed && this.page && !this.page.isClosed()) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
    this.attach(`Failed on: ${this.page.url()}`, 'text/plain');
  }

  if (env.trace) {
    if (failed) {
      mkdirSync(TRACE_DIR, { recursive: true });
      const name = pickle.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      await this.context.tracing.stop({ path: join(TRACE_DIR, `${name}.zip`) });
    } else {
      await this.context.tracing.stop();
    }
  }

  await this.context?.close();
});
