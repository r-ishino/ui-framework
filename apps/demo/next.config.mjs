/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@sample/ui', '@sample/nextjs', '@sample/util'],
  eslint: {
    // ビルド時は型チェックのみ実行し、ESLintは別途実行
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
