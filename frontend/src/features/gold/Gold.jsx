import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Gold() {
  const {
    data: goldData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['gold'],
    queryFn: () => axios.get('/api/gold').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الذهب...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل الذهب</p>
      </div>
    );
  }

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🏅 الذهب</h1>
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-white max-w-lg mx-auto">
        <div className="flex justify-between mb-2">
          <span>رصيد الذهب:</span>
          <span className="text-red-400 font-mono">{goldData.balance}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>سعر الشراء:</span>
          <span className="text-red-400 font-mono">{goldData.buyPrice}$</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>سعر البيع:</span>
          <span className="text-red-400 font-mono">{goldData.sellPrice}$</span>
        </div>
        <button
          onClick={buyGold}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-4"
        >
          شراء ذهب
        </button>
      </div>
    </section>
  );
} 