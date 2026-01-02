'use client';

import type { ReactElement } from 'react';
import { Badge, Button, version as uiVersion } from '@r-ishino/sample-ui';
import { NextLink, version as nextjsVersion } from '@r-ishino/sample-nextjs';
import {
  version as utilVersion,
  isBlank,
  isObject,
} from '@r-ishino/sample-util';
import { AsyncButtonDemo } from './AsyncButtonDemo';

const Home = (): ReactElement => (
  <main style={{ padding: '2rem' }}>
    <h1>Sample UI Framework Demo</h1>
    <p>Welcome to the Sample UI Framework demo application!</p>

    <section style={{ marginTop: '2rem' }}>
      <h2>Installed Packages</h2>
      <ul>
        <li>@r-ishino/sample-ui: v{uiVersion}</li>
        <li>@r-ishino/sample-nextjs: v{nextjsVersion}</li>
        <li>@r-ishino/sample-util: v{utilVersion}</li>
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
        <Button size="md" variant="primary">
          Primary Button
        </Button>
        <Button size="md" variant="secondary">
          Secondary Button
        </Button>
        <Button size="md" variant="outline">
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
        <Button size="sm" variant="primary">
          Small
        </Button>
        <Button size="md" variant="primary">
          Medium
        </Button>
        <Button size="lg" variant="primary">
          Large
        </Button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Button disabled variant="primary">
          Disabled Button
        </Button>
      </div>
      <Badge>Badge</Badge>
    </section>

    <AsyncButtonDemo />

    <section style={{ marginTop: '2rem' }}>
      <h2>NextLink Component Demo</h2>
      <p style={{ marginTop: '1rem' }}>
        NextLink combines Next.js Link routing with @r-ishino/sample-ui styling:
      </p>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <NextLink href="/about" variant="primary">
          Go to About (Primary)
        </NextLink>
        <NextLink href="/about" variant="secondary">
          Go to About (Secondary)
        </NextLink>
        <NextLink href="/about" variant="muted">
          Go to About (Muted)
        </NextLink>
        <NextLink disabled href="/about" variant="primary">
          Disabled Link
        </NextLink>
      </div>
    </section>

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
