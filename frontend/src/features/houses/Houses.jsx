import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorHandler';

const TABS = [
  { key: 'owned', label: 'منازلك' },
  { key: 'market', label: 'سوق العقارات' },
];

export default function Houses() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('owned');
  const [equipping, setEquipping] = useState(null);
  const [selling, setSelling] = useState(null);
  const [buying, setBuying] = useState(null);

  // Fetch all available houses (market)
  const {
    data: houses = [],
    isLoading: housesLoading,
    error: housesError
  } = useQuery({
    queryKey: ['houses'],
    queryFn: () => axios.get('/api/houses').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all owned houses
  const {
    data: ownedHouses = [],
    isLoading: ownedLoading,
    error: ownedError
  } = useQuery({
    queryKey: ['owned-houses'],
    queryFn: () => axios.get('/api/houses/owned').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch character (to get equippedHouseId)
  const {
    data: character,
    isLoading: charLoading,
    error: charError
  } = useQuery({
    queryKey: ['character'],
    queryFn: () => axios.get('/api/character').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Equip house mutation
  const equipMutation = useMutation({
    mutationFn: (houseId) => axios.post('/api/houses/equip', { houseId }).then(res => res.data),
    onMutate: (houseId) => setEquipping(houseId),
    onSettled: () => setEquipping(null),
    onSuccess: () => {
      toast.success('تم اختيار المنزل!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-houses']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Sell house mutation
  const sellMutation = useMutation({
    mutationFn: (houseId) => axios.post('/api/houses/sell', { houseId }).then(res => res.data),
    onMutate: (houseId) => setSelling(houseId),
    onSettled: () => setSelling(null),
    onSuccess: (data) => {
      toast.success(`تم بيع المنزل! حصلت على ${data.refund} نقود`);
      queryClient.invalidateQueries(['owned-houses']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Buy house mutation
  const buyMutation = useMutation({
    mutationFn: (houseId) => axios.post('/api/houses/buy', { houseId }).then(res => res.data),
    onMutate: (houseId) => setBuying(houseId),
    onSettled: () => setBuying(null),
    onSuccess: () => {
      toast.success('تم شراء المنزل!');
      queryClient.invalidateQueries(['owned-houses']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  if (housesLoading || ownedLoading || charLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل المنازل...</p>
        </div>
      </div>
    );
  }
  if (housesError || ownedError || charError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">خطأ في تحميل بيانات المنازل</p>
      </div>
    );
  }

  // Helper: is house equipped
  const isEquipped = (houseId) => character?.equippedHouseId === houseId;
  // Helper: is house owned
  const isOwned = (houseId) => ownedHouses.some((uh) => uh.houseId === houseId);

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🏠 المنازل</h1>
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
          <h2 className="text-xl font-bold text-red-500 mb-4">منازلك</h2>
          {ownedHouses.length === 0 ? (
            <div className="text-gray-400">لا تملك أي منزل بعد.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ownedHouses.map(({ House, houseId, id }) => (
                <div key={id} className={`relative bg-zinc-900 rounded-xl p-4 border ${isEquipped(houseId) ? 'border-red-600 shadow-lg' : 'border-zinc-800'} text-white`}>
                  {isEquipped(houseId) && (
                    <span className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-1 rounded font-bold">المنزل الحالي</span>
                  )}
                  <h3 className="font-bold text-lg text-red-400 mb-2">{House.name}</h3>
                  <p className="text-gray-300 mb-2">{House.description}</p>
                  <div className="flex justify-between text-sm mb-1"><span>السعر الأصلي:</span><span className="text-red-400 font-mono">{House.cost}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span>الدفاع:</span><span className="text-red-400 font-mono">{House.defenseBonus}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span>زيادة الصحة:</span><span className="text-red-400 font-mono">{House.hpBonus}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span>تجديد الطاقة:</span><span className="text-red-400 font-mono">{House.energyRegen}</span></div>
                  <div className="flex space-x-2 mt-3 rtl:space-x-reverse">
                    {!isEquipped(houseId) && (
                      <button
                        className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-1 rounded-lg"
                        onClick={() => equipMutation.mutate(houseId)}
                        disabled={equipping === houseId}
                      >
                        {equipping === houseId ? '...جاري التفعيل' : 'اجعلني أعيش هنا'}
                      </button>
                    )}
                    <button
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-1 rounded-lg border border-red-600"
                      onClick={() => sellMutation.mutate(houseId)}
                      disabled={selling === houseId || isEquipped(houseId)}
                      title={isEquipped(houseId) ? 'لا يمكنك بيع المنزل الحالي' : ''}
                    >
                      {selling === houseId ? '...جاري البيع' : 'بيع (25%)'}
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
          <h2 className="text-xl font-bold text-red-500 mb-4">سوق العقارات</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {houses.map((house) => (
              <div key={house.id} className={`bg-zinc-900 rounded-xl p-4 border ${isOwned(house.id) ? 'border-zinc-700 opacity-60' : 'border-zinc-800'} text-white`}>
                <h3 className="font-bold text-lg text-red-400 mb-2">{house.name}</h3>
                <p className="text-gray-300 mb-2">{house.description}</p>
                <div className="flex justify-between text-sm mb-1"><span>السعر:</span><span className="text-red-400 font-mono">{house.cost}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>الدفاع:</span><span className="text-red-400 font-mono">{house.defenseBonus}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>زيادة الصحة:</span><span className="text-red-400 font-mono">{house.hpBonus}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>تجديد الطاقة:</span><span className="text-red-400 font-mono">{house.energyRegen}</span></div>
                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
                  onClick={() => buyMutation.mutate(house.id)}
                  disabled={buying === house.id || isOwned(house.id)}
                >
                  {isOwned(house.id) ? 'تمتلك هذا المنزل' : (buying === house.id ? '...جاري الشراء' : 'شراء')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
} 