// ─────────────────────────  API Helper  ───────────────────────
// File: frontend/src/api/marketApi.js
// -------------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ► Black Market
export async function fetchListings() {
  const res = await fetch(`${API_BASE}/black-market`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}
export async function createListing(data) {
  const res = await fetch(`${API_BASE}/black-market/list`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create listing');
  return res.json();
}
export async function buyListing(listingId) {
  const res = await fetch(`${API_BASE}/black-market/buy/${listingId}`, {
    method: 'POST', headers: authHeaders()
  });
  if (!res.ok) throw new Error('Purchase failed');
  return res.json();
}
export async function cancelListing(listingId) {
  const res = await fetch(`${API_BASE}/black-market/cancel/${listingId}`, {
    method: 'DELETE', headers: authHeaders()
  });
  if (!res.ok) throw new Error('Cancel failed');
  return res.json();
}

// ► Gold Market
export async function buyGold(amountUSD) {
  const res = await fetch(`${API_BASE}/gold-market/buy`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amountUSD })
  });
  if (!res.ok) throw new Error('Gold purchase failed');
  return res.json();
}
export async function buyVip(tier) {
  const res = await fetch(`${API_BASE}/gold-market/buy-vip`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ tier })
  });
  if (!res.ok) throw new Error('VIP purchase failed');
  return res.json();
}