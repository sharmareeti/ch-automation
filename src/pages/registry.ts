import type { Page } from '@playwright/test';
import type { PageDefinition } from './types';

const pages = new Map<string, PageDefinition>();

export function registerPages(...definitions: PageDefinition[]): void {
  for (const definition of definitions) {
    if (pages.has(definition.id)) {
      throw new Error(`Duplicate page id "${definition.id}"`);
    }
    pages.set(definition.id, definition);
  }
}

export function allPages(): PageDefinition[] {
  return [...pages.values()];
}

/** Look a page up by the human name used in .feature files. */
export function pageByName(name: string): PageDefinition {
  const wanted = name.trim().toLowerCase();
  const match = allPages().find((p) => p.name.toLowerCase() === wanted);
  if (match) return match;

  const known = allPages()
    .map((p) => `  - ${p.name}`)
    .sort()
    .join('\n');
  throw new Error(`Unknown page "${name}". Known pages:\n${known}`);
}

/**
 * Work out which registered page the browser is currently showing.
 *
 * Every constraint a definition declares must match. The definition that
 * matches on the most constraints wins, so a specific page beats a general one.
 * This is what lets a branching wizard be followed without hard-coding routes:
 * the framework reads where it landed rather than being told where to go.
 */
export async function detectPage(page: Page): Promise<PageDefinition | undefined> {
  const url = page.url();
  const heading = await readHeading(page);

  let best: PageDefinition | undefined;
  let bestScore = 0;

  for (const definition of allPages()) {
    let score = 0;

    if (definition.urlPattern) {
      if (!definition.urlPattern.test(url)) continue;
      score += 1;
    }
    if (definition.heading) {
      if (definition.heading.toLowerCase() !== heading.toLowerCase()) continue;
      score += 1;
    }
    if (score === 0) continue;

    if (score > bestScore) {
      best = definition;
      bestScore = score;
    }
  }

  return best;
}

export async function readHeading(page: Page): Promise<string> {
  const h1 = page.locator('h1').first();
  if ((await h1.count()) === 0) return '';
  return (await h1.innerText()).trim();
}
