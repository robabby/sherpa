export function SacredSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-6 w-6"
  return (
    <div className={`${sizeClass} animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary`} />
  )
}
