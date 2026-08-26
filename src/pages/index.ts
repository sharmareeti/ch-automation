import { registerPages } from './registry';
import { accountsPages } from './accounts.pages';
import { searchPages } from './search.pages';

registerPages(...accountsPages, ...searchPages);

export * from './registry';
export * from './types';
