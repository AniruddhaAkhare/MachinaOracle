/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // // Redirect root "/" → "/dashboard"
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/dashboard",
  //       permanent: false,
  //     },
  //   ];
  // },

  // Allow WebSocket upgrade to pass through
  webpack(config) {
    return config;
  },
};

module.exports = nextConfig;
