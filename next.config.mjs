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
    // The canonical app URL — used in the Access-Control-Allow-Origin header
    // so that the browser accepts responses from the auth API.
    const appUrl =
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    return [
      // ── CORS headers for Better Auth endpoints ───────────────────────────
      // These routes are called by the client-side auth library. Without the
      // correct CORS headers, the browser blocks the response when the request
      // origin doesn't match the deployment URL.
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: appUrl,
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
        ],
      },

      // ── Security headers for all other routes ────────────────────────────
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


