/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  env: {
    // Add any environment variables that need to be explicitly exposed
    // These will complement, not replace, the variables from .env files
  },
  experimental: {
    // Any experimental features can go here
  },
  // Ensure SVG can be imported as React components
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;