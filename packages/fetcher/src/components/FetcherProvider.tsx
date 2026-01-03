import { SWRConfig, unstable_serialize } from 'swr';
import type { ReactNode } from 'react';

type InitialDataEntry = {
  url: string;
  params?: Record<string, unknown> | null;
  data: unknown | Promise<unknown>;
};

type FetcherProviderProps = {
  children: ReactNode;
  entries: InitialDataEntry[];
};

/**
 * 初期データを SWR のキャッシュにセットする Provider
 * Server Component でも Client Component でも使用可能
 *
 * @example
 * シンプルな使い方
 * ```tsx
 * <FetcherProvider
 *   entries={[
 *     { url: '/api/rooms', params: null, data: roomsData },
 *     { url: '/api/users', params: { page: 1 }, data: usersData },
 *   ]}
 * >
 *   <RoomsList />
 * </FetcherProvider>
 * ```
 *
 * @example
 * Promise を渡す（データのプリフェッチ）
 * ```tsx
 * <FetcherProvider
 *   entries={[
 *     { url: '/api/rooms', params: null, data: getRooms() },
 *     { url: '/api/users', params: { page: 1 }, data: getUsers({ page: 1 }) },
 *   ]}
 * >
 *   <RoomsList />
 * </FetcherProvider>
 * ```
 *
 * @example
 * ヘルパー関数と組み合わせる
 * ```tsx
 * const initialData = createRoomsInitialData({
 *   index: { query: { page: 1 }, data: roomsData }
 * });
 *
 * <FetcherProvider entries={initialData}>
 *   <RoomsList />
 * </FetcherProvider>
 * ```
 */
export const FetcherProvider = ({
  children,
  entries,
}: FetcherProviderProps): ReactNode => {
  // エントリーを useFetcher のキー形式に変換
  const fallback: Record<string, unknown> = {};

  for (const { url, params, data } of entries) {
    const key = unstable_serialize({ url, params: params ?? undefined });
    fallback[key] = data;
  }

  return <SWRConfig value={{ fallback }}>{children}</SWRConfig>;
};
