/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**", // <-- allow all paths from ImageKit
      },
      {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
    ],
  },
};

module.exports = nextConfig;
