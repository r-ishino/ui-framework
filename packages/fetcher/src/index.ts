import packageJson from '../package.json';

export const version = packageJson.version;

// Core fetcher
export { fetcher, type FetcherOptions } from './core/fetcher';

// Error types and functions
export { createFetcherError, isFetcherError, type FetcherError } from './core/error';

// Response types and functions
export type {
  FetcherResponse,
  FetcherResult,
  FetcherSuccess,
  FetcherFailure,
} from './core/response';
export {
  isSuccess,
  isFailure,
  createSuccess,
  createFailure,
} from './core/response';

// HTTP methods (return Result type)
export {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from './core/methods';

// FetcherClient
export { createFetcherClient, type FetcherClient } from './core/fetcher_client';

// Hooks
export {
  useFetcher,
  type UseFetcherOptions,
  type UseFetcherResult,
} from './hooks';

// Components
export { FetcherProvider, FetcherConfigProvider } from './components';
