/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/portfolio',
        destination: '/portfolio/assets',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
