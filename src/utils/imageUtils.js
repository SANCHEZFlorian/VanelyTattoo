export const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) {
    // If we have an old localhost URL but we are in production, try to fix it
    if (path.includes('localhost') && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      const parts = path.split('/uploads/')
      if (parts.length > 1) {
        return `/uploads/${parts[1]}`
      }
    }
    return path
  }
  
  // Get API URL from env or default
  const apiUrl = import.meta.env.VITE_API_URL || ''
  
  // If apiUrl is a full URL (like http://api.example.com), use it.
  // If it's relative (like /api), we might need to handle it differently depending on hosting.
  // Given the current setup, if images are served at /uploads on the backend:
  
  if (apiUrl.startsWith('http')) {
    // Return http://api.com/uploads/...
    // Ensure we don't double the slash
    const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const p = path.startsWith('/') ? path : `/${path}`
    // If path already starts with /uploads, we need to be careful if apiUrl includes /api
    // Usually images are at the root of the backend, not under /api
    // In server/index.js: app.use('/uploads', express.static('uploads'))
    // So if apiUrl is http://host:3000/api, images are at http://host:3000/uploads
    const domain = base.replace(/\/api$/, '')
    return `${domain}${p}`
  }

  // If apiUrl is relative or not set, assume images are on the same domain
  return path.startsWith('/') ? path : `/${path}`
}
