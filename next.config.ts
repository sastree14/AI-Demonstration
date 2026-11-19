import type { NextConfig } from "next";

const forGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  ...(forGitHubPages ? { basePath: "/AI-Demonstration" } : {}),
};

export default nextConfig;
