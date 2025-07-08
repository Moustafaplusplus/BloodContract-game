// Crimes.jsx – واجهة الجرائم مع تبريد عالمي ورسائل عربية مفصّلة
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

/* ------------------------------------------------------------------
   الإعدادات
   ------------------------------------------------------------------ */
const API_URL = "http://localhost:5000";          // ← خادم الـBackend
const token    = localStorage.getItem("token") || "";

axios.defaults.baseURL = API_URL;
if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;

/* ------------------------------------------------------------------ */
export default function Crimes() {
  const queryClient = useQueryClient();

  const [cooldownLeft, setCooldownLeft] = useState(0); // ثوانٍ حتى تُتاح الجرائم

  /* ───────────────────────── عدّاد التبريد ─────────────────────── */
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => {
      setCooldownLeft((sec) => (sec > 1 ? sec - 1 : 0));
    }, 1_000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  /* ───────────── جلب قائمة الجرائم (مرّة كل 10 دقائق) ───────────── */
  const {
    data: crimes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["crimes"],
    queryFn : () => axios.get("/api/crimes").then((r) => r.data),
    staleTime: 10 * 60 * 1_000,
  });

  /* ───────────────────────── تنفيذ جريمة ───────────────────────── */
  const mutation = useMutation({
    mutationFn : (id) => axios.post(`/api/crimes/execute/${id}`).then((r) => r.data),
    onSuccess  : (data) => {
      // data = { success, payout, expGain, cooldownLeft, ... }
      if (data.success) {
        toast.success(`نجاح! حصلت على ${data.payout} نقود و ${data.expGain} خبرة`);
      } else {
        toast.error("فشلت الجريمة!");
      }

      // حدّث عدّاد التبريد (جاهز خلال data.cooldownLeft ثانية)
      if (data.cooldownLeft) setCooldownLeft(data.cooldownLeft);

      // أعِد تحميل الجرائم (إن لزم تحديث النسب أو المتطلبات)
      queryClient.invalidateQueries(["crimes"]);
    },
    onError    : (err) => {
      const resp = err.response?.data;
      // خطأ 429 = ما زالت الجريمة على تبريد – أظهر الوقت المتبقّي إن رجع من الخادم
      if (resp?.cooldownLeft) setCooldownLeft(resp.cooldownLeft);
      toast.error(resp?.error || "فشل تنفيذ الجريمة");
    },
  });

  /* ─────────────────────────── الواجهة ─────────────────────────── */
  if (isLoading) return <p>...جاري تحميل الجرائم</p>;
  if (isError)   return <p className="text-red-500">خطأ: {error.message}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {crimes.map((c) => {
        const isCooling = cooldownLeft > 0;
        const isBusy    = mutation.isLoading && mutation.variables === c.id;

        return (
          <div
            key={c.id}
            className="rounded-xl border p-4 shadow hover:bg-gray-50 transition"
          >
            <h3 className="font-bold">{c.name}</h3>
            <p>
              نسبة النجاح: <span className="font-mono">{c.chance}%</span>
            </p>
            <p>
              المكافأة:{" "}
              <span className="font-mono">
                {c.minReward}–{c.maxReward}
              </span>{" "}
              نقود
            </p>

            <button
              disabled={isCooling || isBusy}
              onClick={() => mutation.mutate(c.id)}
              className="mt-2 w-full rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-40"
            >
              {isBusy
                ? "..."
                : isCooling
                ? `انتظر ${cooldownLeft} ث`
                : "ارتكب الجريمة"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
