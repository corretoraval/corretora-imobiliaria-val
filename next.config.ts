import type { NextConfig } from "next";

const configuredHostname = process.env.SUPABASE_URL
  ? (() => {
      try {
        return new URL(process.env.SUPABASE_URL).hostname;
      } catch {
        return null;
      }
    })()
  : null;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      ...(configuredHostname
        ? [
            {
              protocol: "https" as const,
              hostname: configuredHostname,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
