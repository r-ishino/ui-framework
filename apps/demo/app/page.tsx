import type { ReactElement } from 'react';
import { Button, version as uiVersion } from '@sample/ui';
import { version as nextjsVersion } from '@sample/nextjs';
import { version as utilVersion } from '@sample/util';

const Home = (): ReactElement => (
  <main style={{ padding: '2rem' }}>
    <h1>Sample UI Framework Demo</h1>
    <p>Welcome to the Sample UI Framework demo application!</p>

    <section style={{ marginTop: '2rem' }}>
      <h2>Installed Packages</h2>
      <ul>
        <li>@sample/ui: v{uiVersion}</li>
        <li>@sample/nextjs: v{nextjsVersion}</li>
        <li>@sample/util: v{utilVersion}</li>
      </ul>
    </section>

    <section style={{ marginTop: '2rem' }}>
      <h2>Button Component Demo</h2>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <Button variant="primary" size="md">
          Primary Button
        </Button>
        <Button variant="secondary" size="md">
          Secondary Button
        </Button>
        <Button variant="outline" size="md">
          Outline Button
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          alignItems: 'center',
        }}
      >
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="md">
          Medium
        </Button>
        <Button variant="primary" size="lg">
          Large
        </Button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Button variant="primary" disabled>
          Disabled Button
        </Button>
      </div>
    </section>

    <section style={{ marginTop: '2rem' }}>
      <p>
        This is a demo application to showcase the components and utilities
        provided by the Sample UI Framework.
      </p>
    </section>
  </main>
);

export default Home;
