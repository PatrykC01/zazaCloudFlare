// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeFonts: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
