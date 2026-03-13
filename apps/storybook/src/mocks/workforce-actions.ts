// Mock for @/app/workforce/actions (server action, uses Node fs)
export async function updateAgentRole(
  _slug: string,
  _updates: { frontmatter?: Record<string, unknown>; body?: string },
): Promise<{ success: boolean; error?: string }> {
  // Simulate a save with a short delay
  await new Promise((r) => setTimeout(r, 500))
  return { success: true }
}
