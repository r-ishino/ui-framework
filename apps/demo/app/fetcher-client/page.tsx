'use client';

import React, { useState } from 'react';
import { getRequest, postRequest, isSuccess } from '@r-ishino/sample-fetcher';

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

type NewTodo = {
  userId: number;
  title: string;
  completed: boolean;
};

/**
 * Client Component: fetcherをクライアントサイドで使用する例（Result型パターン）
 */
const FetcherClientPage = (): React.JSX.Element => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTodos = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const result = await getRequest<Todo[]>(
      '/todos',
      { _limit: 5 },
      {
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 5000,
      }
    );

    if (isSuccess(result)) {
      setTodos(result.data);
    } else {
      setError(`Error ${result.status}: ${result.message}`);
    }

    setLoading(false);
  };

  const createTodo = async (): Promise<void> => {
    if (!newTodoTitle.trim()) {
      return;
    }

    setCreateLoading(true);
    setError(null);

    const newTodo: NewTodo = {
      userId: 1,
      title: newTodoTitle,
      completed: false,
    };

    const result = await postRequest<Todo>('/todos', newTodo, {
      baseURL: 'https://jsonplaceholder.typicode.com',
      onResponse: (response, data) => {
        console.log('Response received:', response.status);
        return data;
      },
    });

    if (isSuccess(result)) {
      // 作成されたTodoをリストに追加
      setTodos([result.data, ...todos]);
      setNewTodoTitle('');
    } else {
      setError(`Error ${result.status}: ${result.message}`);
    }

    setCreateLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Fetcher - Client Side Example</h1>
      <p>
        This page demonstrates fetcher usage in a Client Component with Result
        type pattern.
      </p>

      <section style={{ marginTop: '2rem' }}>
        <h2>Fetch Todos</h2>
        <button
          disabled={loading}
          onClick={fetchTodos}
          style={{
            padding: '0.5rem 1rem',
            background: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Fetch Todos'}
        </button>

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c00',
            }}
          >
            {error}
          </div>
        )}

        {todos.length > 0 && (
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {todos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <input
                  checked={todo.completed}
                  readOnly
                  style={{ cursor: 'default' }}
                  type="checkbox"
                />
                <span
                  style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  }}
                >
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Create Todo</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void createTodo();
              }
            }}
            placeholder="Enter todo title..."
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            type="text"
            value={newTodoTitle}
          />
          <button
            disabled={createLoading || !newTodoTitle.trim()}
            onClick={createTodo}
            style={{
              padding: '0.5rem 1rem',
              background:
                createLoading || !newTodoTitle.trim() ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor:
                createLoading || !newTodoTitle.trim()
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {createLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Note: JSONPlaceholder is a fake API, so the POST request won't
          actually create data on the server.
        </p>
      </section>

      <section
        style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}
      >
        <h3>Implementation Details (Result型パターン)</h3>
        <pre style={{ overflow: 'auto' }}>
          {`// Client Component with Result type pattern
const result = await getRequest<Todo[]>(
  '/todos',
  { _limit: 5 },
  {
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
  }
);

// try-catch不要！
if (isSuccess(result)) {
  setTodos(result.data);
} else {
  setError(\`Error \${result.status}: \${result.message}\`);
}

const postResult = await postRequest<Todo>(
  '/todos',
  newTodo,
  {
    baseURL: 'https://jsonplaceholder.typicode.com',
    onResponse: (response, data) => {
      console.log('Response received:', response.status);
      return data;
    },
  }
);

if (isSuccess(postResult)) {
  setTodos([postResult.data, ...todos]);
}`}
        </pre>
        <ul style={{ marginTop: '1rem' }}>
          <li>✅ Interactive user interface</li>
          <li>✅ Loading and error states</li>
          <li>✅ try-catch不要（Result型パターン）</li>
          <li>✅ 型安全なエラーハンドリング</li>
          <li>✅ Response interceptor (onResponse)</li>
          <li>✅ Timeout configuration</li>
        </ul>
      </section>

      <div style={{ marginTop: '2rem' }}>
        <a href="/fetcher-server" style={{ color: 'blue' }}>
          ← Server-side Example
        </a>
        {' | '}
        <a href="/" style={{ color: 'blue' }}>
          Back to Home →
        </a>
      </div>
    </div>
  );
};

export default FetcherClientPage;
