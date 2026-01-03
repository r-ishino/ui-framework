import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { createFetcherClient } from '../core/fetcher_client';
import type { FetcherOptions } from '../core/fetcher';

type FetcherConfigProviderProps = {
  children: ReactNode;
  config: FetcherOptions;
};

/**
 * fetcherのグローバル設定を行うProvider
 * アプリケーションのルートに1回だけ配置する
 *
 * 内部で SWRConfig の fetcher を設定（useFetcher で使用）
 *
 * @example
 * ```tsx
 * // lib/fetcherConfig.ts
 * import { createFetcherClient } from '@r-ishino/sample-fetcher';
 *
 * export const fetcherConfig = {
 *   baseURL: 'https://api.example.com',
 *   timeout: 30000,
 * };
 *
 * // Server Component / Client Component 両方で使用可能
 * export const fetcherClient = createFetcherClient(fetcherConfig);
 * ```
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { FetcherConfigProvider } from '@r-ishino/sample-fetcher';
 * import { fetcherConfig } from '@/lib/fetcherConfig';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <FetcherConfigProvider config={fetcherConfig}>
 *           {children}
 *         </FetcherConfigProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * Server Component / Client Component での使用
 * ```tsx
 * import { fetcherClient } from '@/lib/fetcherConfig';
 *
 * // Server Component でも Client Component でも同じ API
 * const result = await fetcherClient.get<User[]>('/api/users');
 * if (result.type === 'success') {
 *   console.log(result.data);
 * }
 * ```
 *
 * @example
 * useFetcher での使用（GET リクエスト + SWR キャッシュ）
 * ```tsx
 * import { useFetcher } from '@r-ishino/sample-fetcher';
 *
 * const { data, error, isLoading } = useFetcher<User[]>('/api/users');
 * ```
 */
export const FetcherConfigProvider = ({
  children,
  config,
}: FetcherConfigProviderProps): ReactNode => {
  // FetcherClient を作成
  const client = createFetcherClient(config);

  // SWRConfig の fetcher を設定（useFetcher で使用される）
  const swrFetcher = async (key: {
    url: string;
    params?: Record<string, unknown>;
  }): Promise<unknown> => {
    const result = await client.get(key.url, key.params);
    if (result.type === 'success') {
      return result.data;
    }
    throw result.error;
  };

  return <SWRConfig value={{ fetcher: swrFetcher }}>{children}</SWRConfig>;
};
