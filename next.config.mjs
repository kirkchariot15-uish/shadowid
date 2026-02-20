/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  },
  // Force clean build - cache bust v100
  experimental: {},
}

export default nextConfig
