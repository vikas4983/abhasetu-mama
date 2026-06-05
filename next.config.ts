/** @type {import('next').NextConfig} */
const nextConfig: any = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/abdm/:path*',
        destination: 'http://localhost:3001/api/abdm/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
