import type { PageDefinition } from './types';

/**
 * The public search services. Advanced search is the widest form on the estate:
 * free text, day/month/year date inputs and two large checkbox groups, all on
 * one page. It exercises every component type the driver supports.
 */
export const searchPages: PageDefinition[] = [
  {
    id: 'advanced-search',
    name: 'Advanced company search',
    path: '/advanced-search',
    heading: 'Advanced company search',
    urlPattern: /\/advanced-search(\?|$)/,
    fields: {
      'company name contains': { type: 'text', id: 'companyNameIncludes' },
      'company name excludes': { type: 'text', id: 'companyNameExcludes' },
      'registered office address': { type: 'text', id: 'registeredOfficeAddress' },
      'sic codes': { type: 'text', id: 'sicCodes' },
      'incorporated from': {
        type: 'date',
        day: 'incorporation-from-day',
        month: 'incorporation-from-month',
        year: 'incorporation-from-year',
      },
      'incorporated to': {
        type: 'date',
        day: 'incorporation-to-day',
        month: 'incorporation-to-month',
        year: 'incorporation-to-year',
      },
      'dissolved from': {
        type: 'date',
        day: 'dissolved-from-day',
        month: 'dissolved-from-month',
        year: 'dissolved-from-year',
      },
      'dissolved to': {
        type: 'date',
        day: 'dissolved-to-day',
        month: 'dissolved-to-month',
        year: 'dissolved-to-year',
      },
      'company status': { type: 'checkboxGroup', name: 'status' },
      'company type': { type: 'checkboxGroup', name: 'type' },
      'company subtype': { type: 'checkboxGroup', name: 'subtype' },
    },
    actions: {
      'Clear all filters': '#advanced-clear-search-button',
    },
    submit: '#advanced-search-button',
  },
  {
    id: 'advanced-search-results',
    name: 'Advanced search results',
    urlPattern: /\/advanced-search\/get-results/,
    heading: 'Advanced company search',
    lists: {
      results: 'table.govuk-table tbody.govuk-table__body tr.govuk-table__row',
    },
  },
  {
    id: 'company-search-results',
    name: 'Company search results',
    path: '/search?q={value}',
    heading: 'Search results',
    urlPattern: /\/search\?/,
    lists: {
      results: 'ul#results li.type-company',
    },
  },
  {
    id: 'company-profile',
    name: 'Company profile',
    path: '/company/{value}',
    urlPattern: /\/company\/[A-Z0-9]+$/,
    values: {
      'company name': 'h1',
      'company number': '#company-number strong',
      'company status': '#company-status',
      'incorporation date': '#company-creation-date',
      'company type': '#company-type-value',
    },
    actions: {
      Overview: '#company-overview-tab',
      'Filing history': '#filing-history-tab',
      People: '#people-tab',
      Charges: '#charges-tab',
    },
  },
  {
    id: 'filing-history',
    name: 'Filing history',
    urlPattern: /\/company\/[A-Z0-9]+\/filing-history/,
    lists: {
      filings: 'table#fhTable tr:has(td)',
    },
  },
];
