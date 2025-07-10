import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Houses() {
  const queryClient = useQueryClient();
  const [selectedHouse, setSelectedHouse] = useState(null);

  // Fetch available houses
  const {
    data: houses = [],
    isLoading: housesLoading,
    error: housesError
  } = useQuery({
    queryKey: ['houses'],
    queryFn: () => axios.get('/api/houses').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user's houses
  const {
    data: userHouses = [],
    isLoading: userHousesLoading,
    error: userHousesError
  } = useQuery({
    queryKey: ['user-houses'],
    queryFn: () => axios.get('/api/houses/my-houses').then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Buy house mutation
  const buyHouseMutation = useMutation({
    mutationFn: (houseId) => axios.post(`/api/houses/${houseId}/buy`).then(res => res.data),
    onSuccess: (data) => {
      toast.success(`تم شراء المنزل بنجاح! ${data.message || ''}`);
      queryClient.invalidateQueries(['user-houses']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في شراء المنزل';
      toast.error(message);
    }
  });

  // Sell house mutation
  const sellHouseMutation = useMutation({
    mutationFn: (houseId) => axios.post(`/api/houses/${houseId}/sell`).then(res => res.data),
    onSuccess: (data) => {
      toast.success(`تم بيع المنزل بنجاح! حصلت على ${data.money} نقود`);
      queryClient.invalidateQueries(['user-houses']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في بيع المنزل';
      toast.error(message);
    }
  });

  if (housesLoading || userHousesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل المنازل...</p>
        </div>
      </div>
    );
  }

  if (housesError || userHousesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل المنازل</p>
      </div>
    );
  }

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🏠 المنازل</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {houses.map((house) => (
          <div key={house.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-white">
            <h3 className="font-bold text-lg text-red-500 mb-2">{house.name}</h3>
            <p className="text-gray-300 mb-2">{house.description}</p>
            <div className="flex justify-between text-sm mb-2">
              <span>السعر:</span>
              <span className="text-red-400 font-mono">{house.price}$</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>الدفاع:</span>
              <span className="text-red-400 font-mono">{house.defense}</span>
            </div>
            <button
              onClick={() => buyHouseMutation.mutate(house.id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
              disabled={buyHouseMutation.isLoading}
            >
              {buyHouseMutation.isLoading ? 'جاري الشراء...' : 'شراء'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
} 