// ─────────────────────────  Component  ────────────────────────
// File: frontend/src/components/ListingCard.jsx
// -------------------------------------------------------------
import { useState } from 'react';
import { buyListing, cancelListing } from '../api/marketApi.js';

export default function ListingCard({ listing, isOwn, onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      await buyListing(listing._id);
      onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelListing(listing._id);
      onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-xl p-4 shadow flex flex-col gap-2">
      <h3 className="font-semibold text-lg capitalize">{listing.itemType}</h3>
      <p>Price: <span className="font-mono">${listing.price.toLocaleString()}</span></p>
      <p className="text-sm text-gray-500">Seller: {listing.seller?.username || 'Unknown'}</p>

      {isOwn ? (
        <button onClick={handleCancel} disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white rounded-md py-1 mt-auto">
          {loading ? 'Cancelling…' : 'Cancel'}
        </button>
      ) : (
        <button onClick={handleBuy} disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-1 mt-auto">
          {loading ? 'Buying…' : 'Buy'}
        </button>
      )}
    </div>
  );
}