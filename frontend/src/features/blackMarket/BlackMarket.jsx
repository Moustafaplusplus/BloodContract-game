import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function BlackMarket() {
  const {
    data: items = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['black-market'],
    queryFn: () => axios.get('/black-market').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل السوق السوداء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل السوق السوداء</p>
      </div>
    );
  }

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🕶️ السوق السوداء</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-white">
            <h3 className="font-bold text-lg text-red-500 mb-2">{item.name}</h3>
            <p className="text-gray-300 mb-2">{item.description}</p>
            <div className="flex justify-between text-sm mb-2">
              <span>السعر:</span>
              <span className="text-red-400 font-mono">{item.price}$</span>
            </div>
            <button
              onClick={() => buyItem(item.id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
              disabled={buyingId === item.id}
            >
              {buyingId === item.id ? 'جاري الشراء...' : 'شراء'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
} 