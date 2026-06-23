/** @type {import('next').NextConfig} */
const nextConfig: any = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/abdm/:path*',
        destination: `${backendUrl}/api/abdm/:path*`,
      },
    ];
  },
};

export default nextConfig;
