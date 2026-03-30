/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/bdo-sieges",
  assetPrefix: "/bdo-sieges",
  output: "export",
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: true,
}

export default nextConfig
