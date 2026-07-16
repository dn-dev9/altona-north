import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@paypal/paypal-server-sdk', 'node-ical'],
};

export default nextConfig;
