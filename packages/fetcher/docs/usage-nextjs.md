# Next.js での使用例（JWT認証）

このドキュメントでは、Next.js App Router環境でJWTがcookieに保存されている場合のfetcherの活用方法を説明します。

## 目次

- [共通のfetcherラッパー](#共通のfetcherラッパー)
- [型定義](#型定義)
- [Server Componentでの利用](#server-componentでの利用)
- [Server Actionsでの利用](#server-actionsでの利用)
- [Client Componentでの利用](#client-componentでの利用)
- [Route Handlerでの利用](#route-handlerでの利用)

## 共通のfetcherラッパー

まず、JWTトークンを自動的に付与する共通のfetcherラッパーを作成します。

### lib/api/client.ts

```typescript
import { fetcher, getRequest, postRequest, putRequest, deleteRequest, type FetcherOptions } from '@r-ishino/sample-fetcher';
import { cookies } from 'next/headers';

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

/**
 * サーバーサイド用：cookieからJWTを取得してヘッダーに設定
 */
export const createServerFetcher = async () => {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;

  const baseOptions: FetcherOptions = {
    baseURL: API_BASE_URL,
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    onError: async (error) => {
      console.error('API Error:', error.status, error.message);
      // 401エラーの場合は認証エラーとしてログ
      if (error.status === 401) {
        console.error('Unauthorized: JWT may be expired or invalid');
      }
    },
  };

  return {
    getRequest: <T, E = unknown>(url: string, options?: FetcherOptions<E>) =>
      get<T, E>(url, { ...baseOptions, ...options }),
    postRequest: <T, E = unknown>(url: string, data?: unknown, options?: FetcherOptions<E>) =>
      post<T, E>(url, data, { ...baseOptions, ...options }),
    putRequest: <T, E = unknown>(url: string, data?: unknown, options?: FetcherOptions<E>) =>
      put<T, E>(url, data, { ...baseOptions, ...options }),
    deleteRequest: <T, E = unknown>(url: string, options?: FetcherOptions<E>) =>
      del<T, E>(url, { ...baseOptions, ...options }),
  };
};

/**
 * クライアントサイド用：cookieは自動的に送信されるが、
 * 必要に応じてインターセプターで処理を追加
 */
export const createClientFetcher = () => {
  const baseOptions: FetcherOptions = {
    baseURL: API_BASE_URL,
    // ブラウザではcookieが自動的に送信されるため、
    // credentials: 'include'を設定
    credentials: 'include',
    onRequest: async (config) => {
      // 必要に応じてクライアントサイドでの前処理
      console.log('Request:', config.method, config);
      return config;
    },
    onError: async (error) => {
      console.error('API Error:', error.status, error.message);
      // 401エラーの場合はログインページへリダイレクト
      if (error.status === 401) {
        window.location.href = '/login';
      }
    },
  };

  return {
    getRequest: <T, E = unknown>(url: string, options?: FetcherOptions<E>) =>
      get<T, E>(url, { ...baseOptions, ...options }),
    postRequest: <T, E = unknown>(url: string, data?: unknown, options?: FetcherOptions<E>) =>
      post<T, E>(url, data, { ...baseOptions, ...options }),
    putRequest: <T, E = unknown>(url: string, data?: unknown, options?: FetcherOptions<E>) =>
      put<T, E>(url, data, { ...baseOptions, ...options }),
    deleteRequest: <T, E = unknown>(url: string, options?: FetcherOptions<E>) =>
      del<T, E>(url, { ...baseOptions, ...options }),
  };
};
```

## 型定義

### lib/api/types.ts

```typescript
// APIレスポンスの型
export type User = {
  id: string;
  name: string;
  email: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
};

// APIエラーの型
export type ApiError = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};
```

## Server Componentでの利用

### app/dashboard/page.tsx

```typescript
import { createServerFetcher } from '@/lib/api/client';
import type { User, ApiError } from '@/lib/api/types';

export default async function DashboardPage() {
  const api = await createServerFetcher();

  try {
    // 型安全にAPIを呼び出し
    const { data: user } = await api.getRequest<User, ApiError>('/api/user/me');

    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
      </div>
    );
  } catch (error) {
    // エラーハンドリング
    return (
      <div>
        <h1>Error</h1>
        <p>Failed to load user data</p>
      </div>
    );
  }
}
```

**ポイント:**
- `cookies()`を使ってサーバーサイドでJWTを取得
- `Authorization`ヘッダーにJWTを自動的に設定
- 型安全なAPI呼び出し（`User`と`ApiError`の型を指定）

## Server Actionsでの利用

### app/posts/actions.ts

```typescript
'use server';

import { createServerFetcher } from '@/lib/api/client';
import { revalidatePath } from 'next/cache';
import type { Post, ApiError } from '@/lib/api/types';

export async function createPost(formData: FormData) {
  const api = await createServerFetcher();

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  try {
    const { data: post } = await api.postRequest<Post, ApiError>('/api/posts', {
      title,
      content,
    });

    // 成功したらページを再検証
    revalidatePath('/posts');

    return { success: true, post };
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      return {
        success: false,
        error: {
          message: (error as { message?: string }).message || 'Failed to create post',
          status: (error as { status: number }).status,
        },
      };
    }
    return { success: false, error: { message: 'Unknown error' } };
  }
}

export async function deletePost(postId: string) {
  const api = await createServerFetcher();

  try {
    await api.deleteRequest<void, ApiError>(`/api/posts/${postId}`);
    revalidatePath('/posts');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete post' };
  }
}
```

**ポイント:**
- Server Actionsで認証が必要なAPIを呼び出し
- `revalidatePath`でキャッシュを更新
- エラーハンドリングを含む適切なレスポンスを返す

## Client Componentでの利用

### app/posts/create-post-form.tsx

```typescript
'use client';

import { useState } from 'react';
import { createClientFetcher } from '@/lib/api/client';
import type { Post, ApiError } from '@/lib/api/types';

export function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = createClientFetcher();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: post } = await api.postRequest<Post, ApiError>('/api/posts', {
        title,
        content,
      });

      console.log('Post created:', post);
      setTitle('');
      setContent('');
      // 成功時の処理（例：リストを再取得、通知表示など）
    } catch (err) {
      if (err && typeof err === 'object' && 'data' in err) {
        const error = err as { data?: ApiError };
        setError(error.data?.message || 'Failed to create post');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

**ポイント:**
- `credentials: 'include'`でブラウザのcookieを自動送信
- `onError`インターセプターで401エラー時に自動的にログインページへリダイレクト
- ローディング状態とエラー状態を管理

## Route Handlerでの利用

### app/api/proxy/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetcher } from '@r-ishino/sample-fetcher';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;

  if (!jwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await fetcher(
      'https://api.example.com/api/data',
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

**ポイント:**
- Route Handlerで外部APIへのプロキシを実装
- cookieからJWTを取得して外部APIに転送
- エラーハンドリングを含む適切なレスポンスを返す

## 主なポイントまとめ

### サーバーサイド
- `cookies()`を使ってJWTを取得
- `Authorization`ヘッダーにJWTを設定
- Server ComponentsやServer Actionsで使用

### クライアントサイド
- `credentials: 'include'`でcookieを自動送信
- Client Componentsで使用
- インターセプターでエラーハンドリング（401エラーでリダイレクトなど）

### 型安全性
- ジェネリック型`<T, E>`でレスポンスとエラーの型を指定
- TypeScriptの型推論を活用

### インターセプター
- `onRequest`: リクエスト前の共通処理
- `onResponse`: レスポンス後のデータ変換
- `onError`: エラー時の共通処理（ログ出力、リダイレクトなど）

この構造により、型安全で保守性の高いAPI通信を実現できます。
