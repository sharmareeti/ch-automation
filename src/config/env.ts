import 'dotenv/config';

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function int(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  baseUrl:
    process.env.BASE_URL ?? 'https://find-and-update.company-information.service.gov.uk',
  browserName: (process.env.BROWSER ?? 'chromium') as BrowserName,
  headless: bool(process.env.HEADLESS, true),
  slowMo: int(process.env.SLOW_MO, 0),
  timeout: int(process.env.TIMEOUT, 30_000),
  trace: bool(process.env.TRACE, false),
};
