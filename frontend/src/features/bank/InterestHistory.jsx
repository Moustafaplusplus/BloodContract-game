/* ========================================================================
 *  InterestHistory.jsx
 *  Shows the last 30 interest-credit entries for the current user
 *  Needs:  GET /api/bank/history   (JWT protected)  → [{ id, amount, createdAt }]
 * =======================================================================*/
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function InterestHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState(null); // null = loading

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API}/api/bank/history`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Failed to fetch")),
      )
      .then((data) =>
        setRows(
          (Array.isArray(data) ? data : []).slice(0, 30), // last 30 entries
        ),
      )
      .catch((error) => {
        console.error("Interest history fetch error:", error);
        setRows([]); // Set empty array as fallback
        toast.error("لا يمكن الاتصال بالخادم");
      });
  }, [token, navigate]);

  if (rows === null) {
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        جارٍ تحميل سجل الفوائد…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner Placeholder */}
      <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <img src="/placeholder-interest-banner.png" alt="Interest Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center">
          <TrendingUp className="w-14 h-14 mx-auto text-accent-green mb-2 animate-bounce" />
          <h1 className="text-3xl md:text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-emerald-400 to-accent-green animate-glow">سجل الفوائد البنكية</h1>
          <p className="text-hitman-300 text-base">تابع أرباحك اليومية من الفوائد البنكية</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-8 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-accent-green text-center">📈 سجل الفوائد</h2>
        {rows.length === 0 ? (
          <p className="text-hitman-300 text-center">لا توجد فوائد مسجلة بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm rtl text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-hitman-900/80">
                  <th className="py-3 px-4 rounded-r-2xl text-accent-green font-bold text-lg">التاريخ</th>
                  <th className="py-3 px-4 rounded-l-2xl text-accent-green font-bold text-lg text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ id, amount, createdAt }) => (
                  <tr key={id} className="bg-hitman-800/60 hover:bg-hitman-700/80 transition rounded-xl">
                    <td className="py-2 px-4 rounded-r-xl font-mono">
                      {new Date(createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-4 rounded-l-xl text-left text-accent-green font-bold font-mono">+{amount}$</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
