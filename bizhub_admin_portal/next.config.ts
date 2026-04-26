import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No security headers — admin portal doesn't need CSP
  // It's locked behind authentication instead
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
