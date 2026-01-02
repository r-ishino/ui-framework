/**
 * @sample/nextjs
 * Next.js specific components and utilities
 */

import packageJson from '../package.json';

export const version = packageJson.version;

// Components
export { NextLink } from './components/NextLink';
export type { NextLinkProps } from './components/NextLink';
