/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from attempting to bundle native Node.js packages.
  // Prisma and ioredis use native binaries that must remain as external deps.
  serverExternalPackages: ['@prisma/client', 'prisma', 'ioredis'],

  // Ensure Prisma's query engine binary is included in the Vercel output bundle.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.prisma/client/**'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

export default nextConfig;

