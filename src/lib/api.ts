/**
 * Crezonices Backend API Client Utility
 *
 * Provides environment-aware URL generation for backend endpoints.
 * In development or when using Firebase Hosting rewrites to Cloud Run,
 * requests use relative paths (`/api/...`).
 * When backend is hosted on a separate HTTPS domain or Cloud Run service,
 * configure `VITE_API_BASE_URL` in your environment (e.g. `https://crezonices-api.run.app`).
 */

export function getApiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
