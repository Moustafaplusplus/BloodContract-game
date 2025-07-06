// frontend/src/pages/Allies.jsx
import { useEffect, useState } from "react";
import { getFriends, removeFriend } from "../api/friendApi";

/* ---------- Local Button component ---------- */
function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
/* ------------------------------------------- */

export default function Allies() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFriends()
      .then((r) => setFriends(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (id) =>
    removeFriend(id).then(() =>
      setFriends((prev) => prev.filter((f) => f.id !== id))
    );

  if (loading) return <p className="p-6">…Loading</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold mb-4">الحلفاء</h1>

      {friends.length === 0 && (
        <p className="text-gray-500">لا يوجد حلفاء بعد.</p>
      )}

      {friends.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between rounded-xl shadow p-4"
        >
          <span>{f.username}</span>
          <Button
            variant="danger"
            onClick={() => handleRemove(f.id)}
          >
            إزالة
          </Button>
        </div>
      ))}
    </div>
  );
}
