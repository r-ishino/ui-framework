import type { Metadata } from 'next';
import type { ReactNode, ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'Sample UI Framework Demo',
  description: 'Demo application for @sample packages',
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps): ReactElement => (
  <html lang="ja">
    <body>{children}</body>
  </html>
);

export default RootLayout;
