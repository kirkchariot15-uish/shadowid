/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  generateBuildId: async () => {
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace(/\..*/,'');
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  },
  swcMinify: true,
}

export default nextConfig
