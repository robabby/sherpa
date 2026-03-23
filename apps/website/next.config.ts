import type { NextConfig } from "next"
import { createMDX } from "fumadocs-mdx/next"

const config: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
}

const withMDX = createMDX()
export default withMDX(config)
