import type { ImgHTMLAttributes } from "react"

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
}

export default function Image({ src, alt, width, height, fill, ...rest }: ImageProps) {
  const style = fill ? { objectFit: "cover" as const, width: "100%", height: "100%" } : {}
  return <img src={src} alt={alt} width={width} height={height} style={style} {...rest} />
}
