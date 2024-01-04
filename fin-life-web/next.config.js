/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/portfolio',
        destination: '/portfolio/assets',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
