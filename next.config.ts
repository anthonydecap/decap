import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/legacy-redirects";

const nextConfig: NextConfig = {
  // Old orchestrionix.com / decap.be URLs → new pages (see src/lib/legacy-redirects.ts).
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
