import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/widgets',
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  }
};

export default nextConfig;
