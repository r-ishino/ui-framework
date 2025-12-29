import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample UI Framework Demo',
  description: 'Demo application for @sample packages',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
