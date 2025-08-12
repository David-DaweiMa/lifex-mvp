/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable responsive images
  images: {
    domains: ['localhost'],
  },
  // Configure allowed dev origins for cross-origin requests
  allowedDevOrigins: ['192.168.1.68'],
}

module.exports = nextConfig