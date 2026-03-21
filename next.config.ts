import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.{glsl,vert,frag}": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "freeportfolio.page.gd",
      },
    ],
  },
};

export default nextConfig;
