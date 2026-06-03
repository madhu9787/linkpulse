// Auto-detect backend URL based on current browser host.
// This makes it work when accessed from other devices on the same network.
const host = window.location.hostname;
const protocol = window.location.protocol; // Use same protocol as frontend
const BACKEND_URL = `${protocol}//${host}:5000`;
export default BACKEND_URL;
