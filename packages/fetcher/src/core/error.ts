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
