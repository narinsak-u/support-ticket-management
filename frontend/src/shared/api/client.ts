const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${apiOrigin}${path}`;
}
