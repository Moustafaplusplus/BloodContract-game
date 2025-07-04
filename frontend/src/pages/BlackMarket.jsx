// ─────────────────────────  Page: Black Market  ───────────────
// File: frontend/src/pages/BlackMarket.jsx
// -------------------------------------------------------------
import { useEffect, useState } from 'react';
import { fetchListings, createListing } from '../api/marketApi.js';
import ListingCard from '../components/ListingCard.jsx';
import { useAuth } from '../context/HudProvider.jsx'; // assuming provides user info

export default function BlackMarket() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState({ itemId: '', itemType: 'weapon', price: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  async function load() {
    try { setListings(await fetchListings()); }
    catch (e) { alert(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true);
    try {
      await createListing({ ...form, price: Number(form.price) });
      setForm({ itemId: '', itemType: 'weapon', price: '' });
      await load();
    } catch (e) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  const myId = user?._id;
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Black Market</h1>

      {/* Create Listing */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
        <input value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })}
          placeholder="Item ID" required className="input input-bordered" />
        <select value={form.itemType} onChange={e => setForm({ ...form, itemType: e.target.value })}
          className="select select-bordered">
          <option value="weapon">Weapon</option>
          <option value="armor">Armor</option>
          <option value="consumable">Consumable</option>
        </select>
        <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
          placeholder="Price" required className="input input-bordered" />
        <button type="submit" disabled={loading}
          className="btn btn-primary">{loading ? 'Listing…' : 'List Item'}</button>
      </form>

      {/* Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {listings.map(lst => (
          <ListingCard key={lst._id} listing={lst} isOwn={lst.seller?._id === myId} onRefresh={load} />
        ))}
      </div>
    </div>
  );
}