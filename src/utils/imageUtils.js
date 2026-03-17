/**
 * Normalize an image path to the correct URL for the current environment.
 *
 * Rules:
 *  1. Empty / null → return ''
 *  2. data: URIs → return as-is (base64 previews)
 *  3. ALWAYS rewrite any http://localhost:PORT/uploads/... → /uploads/...
 *     (old images were stored with the full localhost URL in DB)
 *  4. Paths already starting with /uploads → return as-is
 *  5. Bare filename or any other relative path → prefix with /uploads/
 */
export const getImageUrl = (path) => {
  if (!path) return ''

  // Base64 previews – keep as-is
  if (path.startsWith('data:')) return path

  // Always normalize localhost URLs regardless of current environment.
  // This fixes old images that were saved as http://localhost:PORT/uploads/filename
  if (path.includes('localhost') && path.includes('/uploads/')) {
    const filename = path.split('/uploads/').pop()
    return `/uploads/${filename}`
  }

  // Already a relative /uploads/ path → fine
  if (path.startsWith('/uploads/')) return path

  // Fully qualified non-localhost URL (e.g. CDN) → return as-is
  if (path.startsWith('http')) return path

  // Bare filename or other relative segment → prefix with /uploads/
  const clean = path.startsWith('/') ? path.slice(1) : path
  return `/uploads/${clean}`
}
