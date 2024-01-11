/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/portfolio',
        destination: '/portfolio/dashboard',
        permanent: false
      },
      {
        source: '/admin',
        destination: '/admin/assets',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
