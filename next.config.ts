import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Lets the dev server's HMR socket accept 127.0.0.1 as well as localhost.
  allowedDevOrigins: ['127.0.0.1'],
};

export default config;
