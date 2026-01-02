'use client';

import type { ReactElement } from 'react';
import { NextLink } from '@r-ishino/sample-nextjs';

const About = (): ReactElement => (
  <main style={{ padding: '2rem' }}>
    <h1>About Page</h1>
    <p>This is the about page of the Sample UI Framework demo application.</p>

    <section style={{ marginTop: '2rem' }}>
      <NextLink href="/" variant="primary">
        Back to Home
      </NextLink>
    </section>
  </main>
);

export default About;
