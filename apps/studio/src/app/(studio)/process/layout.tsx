/**
 * Process layout — full-width, no max-w-6xl constraint.
 * The workspace uses the full content area for its three-zone grid.
 * Other studio pages use max-w-6xl via their own layouts.
 */
export default function ProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
