// Read from environment variables if defined (e.g. Vercel deployment)
// Otherwise fallback to local network detection
const BACKEND_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

export default BACKEND_URL;
