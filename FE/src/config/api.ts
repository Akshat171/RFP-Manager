// API Configuration
// This reads from environment variable VITE_API_BASE_URL
// Default to localhost:3000 if not set

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Helper function to build API URLs
export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
