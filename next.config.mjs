/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    legacyBrowsers: false,
    browsersListForSwc: true,
  },
  async headers() {
    return [
      {
        source: '/api/image',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://briefkasten.vercel.app',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
    ]
  },
}

export default nextConfig
