'use client';

import { Button } from '@sample/ui';
import { useState } from 'react';
import type { ReactElement } from 'react';

export const AsyncButtonDemo = (): ReactElement => {
  const [message, setMessage] = useState<string>('');

  const handleAsyncClick = async (): Promise<void> => {
    setMessage('Loading...');
    // Simulate async operation (e.g., API call)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setMessage('Completed! (Button was disabled during execution)');
  };

  const handleSyncClick = (): void => {
    setMessage('Sync click! (No loading state)');
  };

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>Async Button Demo</h2>
      <p>
        Buttons automatically disable during async onClick execution to prevent
        multiple clicks.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <Button variant="primary" onClick={handleAsyncClick}>
          Async Button (2s delay)
        </Button>
        <Button variant="secondary" onClick={handleSyncClick}>
          Sync Button
        </Button>
      </div>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
          }}
        >
          <strong>Result:</strong> {message}
        </div>
      )}
    </section>
  );
};
