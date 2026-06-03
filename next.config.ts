/** @type {import('next').NextConfig} */
const nextConfig: any = {
  experimental: {
    turbo: false,
    cpus: 1,
    workerThreads: false,
  },
};

module.exports = nextConfig;
