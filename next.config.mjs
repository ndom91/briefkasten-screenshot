/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    legacyBrowsers: false,
    browsersListForSwc: true,
  },
}

export default nextConfig
