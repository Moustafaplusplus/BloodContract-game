// ============================
// frontend/src/lib/api.js – updated
// ============================
/**
 * Tiny fetch wrapper.
 * • Reads BASE URL from VITE_API_URL (no trailing slash), defaults to current origin.
 * • Always hits `/api/...`.
 * • Gracefully handles non-JSON error bodies (e.g. HTML fallback).
 * • Skips browser cache to prevent 304s.
 */

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, ''); // strip trailing slash

function buildPath(url) {
  // accept 'crimes' or '/crimes' – ensure exactly one slash
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${BASE}/api${clean}`;
}

export default async function api(method, url, body) {
  const token = localStorage.getItem('token');

  const res = await fetch(buildPath(url), {
    method,
    cache: 'no-store', // ← prevents 304s on reused GETs
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok && res.status !== 304) throw data; // ← 304s won't break UI

  return data;
}

// Convenience helpers
api.get  = (url) => api('GET',  url);
api.post = (url, body) => api('POST', url, body);
