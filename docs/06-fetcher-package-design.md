# Fetcher Package 設計提案

## 概要

`@r-ishino/sample-fetcher`は、型安全なHTTPリクエストとデータ取得を提供するパッケージです。

### 提供機能

1. **Fetch Wrapper**: 型安全で拡張可能なfetch関数のラッパー（GET/POST/PUT/DELETE）
2. **useFetcher**: GET専用のSWRフック（データ取得）
3. **useMutation**: POST/PUT/DELETE用のフック（データ変更）

### 既存実装からの学び

既存のuseFetcher実装から以下の良い点を取り入れます：

**良い点**:
- paramsを別引数で受け取り、SWRのkeyとして統合
- errorFallbackによる柔軟なエラーハンドリング
- 401エラーなど特定のHTTPステータスを特別扱い
- data/mutate/isLoadingのシンプルな返り値

**改善点**:
- Axiosへの依存を排除し、標準fetchを使用
- useFetcherをGET専用に明確化（変更系はuseMutation使用）
- errorHandlingロジックをフックから分離
- エラーハンドリングの副作用（throw）をより明確に
- nullチェックを型レベルで改善
- クエリパラメータの生成をユーティリティ化

## パッケージ構成

```
packages/fetcher/
├── src/
│   ├── index.ts                    # エクスポート定義
│   ├── core/
│   │   ├── fetcher.ts              # 基本fetch wrapper
│   │   ├── types.ts                # 共通型定義
│   │   └── errors.ts               # エラー型定義
│   ├── hooks/
│   │   ├── useFetcher.ts           # GET専用のSWRフック
│   │   ├── useMutation.ts          # POST/PUT/DELETE用フック
│   │   └── useInfinite.ts          # 無限スクロール用GET（ページネーション）
│   └── utils/
│       ├── queryString.ts          # クエリパラメータ生成
│       ├── cookie.ts               # Cookie操作ユーティリティ
│       └── interceptors.ts         # リクエスト/レスポンスインターセプター（将来的に）
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 依存関係

```json
{
  "dependencies": {
    "@r-ishino/sample-util": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "swr": "^2.0.0"
  }
}
```

**Note**: Axiosには依存せず、標準の`fetch` APIを使用します。

## API設計

### 1. Core Fetcher

#### 認証機能

fetcherは以下の認証機能を提供します：

1. **Cookie認証**: CookieからJWTアクセストークンを自動取得して付与
2. **トークンリフレッシュ**: 401エラー時にリフレッシュトークンでアクセストークンを再発行し、自動リトライ
3. **同時リクエスト制御**: 複数のリクエストで同時に401が発生しても、トークンリフレッシュは1回だけ実行

#### 型定義

```typescript
// packages/fetcher/src/core/types.ts
export type FetcherOptions = RequestInit & {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  // 認証設定
  auth?: {
    tokenCookieName?: string;        // アクセストークンのcookie名（デフォルト: 'accessToken'）
    refreshTokenCookieName?: string; // リフレッシュトークンのcookie名（デフォルト: 'refreshToken'）
    refreshEndpoint?: string;        // トークンリフレッシュAPI（デフォルト: '/auth/refresh'）
    onRefreshFailed?: () => void;    // リフレッシュ失敗時のコールバック
  };
  // インターセプター
  onRequest?: (config: FetcherOptions) => FetcherOptions | Promise<FetcherOptions>;
  onResponse?: <T>(response: Response, data: T) => T | Promise<T>;
  onError?: (error: FetcherError) => void | Promise<void>;
  // リトライ設定
  skipAuthRetry?: boolean;  // 401エラー時の自動リトライをスキップ
};

export type FetcherResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

export type FetcherError = Error & {
  status: number;
  response?: Response;
  data?: unknown;
};

export const createFetcherError = (
  message: string,
  status: number,
  response?: Response,
  data?: unknown
): FetcherError => {
  const error = new Error(message) as FetcherError;
  error.name = 'FetcherError';
  error.status = status;
  error.response = response;
  error.data = data;
  return error;
};

export const isFetcherError = (error: unknown): error is FetcherError => {
  return (
    error instanceof Error &&
    error.name === 'FetcherError' &&
    'status' in error &&
    typeof (error as FetcherError).status === 'number'
  );
};
```

```typescript
// packages/fetcher/src/core/fetcher.ts
import { buildQueryString } from '../utils/queryString';
import { getCookie, setCookie } from '../utils/cookie';
import { createFetcherError, FetcherOptions, FetcherResponse } from './types';

// トークンリフレッシュの状態管理
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * トークンリフレッシュ処理
 * 同時に複数のリクエストで401が発生しても、リフレッシュは1回だけ実行
 */
async function refreshAccessToken(options: FetcherOptions): Promise<string> {
  // すでにリフレッシュ中の場合は、その結果を待つ
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const {
        refreshTokenCookieName = 'refreshToken',
        refreshEndpoint = '/auth/refresh',
        onRefreshFailed,
      } = options.auth || {};

      const refreshToken = getCookie(refreshTokenCookieName);

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      // リフレッシュAPIを呼び出し（認証ループを防ぐためskipAuthRetryを設定）
      const response = await fetcher<{ accessToken: string }>(
        refreshEndpoint,
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
          skipAuthRetry: true,
          baseURL: options.baseURL,
        }
      );

      const newAccessToken = response.data.accessToken;

      // 新しいアクセストークンをCookieに保存
      const tokenCookieName = options.auth?.tokenCookieName || 'accessToken';
      setCookie(tokenCookieName, newAccessToken);

      return newAccessToken;
    } catch (error) {
      // リフレッシュ失敗時のコールバック（ログイン画面へリダイレクトなど）
      if (options.auth?.onRefreshFailed) {
        options.auth.onRefreshFailed();
      }
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * 内部fetcher実装
 */
async function fetcherInternal<T>(
  url: string,
  options?: FetcherOptions,
  isRetry = false
): Promise<FetcherResponse<T>> {
  const {
    baseURL = '',
    timeout = 30000,
    params,
    auth,
    onRequest,
    onResponse,
    onError,
    skipAuthRetry = false,
    headers: customHeaders,
    ...requestInit
  } = options || {};

  // URL構築
  let fullUrl = baseURL ? `${baseURL}${url}` : url;
  if (params) {
    const queryString = buildQueryString(params);
    fullUrl = `${fullUrl}${queryString ? `?${queryString}` : ''}`;
  }

  // リクエストインターセプター
  let finalOptions: FetcherOptions = {
    ...requestInit,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  };

  // 認証トークンをCookieから取得してヘッダーに追加
  if (auth) {
    const tokenCookieName = auth.tokenCookieName || 'accessToken';
    const token = getCookie(tokenCookieName);

    if (token) {
      finalOptions.headers = {
        ...finalOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  if (onRequest) {
    finalOptions = await onRequest(finalOptions);
  }

  // タイムアウト処理
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      ...finalOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // レスポンスボディの解析
    const contentType = response.headers.get('content-type');
    let data: T;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    // 401エラーの場合はトークンリフレッシュしてリトライ
    if (response.status === 401 && !skipAuthRetry && !isRetry && auth) {
      try {
        await refreshAccessToken(options);
        // リトライ（isRetry=trueで無限ループ防止）
        return fetcherInternal<T>(url, options, true);
      } catch (refreshError) {
        // リフレッシュ失敗時は401エラーをそのままthrow
        const error = createFetcherError(
          'Authentication failed',
          401,
          response,
          data
        );
        if (onError) {
          await onError(error);
        }
        throw error;
      }
    }

    // その他のエラーレスポンスの処理
    if (!response.ok) {
      const error = createFetcherError(
        response.statusText || 'Request failed',
        response.status,
        response,
        data
      );

      if (onError) {
        await onError(error);
      }

      throw error;
    }

    // レスポンスインターセプター
    if (onResponse) {
      data = await onResponse(response, data);
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortErrorの処理
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = createFetcherError('Request timeout', 408);
      if (onError) {
        await onError(timeoutError);
      }
      throw timeoutError;
    }

    throw error;
  }
}

/**
 * 公開fetcher関数
 */
export async function fetcher<T>(
  url: string,
  options?: FetcherOptions
): Promise<FetcherResponse<T>> {
  return fetcherInternal<T>(url, options, false);
}

// 便利メソッド
export const get = <T>(url: string, options?: FetcherOptions) =>
  fetcher<T>(url, { ...options, method: 'GET' });

export const post = <T>(url: string, data?: unknown, options?: FetcherOptions) =>
  fetcher<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });

export const put = <T>(url: string, data?: unknown, options?: FetcherOptions) =>
  fetcher<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const del = <T>(url: string, options?: FetcherOptions) =>
  fetcher<T>(url, { ...options, method: 'DELETE' });
```

```typescript
// packages/fetcher/src/utils/cookie.ts
/**
 * Cookieから値を取得
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
};

/**
 * Cookieに値を設定
 */
export const setCookie = (
  name: string,
  value: string,
  options?: {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }
): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const {
    expires,
    path = '/',
    domain,
    secure = true,
    sameSite = 'Lax',
  } = options || {};

  let cookieString = `${name}=${value}`;

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; SameSite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Cookieを削除
 */
export const deleteCookie = (name: string, path = '/'): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
};
```

```typescript
// packages/fetcher/src/utils/queryString.ts
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        searchParams.append(key, String(item));
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};
```

### 2. SWR Hooks

#### useFetcher (GET専用)

`useFetcher`はGETリクエスト専用のフックです。POST/PUT/DELETEなどの変更系リクエストは`useMutation`を使用してください。

```typescript
// packages/fetcher/src/hooks/useFetcher.ts
import useSWR, { SWRConfiguration } from 'swr';
import { get } from '../core/fetcher';
import { FetcherError, isFetcherError, FetcherOptions } from '../core/types';

// GET専用のオプション型（methodは指定不可）
export type GetFetcherOptions = Omit<FetcherOptions, 'method' | 'body'>;

export type UseFetcherOptions<T> = SWRConfiguration<T, FetcherError> & {
  fetcherOptions?: GetFetcherOptions;
  params?: Record<string, unknown>;
  onError?: (error: FetcherError) => void;
};

export type UseFetcherReturn<T> = {
  data: T | null;
  error: FetcherError | null;
  isLoading: boolean;
  mutate: () => Promise<T | undefined>;
};

/**
 * GET専用のSWRフック
 *
 * @param url - リクエストURL（nullの場合はリクエストしない）
 * @param options - フックのオプション
 * @returns data, error, isLoading, mutate
 *
 * @example
 * const { data, error, isLoading } = useFetcher<User>('/api/users/123');
 *
 * @example
 * const { data } = useFetcher<User[]>('/api/users', {
 *   params: { page: 1, limit: 20 }
 * });
 */
export function useFetcher<T>(
  url: string | null,
  options?: UseFetcherOptions<T>
): UseFetcherReturn<T> {
  const { fetcherOptions, params, onError, ...swrOptions } = options || {};

  // urlとparamsをSWRのkeyとして統合
  const swrKey = url === null ? null : params ? { url, params } : url;

  const { data, error, isLoading, mutate } = useSWR<T, FetcherError>(
    swrKey,
    async (key) => {
      const requestUrl = typeof key === 'string' ? key : key.url;
      const requestParams = typeof key === 'string' ? undefined : key.params;

      // GET専用なので、getメソッドを使用
      const response = await get<T>(requestUrl, {
        ...fetcherOptions,
        params: requestParams,
      });
      return response.data;
    },
    swrOptions
  );

  // エラーハンドリング
  if (error != null) {
    // カスタムエラーハンドラが指定されている場合は実行
    if (onError) {
      onError(error);
    } else if (isFetcherError(error) && error.status !== 401) {
      // 401以外のエラーはコンソールに出力（401は認証インターセプターで処理）
      console.error('Fetcher Error:', error);
    }
  }

  return {
    data: data ?? null,
    error: error ?? null,
    isLoading,
    mutate: async () => mutate(),
  };
}
```

```typescript
// packages/fetcher/src/hooks/useMutation.ts
import { useState, useCallback } from 'react';
import { mutate } from 'swr';
import { post, FetcherOptions } from '../core/fetcher';

export type UseMutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void | Promise<void>;
  invalidateKeys?: string[];
};

export function useMutation<TData, TVariables = any>(
  mutationFn: (variables: TVariables, options?: FetcherOptions) => Promise<TData>,
  options?: UseMutationOptions<TData, TVariables>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const trigger = useCallback(async (variables: TVariables) => {
    setLoading(true);
    setError(null);

    try {
      const data = await mutationFn(variables);
      await options?.onSuccess?.(data, variables);

      // 関連するキャッシュを無効化
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => mutate(key));
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      await options?.onError?.(error, variables);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return { trigger, loading, error };
}
```

### 3. Fetcher Instance (オプション)

グローバル設定を持つインスタンスを作成する機能：

```typescript
// packages/fetcher/src/core/createFetcher.ts
export function createFetcher(defaultOptions?: FetcherOptions) {
  return {
    get: <T>(url: string, options?: FetcherOptions) =>
      get<T>(url, { ...defaultOptions, ...options }),
    post: <T>(url: string, data?: any, options?: FetcherOptions) =>
      post<T>(url, data, { ...defaultOptions, ...options }),
    // ... 他のメソッド
  };
}

// 使用例
const api = createFetcher({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
  onRequest: async (config) => {
    // 認証トークン追加などの共通処理
    const token = await getAuthToken();
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  },
});
```

## 使用例

### 基本的なGETリクエスト

`useFetcher`はGET専用です。データの取得にのみ使用してください。

```typescript
import { useFetcher } from '@r-ishino/sample-fetcher';

type User = {
  id: number;
  name: string;
  email: string;
};

function UserProfile({ userId }: { userId: number }) {
  const { data, error, isLoading } = useFetcher<User>(
    `/api/users/${userId}`
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

### クエリパラメータの使用

```typescript
type UserListParams = {
  page: number;
  limit: number;
  status?: 'active' | 'inactive';
};

function UserList() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useFetcher<User[]>(
    '/api/users',
    {
      params: {
        page,
        limit: 20,
        status: 'active',
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      {data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => setPage(p => p + 1)}>Next</button>
    </div>
  );
}
```

### カスタムエラーハンドリング

```typescript
function UserProfile({ userId }: { userId: number }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, error, isLoading } = useFetcher<User>(
    `/api/users/${userId}`,
    {
      onError: (error) => {
        // カスタムエラーハンドリング
        if (error.status === 404) {
          setErrorMessage('ユーザーが見つかりません');
        } else if (error.status === 403) {
          setErrorMessage('アクセス権限がありません');
        } else {
          setErrorMessage('エラーが発生しました');
        }
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (errorMessage) return <div>{errorMessage}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

### POST/PUT/DELETEリクエスト（Mutation）

データの変更には`useMutation`を使用します。`useFetcher`はGET専用のため、変更系リクエストには使用できません。

```typescript
import { useMutation, post } from '@r-ishino/sample-fetcher';

type CreateUserInput = {
  name: string;
  email: string;
};

function CreateUserForm() {
  const { trigger, loading } = useMutation(
    (input: CreateUserInput) =>
      post<User>('/api/users', input).then(res => res.data),
    {
      onSuccess: (user) => {
        console.log('User created:', user);
      },
      invalidateKeys: ['/api/users'], // ユーザー一覧をリフレッシュ
    }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await trigger({ name: 'John', email: 'john@example.com' });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### JWT認証を使用したFetcherインスタンス

```typescript
import { createFetcher } from '@r-ishino/sample-fetcher';

export const api = createFetcher({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // JWT認証設定
  auth: {
    tokenCookieName: 'accessToken',        // アクセストークンのcookie名
    refreshTokenCookieName: 'refreshToken', // リフレッシュトークンのcookie名
    refreshEndpoint: '/api/auth/refresh',   // トークンリフレッシュAPI
    onRefreshFailed: () => {
      // リフレッシュ失敗時にログイン画面へリダイレクト
      window.location.href = '/login';
    },
  },
});

// 使用例
const response = await api.get<User[]>('/users');
// 自動的にCookieからトークンを取得してAuthorizationヘッダーに付与
// 401エラーの場合は自動的にトークンをリフレッシュしてリトライ
```

### 認証なしのリクエスト

```typescript
// 認証が不要なエンドポイントの場合は、authを指定しない
const publicApi = createFetcher({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// またはskipAuthRetryで認証リトライをスキップ
const response = await api.get<PublicData>('/public/data', {
  skipAuthRetry: true,
});
```

## テスト戦略

### 1. Core Fetcher のテスト

- モックfetchを使用した基本的なHTTPメソッドのテスト
- エラーハンドリングのテスト
- タイムアウト処理のテスト
- インターセプターの動作確認

### 2. Hooks のテスト

- React Testing Libraryでのフックテスト
- MSW (Mock Service Worker) を使用したAPIモック
- ローディング状態、エラー状態のテスト
- キャッシュ無効化の動作確認

## 実装の優先順位

### Phase 1: MVP（最小限の機能）

1. ✓ Core fetcher実装（`fetcher.ts`, `types.ts`, `errors.ts`）
2. ✓ 基本的なHTTPメソッド（get, post, put, del）
3. ✓ `useFetcher`フック（GET専用）の実装
4. ✓ クエリパラメータ生成（`buildQueryString`）
5. ✓ 基本的なテスト

### Phase 2: 拡張機能

1. ✓ `useMutation`フックの実装
2. ✓ インターセプター機能
3. ✓ `createFetcher`によるインスタンス作成
4. ✓ より詳細なエラーハンドリング

### Phase 3: 高度な機能

1. ✓ `useInfinite`フックの実装
2. ✓ リトライ機能
3. ✓ リクエストのキャンセル（AbortController）
4. ✓ レスポンスのキャッシュ戦略

## 技術的考慮事項

### TypeScript

- ジェネリクスを活用した型安全なAPI
- レスポンス型の推論
- オプションのバリデーション

### エラーハンドリング

- ネットワークエラー
- HTTPステータスエラー（4xx, 5xx）
- タイムアウトエラー
- JSONパースエラー
- 401エラーの自動リトライ

### 認証・セキュリティ

#### JWT認証フロー

1. **初回リクエスト**:
   - Cookieからアクセストークンとリフレッシュトークンを取得
   - アクセストークンをAuthorizationヘッダーに付与

2. **401エラー発生時**:
   - リフレッシュトークンを使ってトークンリフレッシュAPIを呼び出し
   - 新しいアクセストークンを取得してCookieに保存
   - 元のリクエストを自動的にリトライ

3. **同時リクエスト制御**:
   - 複数のリクエストで同時に401が発生した場合
   - トークンリフレッシュは1回だけ実行（Promise共有）
   - 他のリクエストはリフレッシュ完了を待機

4. **リフレッシュ失敗時**:
   - `onRefreshFailed`コールバックを実行
   - 通常はログイン画面へリダイレクト

#### セキュリティ対策

- **HttpOnly Cookie**: トークンはHttpOnly属性付きCookieで保存（XSS対策）
- **Secure Cookie**: HTTPS接続でのみ送信
- **SameSite**: CSRF対策として`SameSite=Lax`を設定
- **トークンの自動更新**: アクセストークン期限切れ時に自動更新
- **無限ループ防止**: リトライは1回まで（`isRetry`フラグ）
- **リフレッシュAPI保護**: リフレッシュAPI自体は`skipAuthRetry=true`で無限ループを防止

### パフォーマンス

- 不要なre-fetchの削減（SWRのキャッシュ戦略）
- リクエストのデバウンス/スロットル
- 並列リクエストの最適化
- トークンリフレッシュの同時実行制御

## Next.jsとの統合

Next.jsアプリケーションでの使用を想定した設計：

```typescript
// lib/api.ts
import { createFetcher } from '@r-ishino/sample-fetcher';

export const api = createFetcher({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  auth: {
    tokenCookieName: 'accessToken',
    refreshTokenCookieName: 'refreshToken',
    refreshEndpoint: '/api/auth/refresh',
    onRefreshFailed: () => {
      // リフレッシュ失敗時にログイン画面へリダイレクト
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  },
});
```

```typescript
// app/providers.tsx
'use client';
import { SWRConfig } from 'swr';
import { api } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => api.get(url).then(res => res.data),
        revalidateOnFocus: false,
        shouldRetryOnError: false, // 401エラーは自動リトライで処理
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

```typescript
// app/users/page.tsx
'use client';
import { useFetcher } from '@r-ishino/sample-fetcher';

type User = {
  id: number;
  name: string;
  email: string;
};

export default function UsersPage() {
  const { data, error, isLoading } = useFetcher<User[]>('/api/users');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 認証フロー全体像

```typescript
// app/login/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setCookie } from '@r-ishino/sample-fetcher';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      // ログインAPIを呼び出し（認証不要なのでskipAuthRetry）
      const response = await api.post<{
        accessToken: string;
        refreshToken: string;
      }>(
        '/api/auth/login',
        { email, password },
        { skipAuthRetry: true }
      );

      // トークンをCookieに保存
      setCookie('accessToken', response.data.accessToken);
      setCookie('refreshToken', response.data.refreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日間
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

## まとめ

この設計により、以下の利点が得られます：

1. **型安全性**: TypeScriptの型システムを最大限活用
2. **JWT認証の自動化**: Cookieベースの認証とトークンリフレッシュを自動処理
3. **セキュアな設計**: HttpOnly Cookie、CSRF対策、無限ループ防止などのセキュリティベストプラクティス
4. **拡張性**: インターセプターやカスタムインスタンスによる柔軟な拡張
5. **使いやすさ**: シンプルで直感的なAPI（GET専用のuseFetcher、変更系のuseMutation）
6. **パフォーマンス**: SWRのキャッシュ戦略とトークンリフレッシュの同時実行制御による最適化
7. **保守性**: モジュール化された構造と包括的なテスト

### 主要機能

- **Core Fetcher**: 標準fetch APIをベースにした型安全なラッパー（GET/POST/PUT/DELETE）
- **Cookie認証**: JWTトークンをCookieから自動取得してAuthorizationヘッダーに付与
- **自動リトライ**: 401エラー時にリフレッシュトークンで自動更新し、元のリクエストをリトライ
- **useFetcher**: GET専用のSWRフック（データ取得）
- **useMutation**: POST/PUT/DELETE用のフック（データ変更）
- **同時リクエスト制御**: 複数の401エラーでもトークンリフレッシュは1回だけ実行

## 次のステップ

1. この設計案のレビューとフィードバック
2. 必要に応じた設計の調整
3. Phase 1の実装開始
4. テストケースの作成
5. ドキュメントの整備

---

**作成日**: 2026-01-02
**バージョン**: 1.0.0
**ステータス**: 提案中
