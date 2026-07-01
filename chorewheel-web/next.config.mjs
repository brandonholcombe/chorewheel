/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-sqlite3 is a native module; keep it external to the server bundle
  // so Next doesn't try to trace/bundle the .node binary.
  serverExternalPackages: ['better-sqlite3'],
  output: 'standalone',
};

export default nextConfig;
