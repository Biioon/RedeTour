/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig