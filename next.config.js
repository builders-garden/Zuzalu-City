/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PUBLIC_CERAMIC_API_ENDPOINT: process.env.PUBLIC_CERAMIC_API_ENDPOINT,
    PUBLIC_GRAPHQL_URI: process.env.PUBLIC_GRAPHQL_URI,
    PUBLIC_INDEXING_DID: process.env.PUBLIC_INDEXING_DID,
    PUBLIC_W3_STORAGE_DELEGATE_BASE_URL:
      process.env.PUBLIC_W3_STORAGE_DELEGATE_BASE_URL,
    PUBLIC_WALLET_CONNECT_PROJECT_ID:
      process.env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
    PUBLIC_LOG_LEVEL: process.env.PUBLIC_LOG_LEVEL,
    PUBLIC_API_STATUS_PATH: process.env.PUBLIC_API_STATUS_PATH,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ipfs.w3s.link',
        pathname: '**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        pathname: '/images/**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'nftstorage.link',
        pathname: '**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'scarlet-binding-hummingbird-437.mypinata.cloud',
        pathname: '/ipfs/**',
        port: '',
      },
      // https://gateway.lighthouse.storage
      {
        protocol: 'https',
        hostname: 'gateway.lighthouse.storage',
        pathname: '/ipfs/**',
        port: '',
      },
      {
        protocol: 'https',
        hostname:
          'bafkreifje7spdjm5tqts5ybraurrqp4u6ztabbpefp4kepyzcy5sk2uel4.ipfs.nftstorage.link',
        pathname: '**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
        port: '',
      },
    ],
  },
  swcMinify: false,
};

export default nextConfig;
