import { When, type DataTable } from '@cucumber/cucumber';
import type { ChWorld } from '../support/world';

When(
  'I set {string} to {string}',
  async function (this: ChWorld, field: string, value: string) {
    await this.gds().set(field, value);
  },
);

/**
 * Fill several fields at once:
 *
 *   When I fill in:
 *     | company name contains | tesco     |
 *     | company status        | Active    |
 *     | incorporated from     | 1/1/1990  |
 *
 * The page definition decides how each field is operated, so the same step
 * drives text inputs, radio groups, checkbox groups and date inputs alike.
 */
When('I fill in:', async function (this: ChWorld, table: DataTable) {
  const gds = this.gds();
  for (const [field, value] of Object.entries(table.rowsHash())) {
    await gds.set(field, value);
  }
});
