/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/portfolio',
        destination: '/portfolio/dashboard',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
