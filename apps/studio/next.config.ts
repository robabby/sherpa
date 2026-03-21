import { withSherpa } from "@sherpa/studio/next"

const config = withSherpa({
  output: "standalone",
  pageExtensions: ["js", "jsx", "ts", "tsx"],
})

export default config
