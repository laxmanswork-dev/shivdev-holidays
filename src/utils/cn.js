import { clsx } from 'clsx';

/**
 * Thin re-export of clsx for conditional class handling.
 * Keeps a single import path across the app: `import { cn } from '../utils/cn'`.
 */
export const cn = clsx;
