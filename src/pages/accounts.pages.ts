import type { PageDefinition } from './types';

/**
 * "File your company accounts" -- the publicly reachable part of the journey
 * that https://www.gov.uk/file-your-company-annual-accounts starts.
 *
 * Choosing an account type branches five ways, and three of the five branches
 * land on a different URL shape. Nothing here encodes those routes: the runner
 * detects where it landed, and the .feature file states where it expected to be.
 */
export const accountsPages: PageDefinition[] = [
  {
    id: 'accounts-type',
    name: 'Select account type',
    path: '/accounts/select-account-type',
    heading: 'Which type of accounts have you prepared?',
    urlPattern: /\/accounts\/select-account-type/,
    fields: {
      'account type': { type: 'radioGroup', name: 'selectedAccountTypeName' },
    },
    submit: '#next-button',
  },
  {
    id: 'accounts-guide',
    name: 'Accounts filing guide',
    // Reached by micro-entity, abridged and dormant. The heading varies by
    // type, so the .feature file asserts it.
    urlPattern: /\/guides\/accounts\/chooser\//,
  },
  {
    id: 'full-accounts-criteria',
    name: 'Full accounts criteria',
    urlPattern: /\/accounts\/full-accounts-criteria/,
    heading: 'File full accounts with Companies House',
  },
  {
    id: 'package-accounts',
    name: 'Package accounts filing',
    urlPattern: /\/accounts-filing/,
    heading: 'File package accounts with Companies House',
  },
];
