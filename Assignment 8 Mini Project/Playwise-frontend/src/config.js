const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Named export (for files using: import { API_BASE_URL })
export { API_BASE_URL };

export default API_BASE_URL;