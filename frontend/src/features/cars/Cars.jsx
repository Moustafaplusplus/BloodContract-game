import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorHandler';

const TABS = [
  { key: 'owned', label: 'سياراتك' },
  { key: 'market', label: 'سوق السيارات' },
];

export default function Cars() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('owned');
  const [activating, setActivating] = useState(null);
  const [selling, setSelling] = useState(null);
  const [buying, setBuying] = useState(null);

  // Fetch all available cars (market)
  const {
    data: cars = [],
    isLoading: carsLoading,
    error: carsError
  } = useQuery({
    queryKey: ['cars'],
    queryFn: () => axios.get('/api/cars').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all owned cars
  const {
    data: ownedCars = [],
    isLoading: ownedLoading,
    error: ownedError
  } = useQuery({
    queryKey: ['owned-cars'],
    queryFn: () => axios.get('/api/cars/user').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch character (to get active car)
  const {
    data: character,
    isLoading: charLoading,
    error: charError
  } = useQuery({
    queryKey: ['character'],
    queryFn: () => axios.get('/api/character').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Activate car mutation
  const activateMutation = useMutation({
    mutationFn: (carId) => axios.post(`/api/cars/${carId}/activate`).then(res => res.data),
    onMutate: (carId) => setActivating(carId),
    onSettled: () => setActivating(null),
    onSuccess: () => {
      toast.success('تم تفعيل السيارة!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-cars']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Sell car mutation
  const sellMutation = useMutation({
    mutationFn: (carId) => axios.delete(`/api/cars/${carId}/sell`).then(res => res.data),
    onMutate: (carId) => setSelling(carId),
    onSettled: () => setSelling(null),
    onSuccess: (data) => {
      toast.success(`تم بيع السيارة! حصلت على ${data.refund} نقود`);
      queryClient.invalidateQueries(['owned-cars']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Buy car mutation
  const buyMutation = useMutation({
    mutationFn: (carId) => axios.post('/api/cars/buy', { carId }).then(res => res.data),
    onMutate: (carId) => setBuying(carId),
    onSettled: () => setBuying(null),
    onSuccess: () => {
      toast.success('تم شراء السيارة!');
      queryClient.invalidateQueries(['owned-cars']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  if (carsLoading || ownedLoading || charLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل السيارات...</p>
        </div>
      </div>
    );
  }
  if (carsError || ownedError || charError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">خطأ في تحميل بيانات السيارات</p>
      </div>
    );
  }

  // Helper: is car active
  const isActive = (carId) => ownedCars.find((uc) => uc.carId === carId && uc.isActive);
  // Helper: is car owned
  const isOwned = (carId) => ownedCars.some((uc) => uc.carId === carId);

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🚗 السيارات</h1>
      <div className="flex space-x-2 mb-6 rtl:space-x-reverse">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-t-lg font-bold border-b-2 transition-colors duration-150 ${tab === t.key ? 'bg-zinc-900 border-red-600 text-red-400' : 'bg-zinc-800 border-zinc-800 text-white hover:text-red-400'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'owned' && (
        <div>
          <h2 className="text-xl font-bold text-red-500 mb-4">سياراتك</h2>
          {ownedCars.length === 0 ? (
            <div className="text-gray-400">لا تملك أي سيارة بعد.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ownedCars.map(({ Car, carId, id, isActive }) => (
                <div key={id} className={`relative bg-zinc-900 rounded-xl p-4 border ${isActive ? 'border-red-600 shadow-lg' : 'border-zinc-800'} text-white`}>
                  {isActive && (
                    <span className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-1 rounded font-bold">السيارة الحالية</span>
                  )}
                  <h3 className="font-bold text-lg text-red-400 mb-2">{Car.name}</h3>
                  <p className="text-gray-300 mb-2">{Car.description}</p>
                  <div className="flex justify-between text-sm mb-1"><span>السعر الأصلي:</span><span className="text-red-400 font-mono">{Car.cost}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span>الهجوم:</span><span className="text-red-400 font-mono">{Car.attackBonus}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span>الدفاع:</span><span className="text-red-400 font-mono">{Car.defenseBonus}</span></div>
                  <div className="flex space-x-2 mt-3 rtl:space-x-reverse">
                    {!isActive && (
                      <button
                        className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-1 rounded-lg"
                        onClick={() => activateMutation.mutate(carId)}
                        disabled={activating === carId}
                      >
                        {activating === carId ? '...جاري التفعيل' : 'اجعلني أستخدمها'}
                      </button>
                    )}
                    <button
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-1 rounded-lg border border-red-600"
                      onClick={() => sellMutation.mutate(carId)}
                      disabled={selling === carId || isActive}
                      title={isActive ? 'لا يمكنك بيع السيارة الحالية' : ''}
                    >
                      {selling === carId ? '...جاري البيع' : 'بيع (25%)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'market' && (
        <div>
          <h2 className="text-xl font-bold text-red-500 mb-4">سوق السيارات</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {cars.map((car) => (
              <div key={car.id} className={`bg-zinc-900 rounded-xl p-4 border ${isOwned(car.id) ? 'border-zinc-700 opacity-60' : 'border-zinc-800'} text-white`}>
                <h3 className="font-bold text-lg text-red-400 mb-2">{car.name}</h3>
                <p className="text-gray-300 mb-2">{car.description}</p>
                <div className="flex justify-between text-sm mb-1"><span>السعر:</span><span className="text-red-400 font-mono">{car.cost}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>الهجوم:</span><span className="text-red-400 font-mono">{car.attackBonus}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>الدفاع:</span><span className="text-red-400 font-mono">{car.defenseBonus}</span></div>
                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
                  onClick={() => buyMutation.mutate(car.id)}
                  disabled={buying === car.id || isOwned(car.id)}
                >
                  {isOwned(car.id) ? 'تمتلك هذه السيارة' : (buying === car.id ? '...جاري الشراء' : 'شراء')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
} 