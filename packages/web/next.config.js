/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable responsive images
  images: {
    domains: ['localhost'],
  },
  // Configure allowed dev origins for cross-origin requests
  allowedDevOrigins: ['192.168.1.68'],
  
  // 压缩配置
  compress: true,
  
  // 确保静态资源正确处理
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // 环境变量处理
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig