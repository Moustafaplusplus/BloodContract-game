// ─────────────────────────  FRONTEND  ────────────────────────
// File: frontend/src/api/gangApi.js
//--------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listGangs(page = 1) {
  const r = await fetch(`${API}/api/gangs?page=${page}`, { headers: authHeaders() });
  if (!r.ok) throw new Error('Failed to load gangs');
  return r.json();
}

export async function createGang(data) {
  const r = await fetch(`${API}/api/gangs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Creation failed');
  return r.json();
}

export async function getGang(id) {
  const r = await fetch(`${API}/api/gangs/${id}`, { headers: authHeaders() });
  if (!r.ok) throw new Error('Not found');
  return r.json();
}

export async function joinGang(id) {
  const r = await fetch(`${API}/api/gangs/${id}/join`, { method: 'POST', headers: authHeaders() });
  if (!r.ok) throw new Error('Join failed');
  return r.json();
}

export async function leaveGang(id) {
  const r = await fetch(`${API}/api/gangs/${id}/leave`, { method: 'POST', headers: authHeaders() });
  if (!r.ok) throw new Error('Leave failed');
  return r.json();
}

export async function myGang() {
  const r = await fetch(`${API}/api/my-gang`, { headers: authHeaders() });
  if (r.status === 204) return null;
  if (!r.ok) throw new Error('Failed');
  return r.json();
}