/**
 * A page is described as data, not as code.
 *
 * Adding a new Companies House form means adding one PageDefinition below and
 * writing Gherkin against it. It does not mean writing new step definitions --
 * the generic steps in src/steps read these maps at runtime.
 */

/** How a single writable control on the page is addressed and operated. */
export type FieldSpec =
  /** A single-line input: fill with text. */
  | { type: 'text'; id: string }
  /** A <select>: choose by visible option text. */
  | { type: 'select'; id: string }
  /** A GOV.UK radio group: choose one option by its visible label. */
  | { type: 'radioGroup'; name: string }
  /** A standalone checkbox: set with "yes"/"no" (or "true"/"false"). */
  | { type: 'checkbox'; id: string }
  /** A GOV.UK checkbox group: tick one or more options, comma separated. */
  | { type: 'checkboxGroup'; name: string }
  /** A GOV.UK day/month/year date input: set with "27/11/1947" or "1947-11-27". */
  | { type: 'date'; day: string; month: string; year: string };

export interface PageDefinition {
  /** Stable internal key. */
  id: string;
  /** Human name used in .feature files. */
  name: string;
  /**
   * Path used to open the page directly. May contain a single `{value}`
   * placeholder, filled by the "... page for ..." step.
   */
  path?: string;
  /** Expected <h1>. Used both to identify and to assert the page. */
  heading?: string;
  /** Used to identify the page after a navigation. */
  urlPattern?: RegExp;
  /** Writable controls, keyed by the name used in .feature files. */
  fields?: Record<string, FieldSpec>;
  /** Read-only values to assert, keyed by name -> CSS selector. */
  values?: Record<string, string>;
  /** Repeated item collections, keyed by name -> CSS selector for one item. */
  lists?: Record<string, string>;
  /** Named clickable controls, keyed by name -> CSS selector. */
  actions?: Record<string, string>;
  /** The primary continue/submit control. */
  submit?: string;
}
