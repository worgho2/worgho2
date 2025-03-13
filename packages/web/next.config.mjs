/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ hostname: '**.**' }],
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    config.resolve.alias.canvas = false;

    config.experiments = {
      layers: true,
      syncWebAssembly: true,
      asyncWebAssembly: true,
    };

    return config;
  },
};

export default nextConfig;
