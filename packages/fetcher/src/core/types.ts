export type FetcherOptions<E = unknown> = RequestInit & {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  onRequest?: (
    config: FetcherOptions<E>
  ) => FetcherOptions<E> | Promise<FetcherOptions<E>>;
  onResponse?: <T>(response: Response, data: T) => T | Promise<T>;
  onError?: (error: FetcherError<E>) => void | Promise<void>;
};

export type FetcherResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

export type FetcherError<E = unknown> = Error & {
  status: number;
  response?: Response;
  data?: E;
};

export const createFetcherError = <E = unknown>(
  message: string,
  status: number,
  response?: Response,
  data?: E
): FetcherError<E> =>
  Object.assign(new Error(message), {
    name: 'FetcherError',
    status,
    response,
    data,
  });

export const isFetcherError = <E = unknown>(
  error: unknown
): error is FetcherError<E> => {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name !== 'FetcherError') {
    return false;
  }
  if (!('status' in error)) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const errorWithStatus = error as { status: unknown };
  return typeof errorWithStatus.status === 'number';
};
