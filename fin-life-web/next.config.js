/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/investments',
        destination: '/investments/dashboard',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
