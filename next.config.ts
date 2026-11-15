import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so stray lockfiles in parent
  // folders (e.g. C:\Users\<user>\pnpm-lock.yaml) aren't picked up.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
