/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack: treat mongoose as external so it's not bundled for the browser
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'mongoose'];
    }
    return config;
  },
};

export default nextConfig;
