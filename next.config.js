/** @type {import('next').NextConfig} */
// const nextConfig = {}

// module.exports = nextConfig


const nextConfig = {
    images: {
      domains: ['192.168.1.40'], // Add your 192.168.1.40 hostname here
    },
    server: {
      host: '0.0.0.0',
      port: 3000, // or your preferred port
    },
  }
  
  module.exports = nextConfig