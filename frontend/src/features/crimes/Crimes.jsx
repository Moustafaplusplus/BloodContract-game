// Crimes.jsx – واجهة الجرائم مع تبريد عالمي ورسائل عربية مفصّلة
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function Crimes() {
  const queryClient = useQueryClient();
  const [cooldownLeft, setCooldownLeft] = useState(0);

  /* ───────────────────────── عدّاد التبريد ─────────────────────── */
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => {
      setCooldownLeft((sec) => (sec > 1 ? sec - 1 : 0));
    }, 1_000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  /* ───────────── جلب قائمة الجرائم ───────────── */
  const {
    data: crimes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["crimes"],
    queryFn: () => axios.get("/api/crimes").then((r) => r.data),
    staleTime: 10 * 60 * 1_000,
  });

  /* ───────────────────────── تنفيذ جريمة ───────────────────────── */
  const mutation = useMutation({
    mutationFn: (id) => axios.post(`/api/crimes/execute/${id}`).then((r) => r.data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`نجاح! حصلت على ${data.payout} نقود و ${data.expGain} خبرة`);
      } else {
        toast.error("فشلت الجريمة!");
      }

      if (data.cooldownLeft) setCooldownLeft(data.cooldownLeft);
      queryClient.invalidateQueries(["crimes"]);
    },
    onError: (err) => {
      const resp = err.response?.data;
      if (resp?.cooldownLeft) setCooldownLeft(resp.cooldownLeft);
      toast.error(resp?.error || "فشل تنفيذ الجريمة");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-200">جاري تحميل الجرائم...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 bg-black text-white">
        <p className="text-red-500">خطأ: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-black min-h-screen text-white p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-red-600">الجرائم</h1>
        <p className="text-gray-200">ارتكب جرائم واربح نقود وخبرة</p>
      </div>

      {/* Cooldown Warning */}
      {cooldownLeft > 0 && (
        <div className="bg-zinc-900 border-l-4 border-red-600 p-4 mb-4 rounded-xl">
          <div className="text-center">
            <p className="text-red-500 font-semibold">
              يجب الانتظار {cooldownLeft} ثانية قبل ارتكاب جريمة أخرى
            </p>
          </div>
        </div>
      )}

      {/* Crimes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {crimes.map((crime) => {
          const isCooling = cooldownLeft > 0;
          const isBusy = mutation.isLoading && mutation.variables === crime.id;

          return (
            <div key={crime.id} className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-shadow border border-zinc-800 text-white">
              <h3 className="font-bold text-lg mb-2 text-red-500">{crime.name}</h3>
              <p className="text-gray-300 mb-3 text-sm">
                {crime.description}
              </p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>نسبة النجاح:</span>
                  <span className="font-mono text-red-400">{crime.chance}%</span>
                </div>
                <div className="flex justify-between">
                  <span>المكافأة:</span>
                  <span className="font-mono text-red-400">
                    {crime.minReward}–{crime.maxReward}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>الخبرة:</span>
                  <span className="font-mono text-red-400">{crime.expGain}</span>
                </div>
                {crime.levelRequirement > 1 && (
                  <div className="flex justify-between">
                    <span>المتطلبات:</span>
                    <span className="font-mono text-red-400">المستوى {crime.levelRequirement}</span>
                  </div>
                )}
              </div>

              <button
                disabled={isCooling || isBusy}
                onClick={() => mutation.mutate(crime.id)}
                className="btn w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg disabled:opacity-40 mt-2"
              >
                {isBusy
                  ? "جاري التنفيذ..."
                  : isCooling
                  ? `انتظر ${cooldownLeft} ث`
                  : "ارتكب الجريمة"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
          <div className="text-2xl font-bold text-red-500">{crimes.length}</div>
          <div className="text-sm text-gray-300">الجرائم المتاحة</div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
          <div className="text-2xl font-bold text-red-500">
            {crimes.reduce((total, crime) => total + crime.chance, 0) / crimes.length}%
          </div>
          <div className="text-sm text-gray-300">متوسط نسبة النجاح</div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
          <div className="text-2xl font-bold text-red-500">
            {crimes.reduce((total, crime) => total + crime.expGain, 0)}
          </div>
          <div className="text-sm text-gray-300">إجمالي الخبرة المحتملة</div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
          <div className="text-2xl font-bold text-red-500">
            {cooldownLeft > 0 ? `${cooldownLeft}s` : 'جاهز'}
          </div>
          <div className="text-sm text-gray-300">وقت التبريد</div>
        </div>
      </div>
    </div>
  );
}
