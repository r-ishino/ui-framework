# @r-ishino/sample-fetcher

型安全なHTTPクライアントライブラリ。標準のFetch APIをベースに、TypeScriptの型推論、インターセプター、タイムアウト処理などの機能を提供します。

## 特徴

- ✅ **型安全**: ジェネリック型でレスポンスとエラーの型を指定可能
- ✅ **標準のFetch API**: Web標準のFetch APIをベースに実装
- ✅ **サーバー/クライアント両対応**: Node.js 18+とモダンブラウザで動作
- ✅ **インターセプター**: リクエスト/レスポンス/エラーの共通処理
- ✅ **タイムアウト処理**: AbortControllerによるタイムアウト制御
- ✅ **クエリパラメータ**: 自動的にURLSearchParamsでエンコード

## インストール

```bash
pnpm add @r-ishino/sample-fetcher
```

## 基本的な使い方

### シンプルなGETリクエスト

```typescript
import { getRequest } from '@r-ishino/sample-fetcher';

type User = {
  id: string;
  name: string;
  email: string;
};

// 型安全なAPIリクエスト
const { data, status } = await getRequest<User>(
  'https://api.example.com/users/1'
);
console.log(data.name); // 型推論が効く
```

### POSTリクエスト

```typescript
import { postRequest } from '@r-ishino/sample-fetcher';

type CreateUserRequest = {
  name: string;
  email: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

const { data } = await postRequest<User>('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com',
});
```

### エラー型の指定

```typescript
import { getRequest } from '@r-ishino/sample-fetcher';

type ApiError = {
  message: string;
  code: string;
};

try {
  const { data } = await getRequest<User, ApiError>('/api/users/1');
} catch (error) {
  if (error && typeof error === 'object' && 'data' in error) {
    const apiError = error as { data?: ApiError };
    console.error(apiError.data?.message);
  }
}
```

## API

### メソッド

#### `fetcher<T, E>(url, options?)`

基本的なfetcher関数。すべてのHTTPメソッドで使用可能。

```typescript
import { fetcher } from '@r-ishino/sample-fetcher';

const response = await fetcher<User>('https://api.example.com/users/1', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer token',
  },
});
```

#### `getRequest<T, E>(url, params?, options?)`

GETリクエスト用のショートハンド。

```typescript
const { data } = await getRequest<User>('/api/users/1', {
  include: 'posts', // クエリパラメータ
});
// => GET /api/users/1?include=posts
```

#### `postRequest<T, E>(url, data?, options?)`

POSTリクエスト用のショートハンド。

```typescript
const { data } = await postRequest<User>('/api/users', {
  name: 'John',
  email: 'john@example.com',
});
```

#### `putRequest<T, E>(url, data?, options?)`

PUTリクエスト用のショートハンド。

```typescript
const { data } = await putRequest<User>('/api/users/1', {
  name: 'Jane',
});
```

#### `deleteRequest<T, E>(url, params?, options?)`

DELETEリクエスト用のショートハンド。

```typescript
// パラメータなし
await deleteRequest('/api/users/1');

// クエリパラメータ付き（例：ソフトデリート）
await deleteRequest('/api/users/1', { soft: true });
```

### オプション

#### `FetcherOptions<E>`

```typescript
type FetcherOptions<E = unknown> = RequestInit & {
  baseURL?: string; // ベースURL
  timeout?: number; // タイムアウト（ミリ秒、デフォルト: 30000）
  headers?: Record<string, string>; // カスタムヘッダー
  params?: Record<string, unknown>; // クエリパラメータ

  // インターセプター
  onRequest?: (
    config: FetcherOptions<E>
  ) => FetcherOptions<E> | Promise<FetcherOptions<E>>;
  onResponse?: <T>(response: Response, data: T) => T | Promise<T>;
  onError?: (error: FetcherError<E>) => void | Promise<void>;
};
```

#### `FetcherResponse<T>`

```typescript
type FetcherResponse<T> = {
  data: T; // レスポンスデータ
  status: number; // HTTPステータスコード
  statusText: string; // ステータステキスト
  headers: Headers; // レスポンスヘッダー
};
```

#### `FetcherError<E>`

```typescript
type FetcherError<E = unknown> = Error & {
  status: number; // HTTPステータスコード
  response?: Response; // 元のResponseオブジェクト
  data?: E; // エラーレスポンスデータ
};
```

## 高度な使い方

### ベースURL

```typescript
import { getRequest } from '@r-ishino/sample-fetcher';

const { data } = await getRequest<User>('/users/1', {
  baseURL: 'https://api.example.com',
});
// => GET https://api.example.com/users/1
```

### カスタムヘッダー

```typescript
const { data } = await getRequest<User>('/users/1', {
  headers: {
    Authorization: 'Bearer token',
    'X-Custom-Header': 'value',
  },
});
```

### タイムアウト

```typescript
const { data } = await getRequest<User>('/users/1', {
  timeout: 5000, // 5秒でタイムアウト
});
```

### クエリパラメータ

```typescript
const { data } = await getRequest<User[]>('/users', {
  page: 1,
  limit: 10,
  sort: 'name',
  tags: ['admin', 'active'], // 配列もサポート
});
// => GET /users?page=1&limit=10&sort=name&tags=admin&tags=active
```

### インターセプター

#### リクエストインターセプター

リクエスト前に共通処理を実行します。

```typescript
const { data } = await getRequest<User>('/users/1', {
  onRequest: async (config) => {
    // トークンを自動的に付与
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

#### レスポンスインターセプター

レスポンス後にデータを変換します。

```typescript
const { data } = await getRequest<User>('/users/1', {
  onResponse: async (response, data) => {
    // データを変換
    console.log('Response received:', response.status);
    return {
      ...data,
      fetchedAt: new Date(),
    };
  },
});
```

#### エラーインターセプター

エラー時の共通処理を実行します。

```typescript
const { data } = await getRequest<User>('/users/1', {
  onError: async (error) => {
    // エラーログを送信
    await logError(error);

    // 401エラーの場合は再認証
    if (error.status === 401) {
      await refreshToken();
    }
  },
});
```

## ユーティリティ関数

### `isFetcherError<E>(error)`

エラーが`FetcherError`かどうかを判定します。

```typescript
import { isFetcherError } from '@r-ishino/sample-fetcher';

try {
  await getRequest<User>('/users/1');
} catch (error) {
  if (isFetcherError(error)) {
    console.error('API Error:', error.status, error.data);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### `createFetcherError<E>(message, status, response?, data?)`

カスタムの`FetcherError`を作成します。

```typescript
import { createFetcherError } from '@r-ishino/sample-fetcher';

const error = createFetcherError('Not found', 404);
throw error;
```

## Next.jsでの使用例

Next.js App RouterでJWT認証を使用する場合の詳細な例は、[docs/usage-nextjs.md](./docs/usage-nextjs.md)を参照してください。

主なトピック：

- Server ComponentsとClient Componentsでの使用
- cookieからのJWT取得と自動付与
- Server Actionsでの使用
- Route Handlerでの使用
- インターセプターを使った共通処理

## サーバーサイド/クライアントサイド対応

このライブラリは、以下の環境で動作します：

- ✅ **Node.js 18+**: グローバルの`fetch` APIを使用
- ✅ **モダンブラウザ**: Chrome, Firefox, Safari, Edge

### 注意事項

- **Node.js 18未満**: `fetch` APIが利用できないため、node-fetchなどのポリフィルが必要
- **相対URL**: サーバーサイドでは完全なURLまたは`baseURL`の指定が必要
- **Cookie**: ブラウザでは自動的に送信されますが、Node.jsでは手動でヘッダーに設定が必要

## 型定義

このライブラリは完全にTypeScriptで書かれており、型定義が含まれています。

```typescript
import type {
  FetcherOptions,
  FetcherResponse,
  FetcherError,
} from '@r-ishino/sample-fetcher';
```

## ライセンス

MIT

## リンク

- [Next.jsでの使用例](./docs/usage-nextjs.md)
- [パッケージ情報](./package.json)
