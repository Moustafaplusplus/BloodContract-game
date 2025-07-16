import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Sword, Shield, Zap, Heart, ImageIcon } from "lucide-react";
import { useHud } from "@/hooks/useHud";

const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legend: 'text-yellow-400',
};
const rarityIcons = {
  common: '⭐',
  uncommon: '⭐⭐',
  rare: '⭐⭐⭐',
  epic: '⭐⭐⭐⭐',
  legend: '⭐⭐⭐⭐⭐',
};

const TABS = [
  { key: "available", label: "إعلانات السوق" },
  { key: "my", label: "إعلاناتي" },
];

function Stat({ icon: Icon, color, value, label }) {
  return (
    <div className="flex items-center gap-1 text-sm font-bold">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className={color}>{value}</span>
      <span className="text-hitman-300 font-normal text-xs">{label}</span>
    </div>
  );
}

function InventoryCard({ item, selected, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className={`bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border-2 rounded-2xl shadow-lg p-6 relative transition-all duration-300 backdrop-blur-sm cursor-pointer ${
        selected ? 'border-accent-red ring-2 ring-accent-red/40 animate-glow' : 'border-hitman-700 hover:scale-105 hover:shadow-2xl'
      }`}
      onClick={onClick}
    >
      <div className="relative w-full h-24 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 mb-4 overflow-hidden">
        {!imgError && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImageIcon className="w-10 h-10 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg text-white truncate">{item.name}</span>
        <span className={`text-base ${rarityColors[item.rarity]}`}>{rarityIcons[item.rarity]}</span>
      </div>
      <div className="flex flex-wrap gap-3 mb-2">
        {item.damage !== undefined && item.damage !== null && (
          <Stat icon={Sword} color="text-accent-red" value={item.damage} label="ضرر" />
        )}
        {item.def !== undefined && item.def !== null && (
          <Stat icon={Shield} color="text-accent-blue" value={item.def} label="دفاع" />
        )}
        {item.energyBonus !== undefined && item.energyBonus !== null && item.energyBonus !== 0 && (
          <Stat icon={Zap} color="text-accent-yellow" value={`+${item.energyBonus}`} label="طاقة" />
        )}
        {item.hpBonus !== undefined && item.hpBonus !== null && item.hpBonus !== 0 && (
          <Stat icon={Heart} color="text-accent-green" value={`+${item.hpBonus}`} label="صحة" />
        )}
      </div>
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="text-hitman-400">الكمية:</span>
        <span className="font-mono text-white text-base">{item.quantity}</span>
      </div>
    </div>
  );
}

export default function BlackMarket() {
  const { stats } = useHud();
  const [tab, setTab] = useState("available");
  // Available listings
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [errorListings, setErrorListings] = useState(null);
  // My listings
  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(false);
  const [errorMyListings, setErrorMyListings] = useState(null);
  // Inventory
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [errorInventory, setErrorInventory] = useState(null);
  // Post ad form
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [adPrice, setAdPrice] = useState("");
  const [posting, setPosting] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  // Fetch all listings
  useEffect(() => {
    setLoadingListings(true);
    setErrorListings(null);
    axios
      .get("/api/black-market/listings")
      .then((res) => setListings(res.data))
      .catch(() => setErrorListings("فشل في تحميل السوق السوداء"))
      .finally(() => setLoadingListings(false));
  }, []);

  // Fetch my listings and inventory when tab is 'my'
  useEffect(() => {
    if (tab !== "my") return;
    setLoadingMyListings(true);
    setErrorMyListings(null);
    axios
      .get("/api/black-market/listings/my")
      .then((res) => setMyListings(res.data))
      .catch(() => setErrorMyListings("فشل في تحميل إعلاناتك"))
      .finally(() => setLoadingMyListings(false));
    setLoadingInventory(true);
    setErrorInventory(null);
    axios
      .get("/api/inventory", { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } })
      .then((res) => {
        // Only unequipped items with quantity > 0
        setInventory((res.data.items || []).filter((i) => !i.equipped && i.quantity > 0));
      })
      .catch(() => setErrorInventory("فشل في تحميل الجرد"))
      .finally(() => setLoadingInventory(false));
  }, [tab, posting, cancelingId]);

  // Post new ad
  const handlePostAd = async (e) => {
    e.preventDefault();
    if (selectedIndex === null || !inventory[selectedIndex] || !adPrice || isNaN(adPrice) || Number(adPrice) < 1) {
      toast.error("يرجى اختيار عنصر وتحديد سعر صحيح");
      return;
    }
    setPosting(true);
    try {
      const item = inventory[selectedIndex];
      await axios.post(
        "/api/black-market/listings",
        {
          itemType: item.type,
          itemId: item.itemId,
          price: Number(adPrice),
          quantity: 1,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
      );
      toast.success("تم نشر الإعلان!");
      setSelectedIndex(null);
      setAdPrice("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "فشل في نشر الإعلان");
    } finally {
      setPosting(false);
    }
  };

  // Cancel ad
  const handleCancelAd = async (listingId) => {
    setCancelingId(listingId);
    try {
      await axios.post(
        "/api/black-market/listings/cancel",
        { listingId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
      );
      toast.success("تم إلغاء الإعلان واستعادة العنصر!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "فشل في إلغاء الإعلان");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🖤 السوق السوداء</h1>
      {/* Blackcoin Balance */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-5 h-5 rounded-full bg-gradient-to-br from-black via-zinc-900 to-zinc-800 border-2 border-accent-red flex items-center justify-center mr-1">
          <span className="text-xs text-accent-red font-bold">B</span>
        </span>
        <span className="font-mono text-lg text-accent-red">{stats?.blackcoins?.toLocaleString() ?? 0}</span>
        <span className="text-hitman-300">بلاك كوين</span>
      </div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-6 py-2 rounded-t-lg font-bold border-b-4 transition-all duration-200 ${
              tab === t.key
                ? "border-red-600 bg-zinc-900 text-red-400"
                : "border-transparent bg-zinc-800 text-white hover:text-red-400"
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
      {tab === "available" && (
        <div>
          {loadingListings && <div>جاري التحميل...</div>}
          {errorListings && <div className="text-red-400">{errorListings}</div>}
          {!loadingListings && !errorListings && listings.length === 0 && (
            <div className="text-gray-400">لا توجد عناصر في السوق السوداء حالياً.</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((item) => (
              <div key={item.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-white">
                <h3 className="font-bold text-lg text-red-500 mb-2">{item.name}</h3>
                <p className="text-gray-300 mb-2">{item.description}</p>
                <div className="flex justify-between text-sm mb-2">
                  <span>السعر:</span>
                  <span className="text-red-400 font-mono">{item.price}$</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>الكمية:</span>
                  <span className="text-red-400 font-mono">{item.quantity}</span>
                </div>
                {/* TODO: Add buy button if needed */}
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "my" && (
        <div className="space-y-10">
          {/* My Listings */}
          <div>
            <h2 className="text-xl font-bold text-red-400 mb-4">إعلاناتي النشطة</h2>
            {loadingMyListings && <div>جاري التحميل...</div>}
            {errorMyListings && <div className="text-red-400">{errorMyListings}</div>}
            {!loadingMyListings && !errorMyListings && myListings.length === 0 && (
              <div className="text-gray-400">لا توجد إعلانات نشطة.</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {myListings.map((item) => (
                <div key={item.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-white relative">
                  <h3 className="font-bold text-lg text-red-500 mb-2">{item.name}</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span>السعر:</span>
                    <span className="text-red-400 font-mono">{item.price}$</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>الكمية:</span>
                    <span className="text-red-400 font-mono">{item.quantity}</span>
                  </div>
                  <button
                    className={`w-full mt-2 py-2 rounded-lg font-bold bg-red-700 hover:bg-red-800 transition-all ${cancelingId === item.id ? "opacity-60 cursor-wait" : ""}`}
                    onClick={() => handleCancelAd(item.id)}
                    disabled={cancelingId === item.id}
                  >
                    {cancelingId === item.id ? "جاري الإلغاء..." : "إلغاء الإعلان واستعادة العنصر"}
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Post New Ad */}
          <div>
            <h2 className="text-xl font-bold text-red-400 mb-4">نشر إعلان جديد</h2>
            {loadingInventory && <div>جاري تحميل الجرد...</div>}
            {errorInventory && <div className="text-red-400">{errorInventory}</div>}
            {!loadingInventory && !errorInventory && inventory.length === 0 && (
              <div className="text-gray-400">لا توجد عناصر متاحة للنشر.</div>
            )}
            {!loadingInventory && !errorInventory && inventory.length > 0 && (
              <div>
                <label className="block mb-3 font-bold">اختر عنصراً من الجرد:</label>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
                  {inventory.map((item, idx) => (
                    <InventoryCard
                      key={item.id || idx}
                      item={item}
                      selected={selectedIndex === idx}
                      onClick={() => setSelectedIndex(idx)}
                    />
                  ))}
                </div>
                {selectedIndex !== null && inventory[selectedIndex] && (
                  <form onSubmit={handlePostAd} className="space-y-4 max-w-lg mx-auto">
                    <div>
                      <label className="block mb-1">السعر ($):</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
                        value={adPrice}
                        onChange={e => setAdPrice(e.target.value)}
                        placeholder="حدد السعر بالدولار"
                      />
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-2 rounded-lg font-bold bg-red-700 hover:bg-red-800 transition-all ${posting ? "opacity-60 cursor-wait" : ""}`}
                      disabled={posting}
                    >
                      {posting ? "جاري النشر..." : "نشر الإعلان"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
