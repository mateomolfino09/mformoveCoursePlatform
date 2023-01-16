/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["rickandmortyapi.com", "image.tmdb.org", "rb.gy", "https://www.googleapis.com/youtube/v3/playlistItems"],
    loader: "custom",
    path: "/"
  },
  webpack: (config, options) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config
  },
};

module.exports = nextConfig
