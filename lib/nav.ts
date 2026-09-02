/**
 * Normalise une destination de redirection fournie par l'utilisateur.
 * Empêche les redirections ouvertes (`//evil.com`, `https://evil.com`,
 * `/\evil.com`) en n'acceptant qu'un chemin interne.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/matches",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
