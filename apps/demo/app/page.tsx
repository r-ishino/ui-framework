import type { ReactElement } from 'react';
import { Badge, Button, version as uiVersion } from '@sample/ui';
import { version as nextjsVersion } from '@sample/nextjs';
import { version as utilVersion, isBlank, isObject } from '@sample/util';
import { AsyncButtonDemo } from './AsyncButtonDemo';

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
      <Badge>Badge</Badge>
    </section>

    <AsyncButtonDemo />

    <section style={{ marginTop: '2rem' }}>
      <h2>Helper Utilities Demo</h2>
      <div style={{ marginTop: '1rem' }}>
        <h3>isBlank()</h3>
        <ul>
          <li>isBlank(null): {String(isBlank(null))}</li>
          <li>isBlank(undefined): {String(isBlank(undefined))}</li>
          <li>isBlank(&quot;&quot;): {String(isBlank(''))}</li>
          <li>isBlank([]): {String(isBlank([]))}</li>
          <li>isBlank(&#123;&#125;): {String(isBlank({}))}</li>
          <li>isBlank(false): {String(isBlank(false))}</li>
          <li>isBlank(&quot;hello&quot;): {String(isBlank('hello'))}</li>
          <li>isBlank([1, 2, 3]): {String(isBlank([1, 2, 3]))}</li>
        </ul>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3>isObject()</h3>
        <ul>
          <li>isObject([]): {String(isObject([]))}</li>
          <li>isObject(null): {String(isObject(null))}</li>
          <li>isObject(&quot;string&quot;): {String(isObject('string'))}</li>
          <li>isObject(123): {String(isObject(123))}</li>
        </ul>
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
