# React Hooks の使用例

このドキュメントでは、`@r-ishino/sample-fetcher`のReact Hooksの詳細な使用方法を説明します。

## 目次

- [基本的な使用](#基本的な使用)
- [SWRConfigでのグローバル設定](#swrconfigでのグローバル設定)
- [条件付きフェッチング](#条件付きフェッチング)
- [ミューテーション（POST/PUT/DELETE）](#ミューテーションpostputdelete)
- [Optimistic UI更新](#optimistic-ui更新)
- [エラーハンドリング](#エラーハンドリング)
- [既存コードからの移行](#既存コードからの移行)

## 基本的な使用

### シンプルなGETリクエスト

```typescript
'use client';

import { useFetcher } from '@r-ishino/sample-fetcher';

type User = {
  id: string;
  name: string;
  email: string;
};

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, isValidating, mutate } = useFetcher<User>(
    `/api/users/${userId}`,
    null,
    {
      fetcherOptions: {
        baseURL: 'https://api.example.com',
        credentials: 'include',
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      {isValidating && <span>Revalidating...</span>}
    </div>
  );
}
```

### クエリパラメータの使用

```typescript
function UserList() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useFetcher<User[]>(
    '/api/users',
    { page, limit: 10 },  // クエリパラメータ
    {
      fetcherOptions: {
        baseURL: 'https://api.example.com',
      },
    }
  );

  // ...
}
```

## SWRConfigでのグローバル設定

アプリケーション全体で共通の設定を使用する場合、`SWRConfig`でグローバル設定を行います。

### Next.js App Routerでの設定

```typescript
// app/providers.tsx
'use client';

import { SWRConfig } from 'swr';
import { getRequest, type FetcherError } from '@r-ishino/sample-fetcher';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // グローバルfetcher（全てのuseFetcherで使用される）
        fetcher: async (key: { url: string; params?: Record<string, unknown> }) => {
          const result = await getRequest(
            key.url,
            key.params,
            {
              baseURL: process.env.NEXT_PUBLIC_API_URL,
              credentials: 'include',
            }
          );

          if (result.type === 'success') {
            return result.data;
          }

          // 失敗時はエラーをthrow
          throw result.error;
        },

        // SWR設定
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        dedupingInterval: 2000,

        // エラーリトライのカスタマイズ
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          const fetcherError = error as FetcherError;

          // 401エラーの場合は1秒後にリトライ
          if (fetcherError.status === 401) {
            setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 1000);
            return;
          }

          // 404エラーの場合はリトライしない
          if (fetcherError.status === 404) {
            return;
          }

          // 最大3回までリトライ
          if (retryCount >= 3) {
            return;
          }

          // 指数バックオフでリトライ
          setTimeout(() => revalidate({ retryCount }), 1000 * Math.pow(2, retryCount));
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### グローバル設定を使用したuseFetcher

`SWRConfig`でグローバル設定を行った場合、各コンポーネントでは設定を省略できます。

```typescript
'use client';

import { useFetcher } from '@r-ishino/sample-fetcher';

function UserProfile({ userId }: { userId: string }) {
  // グローバル設定が自動的に適用される
  const { data, error, isLoading } = useFetcher<User>(
    `/api/users/${userId}`,
    null
  );

  // ...
}
```

個別に設定を上書きすることも可能です。

```typescript
const { data, error, isLoading } = useFetcher<User>(
  `/api/users/${userId}`,
  null,
  {
    fetcherOptions: {
      timeout: 10000,  // タイムアウトを上書き
    },
    swrConfig: {
      revalidateOnFocus: true,  // SWR設定を上書き
    },
  }
);
```

## Next.js App Routerでの初期データ設定

Next.js App Routerでは、Server Componentでデータを取得し、`FetcherProvider`を使ってClient Componentに初期データを渡すことができます。これにより、初回レンダリング時にデータが即座に利用可能になり、UXが向上します。

### FetcherProviderの基本的な使い方

`FetcherProvider`は、SWRの`fallback`機能をラップしたコンポーネントです。Server ComponentとClient Componentの両方で使用できます。

```typescript
// app/rooms/page.tsx (Server Component)
import { FetcherProvider } from '@r-ishino/sample-fetcher';
import { RoomsList } from './RoomsList';

async function getRooms() {
  const response = await fetch('https://api.example.com/api/rooms?page=1');
  return response.json();
}

export default async function RoomsPage() {
  const roomsData = await getRooms();

  return (
    <FetcherProvider
      entries={[
        { url: '/api/rooms', params: { page: 1 }, data: roomsData },
      ]}
    >
      <RoomsList />
    </FetcherProvider>
  );
}
```

```typescript
// app/rooms/RoomsList.tsx (Client Component)
'use client';

import { useFetcher } from '@r-ishino/sample-fetcher';

type Room = {
  id: string;
  name: string;
};

export function RoomsList() {
  // FetcherProviderで設定した初期データが自動的に使用される
  const { data, error, isLoading } = useFetcher<Room[]>(
    '/api/rooms',
    { page: 1 },
    {
      fetcherOptions: { baseURL: 'https://api.example.com' },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((room) => (
        <li key={room.id}>{room.name}</li>
      ))}
    </ul>
  );
}
```

### ドメインモデルフックとの統合

プロダクションコードでよく使用される「ドメインモデルフック」パターン（例：`useRooms().useIndex()`）とも統合できます。

#### Step 1: ドメインモデルフックの定義

```typescript
// hooks/useRooms.ts
'use client';

import { useFetcher, type UseFetcherResult } from '@r-ishino/sample-fetcher';

export type Room = {
  id: string;
  name: string;
  description: string;
};

export type RoomsIndexQuery = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export const useRooms = () => {
  return {
    useIndex: (customQuery?: RoomsIndexQuery): UseFetcherResult<Room[], unknown> => {
      const query: RoomsIndexQuery = customQuery ?? { page: 1, limit: 20 };

      return useFetcher<Room[]>(
        '/api/rooms',
        query,
        {
          fetcherOptions: {
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            credentials: 'include',
          },
        }
      );
    },
  };
};
```

#### Step 2: ヘルパー関数の作成

```typescript
// hooks/useRooms.helpers.ts
import type { RoomsIndexQuery, Room } from './useRooms';

/**
 * URLクエリパラメータをパース
 * Server Component と Client Component の両方で使用可能
 */
export const parseRoomsQuery = (searchParams: URLSearchParams): RoomsIndexQuery => {
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const keyword = searchParams.get('keyword');

  return {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    keyword: keyword ?? undefined,
  };
};

/**
 * FetcherProvider用の初期データを作成
 * Server Componentで使用
 */
export const createRoomsInitialData = (entries: {
  index?: { query: RoomsIndexQuery; data: Room[] };
}) => {
  const result: Array<{
    url: string;
    params: Record<string, unknown> | null;
    data: unknown;
  }> = [];

  if (entries.index) {
    result.push({
      url: '/api/rooms',
      params: entries.index.query,
      data: entries.index.data,
    });
  }

  return result;
};
```

#### Step 3: Server Componentでの使用

```typescript
// app/rooms/page.tsx (Server Component)
import { FetcherProvider } from '@r-ishino/sample-fetcher';
import { RoomsList } from './RoomsList';
import { parseRoomsQuery, createRoomsInitialData } from '@/hooks/useRooms.helpers';

async function getRooms(query: { page: number; limit: number; keyword?: string }) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    ...(query.keyword && { keyword: query.keyword }),
  });

  const response = await fetch(
    `${process.env.API_URL}/api/rooms?${params}`,
    {
      credentials: 'include',
      headers: {
        // Server Componentでは手動でCookieを設定
        Cookie: cookies().toString(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }

  return response.json();
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; keyword?: string };
}) {
  // URLパラメータをパース
  const urlSearchParams = new URLSearchParams(searchParams);
  const parsedQuery = parseRoomsQuery(urlSearchParams);

  // データを取得
  const roomsData = await getRooms(parsedQuery);

  // 初期データを作成
  const initialData = createRoomsInitialData({
    index: { query: parsedQuery, data: roomsData },
  });

  return (
    <FetcherProvider entries={initialData}>
      <RoomsList />
    </FetcherProvider>
  );
}
```

#### Step 4: Client Componentでの使用

```typescript
// app/rooms/RoomsList.tsx (Client Component)
'use client';

import { useRooms } from '@/hooks/useRooms';
import { useSearchParams } from 'next/navigation';
import { parseRoomsQuery } from '@/hooks/useRooms.helpers';

export function RoomsList() {
  const searchParams = useSearchParams();
  const parsedQuery = parseRoomsQuery(searchParams);

  // FetcherProviderで設定した初期データが自動的に使用される
  const { useIndex } = useRooms();
  const { data: rooms, error, isLoading } = useIndex(parsedQuery);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {rooms?.map((room) => (
        <li key={room.id}>
          <h3>{room.name}</h3>
          <p>{room.description}</p>
        </li>
      ))}
    </ul>
  );
}
```

### パターンの利点

このパターンには以下の利点があります：

1. **初回レンダリングの高速化**: Server Componentで取得したデータが即座に利用可能
2. **型安全性**: TypeScriptの型推論が効く
3. **コロケーション**: 親でfallbackデータを設定し、子孫コンポーネントで自動的に利用可能
4. **柔軟性**: URLパラメータまたは関数引数でクエリを指定可能
5. **再利用性**: ヘルパー関数でロジックを共通化

### 複数のエンドポイントの初期データを設定

複数のエンドポイントの初期データを一度に設定することもできます。

```typescript
// app/dashboard/page.tsx (Server Component)
import { FetcherProvider } from '@r-ishino/sample-fetcher';
import { Dashboard } from './Dashboard';

export default async function DashboardPage() {
  const [userData, statsData] = await Promise.all([
    fetch('https://api.example.com/api/users/me').then((r) => r.json()),
    fetch('https://api.example.com/api/stats').then((r) => r.json()),
  ]);

  return (
    <FetcherProvider
      entries={[
        { url: '/api/users/me', params: null, data: userData },
        { url: '/api/stats', params: null, data: statsData },
      ]}
    >
      <Dashboard />
    </FetcherProvider>
  );
}
```

```typescript
// app/dashboard/Dashboard.tsx (Client Component)
'use client';

import { useFetcher } from '@r-ishino/sample-fetcher';

export function Dashboard() {
  const { data: user } = useFetcher<User>('/api/users/me', null);
  const { data: stats } = useFetcher<Stats>('/api/stats', null);

  // 両方の初期データが即座に利用可能
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Total: {stats?.total}</p>
    </div>
  );
}
```

## 条件付きフェッチング

`url`を`null`にすることで、条件付きでフェッチを停止できます。

```typescript
function ConditionalFetch({ shouldFetch }: { shouldFetch: boolean }) {
  const { data, isLoading } = useFetcher<User>(
    shouldFetch ? '/api/users/me' : null,  // falseの場合はリクエストしない
    null,
    {
      fetcherOptions: { baseURL: 'https://api.example.com' },
    }
  );

  if (!shouldFetch) return <div>Fetch disabled</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.name}</div>;
}
```

## ミューテーション（POST/PUT/DELETE）

ミューテーションは直接fetcherを使用し、成功後に`mutate()`でキャッシュを更新します。

### 新規作成（POST）

```typescript
'use client';

import { useFetcher, postRequest } from '@r-ishino/sample-fetcher';
import { useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

function CreateUser() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: users, mutate } = useFetcher<User[]>('/api/users', {
    fetcherOptions: { baseURL: 'https://api.example.com' },
  });

  const handleCreate = async (name: string, email: string) => {
    setIsSubmitting(true);
    try {
      const result = await postRequest<User>(
        'https://api.example.com/api/users',
        { name, email },
        { credentials: 'include' }
      );

      if (result.type === 'success') {
        console.log('Created:', result.data);
        // キャッシュを再取得
        await mutate();
      } else {
        console.error('Error:', result.error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleCreate('John', 'john@example.com')}>
        {isSubmitting ? 'Creating...' : 'Create User'}
      </button>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 更新（PUT）

```typescript
import { useFetcher, putRequest } from '@r-ishino/sample-fetcher';

function UserEditor({ userId }: { userId: string }) {
  const { data: user, mutate } = useFetcher<User>(
    `/api/users/${userId}`,
    null,
    { fetcherOptions: { baseURL: 'https://api.example.com' } }
  );

  const handleUpdate = async (name: string) => {
    const result = await putRequest<User>(
      `https://api.example.com/api/users/${userId}`,
      { name },
      { credentials: 'include' }
    );

    if (result.type === 'success') {
      // キャッシュを再取得
      await mutate();
    }
  };

  // ...
}
```

### 削除（DELETE）

```typescript
import { useFetcher, deleteRequest } from '@r-ishino/sample-fetcher';

function UserList() {
  const { data: users, mutate } = useFetcher<User[]>('/api/users', {
    fetcherOptions: { baseURL: 'https://api.example.com' },
  });

  const handleDelete = async (userId: string) => {
    const result = await deleteRequest(
      `https://api.example.com/api/users/${userId}`,
      undefined,
      { credentials: 'include' }
    );

    if (result.type === 'success') {
      // キャッシュを再取得
      await mutate();
    }
  };

  // ...
}
```

## Optimistic UI更新

`mutate()`を使ってOptimistic UI更新を実装できます。

```typescript
import { useFetcher, putRequest } from '@r-ishino/sample-fetcher';

function UserEditor({ userId }: { userId: string }) {
  const { data: user, mutate } = useFetcher<User>(
    `/api/users/${userId}`,
    null,
    { fetcherOptions: { baseURL: 'https://api.example.com' } }
  );

  const handleOptimisticUpdate = async (newName: string) => {
    if (!user) return;

    // Optimistic更新（即座にUIを更新、revalidateはスキップ）
    mutate({ ...user, name: newName }, false);

    // APIリクエスト
    const result = await putRequest<User>(
      `https://api.example.com/api/users/${userId}`,
      { name: newName }
    );

    if (result.type === 'success') {
      // 成功したら再検証
      await mutate();
    } else {
      // 失敗したら元に戻す
      await mutate();
    }
  };

  // ...
}
```

## エラーハンドリング

### errorFallbackの使用

```typescript
const { data, error, isLoading } = useFetcher<User>(
  '/api/users/1',
  null,
  {
    fetcherOptions: {
      baseURL: 'https://api.example.com',
    },
    errorFallback: (error) => {
      // エラーログを送信
      console.error('API Error:', error.status, error.message);

      // エラートラッキングサービスに送信
      // trackError(error);
    },
  }
);
```

### エラー型の指定

```typescript
type ApiError = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};

const { data, error, isLoading } = useFetcher<User, ApiError>(
  '/api/users/1',
  null,
  {
    fetcherOptions: { baseURL: 'https://api.example.com' },
  }
);

if (error) {
  console.error('Error code:', error.data?.code);
  console.error('Error message:', error.data?.message);
}
```

## 既存コードからの移行

### Before（Axios + SWR）

```typescript
// layout.tsx
<SWRConfig
  value={{
    fetcher: async (args: { url: string; params: unknown }) => {
      const { url, params } = args;
      return ApiClient.get(url, { params }).then((r: AxiosResponse) => {
        if (isAxiosError(r)) {
          throw r;
        }
        return r.data;
      });
    },
    revalidateOnFocus: false,
    onErrorRetry: (err, key, config, revalidate, { retryCount }) => {
      if (isAxiosError(err) && err.response?.status === 401) {
        setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 1000);
      }
    },
  }}
>
```

```typescript
// component.tsx
const { data, mutate, isLoading } = useSWR<User>(
  { url: '/api/users/1', params: null },
  swrOptions
);
```

### After（@r-ishino/sample-fetcher）

```typescript
// app/providers.tsx
'use client';

import { SWRConfig } from 'swr';
import { getRequest, type FetcherError } from '@r-ishino/sample-fetcher';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: async (key: { url: string; params?: Record<string, unknown> }) => {
          const result = await getRequest(
            key.url,
            key.params,
            {
              baseURL: process.env.NEXT_PUBLIC_API_URL,
              credentials: 'include',
            }
          );

          if (result.type === 'success') {
            return result.data;
          }

          throw result.error;
        },
        revalidateOnFocus: false,
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          const fetcherError = error as FetcherError;

          if (fetcherError.status === 401) {
            setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 1000);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

```typescript
// component.tsx
import { useFetcher } from '@r-ishino/sample-fetcher';

const { data, mutate, isLoading } = useFetcher<User>('/api/users/1', null);
```

### 主な変更点

1. **Axios依存の削除**: `@r-ishino/sample-fetcher`の`getRequest`を使用
2. **エラー型の変更**: `AxiosError` → `FetcherError`
3. **Result型の活用**: `result.type`で成功/失敗を判定
4. **型安全性の向上**: ジェネリック型でレスポンスとエラーの型を指定

### 移行のメリット

- ✅ Axios依存がなくなり、バンドルサイズが削減
- ✅ 標準のFetch APIを使用し、モダンな環境に最適化
- ✅ Result型パターンで型安全なエラーハンドリング
- ✅ サーバー/クライアント両対応
- ✅ Next.js App Routerとの親和性が高い

## まとめ

`useFetcher`は、SWRの強力な機能を活用しつつ、型安全で保守性の高いAPI通信を実現します。

主な特徴：
- ✅ SWRベースでキャッシュ、再検証、エラーハンドリングが簡単
- ✅ GET専用のシンプルなAPI
- ✅ POST/PUT/DELETEは直接fetcherを使用し、mutateでキャッシュ更新
- ✅ 型安全なレスポンスとエラー処理
- ✅ グローバル設定とローカル設定の柔軟な組み合わせ
