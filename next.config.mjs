/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/bdo-sieges",
  assetPrefix: "/bdo-sieges",
}

export default nextConfig
