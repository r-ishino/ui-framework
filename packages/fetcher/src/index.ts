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

// Utils
export { buildQueryString } from './utils/queryString';
