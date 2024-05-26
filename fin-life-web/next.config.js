/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/assets',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
