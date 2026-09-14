// In dev, the frontend and backend share an origin via the Vite proxy, so a
// relative "/uploads/..." path just works. In production they're deployed
// as separate services with different origins, so an uploaded image's path
// needs the backend's origin prefixed — derived from VITE_API_URL.
const API_ORIGIN = import.meta.env.VITE_API_URL
  ? new URL(import.meta.env.VITE_API_URL).origin
  : '';

export function resolveImageUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url}`;
}
