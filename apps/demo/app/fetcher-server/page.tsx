import React from 'react';
import { getRequest, isSuccess } from '@r-ishino/sample-fetcher';

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  username: string;
};

/**
 * Server Component: fetcherをサーバーサイドで使用する例（Result型パターン）
 */
const FetcherServerPage = async (): Promise<React.JSX.Element> => {
  // JSONPlaceholder APIからデータを取得（Result型パターン）
  const [postsResult, userResult] = await Promise.all([
    getRequest<Post[]>(
      '/posts',
      { _limit: 5 },
      {
        baseURL: 'https://jsonplaceholder.typicode.com',
      }
    ),
    getRequest<User>('/users/1', undefined, {
      baseURL: 'https://jsonplaceholder.typicode.com',
    }),
  ]);

  // エラーチェック（try-catch不要！）
  if (!isSuccess(postsResult)) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Error</h1>
        <p style={{ color: 'red' }}>
          Failed to fetch posts: {postsResult.message}
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a href="/" style={{ color: 'blue' }}>
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!isSuccess(userResult)) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Error</h1>
        <p style={{ color: 'red' }}>
          Failed to fetch user: {userResult.message}
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a href="/" style={{ color: 'blue' }}>
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  // この時点で両方とも成功している（型安全に取得できる）
  const posts = postsResult.data;
  const user = userResult.data;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Fetcher - Server Side Example</h1>
      <p>This page demonstrates fetcher usage in a Server Component.</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>User Information (GET /users/1)</h2>
        <div
          style={{
            border: '1px solid #ddd',
            padding: '1rem',
            borderRadius: '4px',
          }}
        >
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Posts (GET /posts?_limit=5)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: '1px solid #ddd',
                padding: '1rem',
                borderRadius: '4px',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                {post.id}. {post.title}
              </h3>
              <p style={{ margin: 0, color: '#666' }}>{post.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}
      >
        <h3>Implementation Details (Result型パターン)</h3>
        <pre style={{ overflow: 'auto' }}>
          {`// Server Component - try-catch不要！
const [postsResult, userResult] = await Promise.all([
  getRequest<Post[]>('/posts', { _limit: 5 }, {
    baseURL: 'https://jsonplaceholder.typicode.com',
  }),
  getRequest<User>('/users/1', undefined, {
    baseURL: 'https://jsonplaceholder.typicode.com',
  }),
]);

// 型安全なエラーチェック
if (!isSuccess(postsResult)) {
  return <ErrorPage message={postsResult.message} />;
}
if (!isSuccess(userResult)) {
  return <ErrorPage message={userResult.message} />;
}

// 成功時はデータが型安全に利用可能
const posts = postsResult.data;
const user = userResult.data;`}
        </pre>
        <ul style={{ marginTop: '1rem' }}>
          <li>✅ try-catch不要（Result型で成功/失敗を管理）</li>
          <li>✅ 型安全なエラーハンドリング</li>
          <li>✅ コンパイラがエラーチェックを強制</li>
          <li>✅ Railway-Oriented Programming</li>
        </ul>
      </section>

      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ color: 'blue' }}>
          ← Back to Home
        </a>
        {' | '}
        <a href="/fetcher-client" style={{ color: 'blue' }}>
          Client-side Example →
        </a>
      </div>
    </div>
  );
};

export default FetcherServerPage;
