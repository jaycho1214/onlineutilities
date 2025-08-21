import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  images: {
    qualities: [50],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
