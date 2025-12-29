import { version as uiVersion } from '@sample/ui';
import { version as nextjsVersion } from '@sample/nextjs';
import { version as utilVersion } from '@sample/util';

export default function Home() {
  return (
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
        <p>
          This is a demo application to showcase the components and utilities
          provided by the Sample UI Framework.
        </p>
      </section>
    </main>
  );
}
