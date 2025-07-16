import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorHandler';

const TABS = [
  { key: 'owned', label: 'كلابك' },
  { key: 'market', label: 'سوق الكلاب' },
];

export default function Dogs() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('owned');
  const [activating, setActivating] = useState(null);
  const [selling, setSelling] = useState(null);
  const [buying, setBuying] = useState(null);

  // Fetch all available dogs (market)
  const {
    data: dogs = [],
    isLoading: dogsLoading,
    error: dogsError
  } = useQuery({
    queryKey: ['dogs'],
    queryFn: () => axios.get('/api/dogs').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all owned dogs
  const {
    data: ownedDogs = [],
    isLoading: ownedLoading,
    error: ownedError
  } = useQuery({
    queryKey: ['owned-dogs'],
    queryFn: () => axios.get('/api/dogs/user').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch character (to get active dog)
  const {
    data: character,
    isLoading: charLoading,
    error: charError
  } = useQuery({
    queryKey: ['character'],
    queryFn: () => axios.get('/api/character').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Activate dog mutation
  const activateMutation = useMutation({
    mutationFn: (dogId) => axios.post('/api/dogs/activate', { dogId }).then(res => res.data),
    onMutate: (dogId) => setActivating(dogId),
    onSettled: () => setActivating(null),
    onSuccess: () => {
      toast.success('تم تفعيل الكلب!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-dogs']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Sell dog mutation
  const sellMutation = useMutation({
    mutationFn: (dogId) => axios.post('/api/dogs/sell', { dogId }).then(res => res.data),
    onMutate: (dogId) => setSelling(dogId),
    onSettled: () => setSelling(null),
    onSuccess: (data) => {
      toast.success(`تم بيع الكلب! حصلت على ${data.refund} نقود`);
      queryClient.invalidateQueries(['owned-dogs']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Buy dog mutation
  const buyMutation = useMutation({
    mutationFn: (dogId) => axios.post('/api/dogs/buy', { dogId }).then(res => res.data),
    onMutate: (dogId) => setBuying(dogId),
    onSettled: () => setBuying(null),
    onSuccess: () => {
      toast.success('تم شراء الكلب!');
      queryClient.invalidateQueries(['owned-dogs']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  if (dogsLoading || ownedLoading || charLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل الكلاب...</p>
        </div>
      </div>
    );
  }
  if (dogsError || ownedError || charError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">خطأ في تحميل بيانات الكلاب</p>
      </div>
    );
  }

  // Helper: is dog active
  const isActive = (dogId) => ownedDogs.find((ud) => ud.dogId === dogId && ud.isActive);
  // Helper: is dog owned
  const isOwned = (dogId) => ownedDogs.some((ud) => ud.dogId === dogId);

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🐕 الكلاب</h1>
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
          <h2 className="text-xl font-bold text-red-500 mb-4">كلابك</h2>
          {ownedDogs.length === 0 ? (
            <div className="text-gray-400">لا تملك أي كلب بعد.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ownedDogs.map(({ Dog, dogId, id, isActive }) => (
                <div key={id} className={`relative bg-zinc-900 rounded-xl p-4 border ${isActive ? 'border-red-600 shadow-lg' : 'border-zinc-800'} text-white`}>
                  {isActive && (
                    <span className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-1 rounded font-bold">الكلب الحالي</span>
                  )}
                  <h3 className="font-bold text-lg text-red-400 mb-2">{Dog.name}</h3>
                  <p className="text-gray-300 mb-2">{Dog.description}</p>
                  <div className="flex justify-between text-sm mb-1"><span>السعر الأصلي:</span><span className="text-red-400 font-mono">{Dog.cost}</span></div>
                  <div className="flex justify-between text-sm mb-1"><span>قوة الهجوم:</span><span className="text-red-400 font-mono">{Dog.powerBonus}</span></div>
                  <div className="flex space-x-2 mt-3 rtl:space-x-reverse">
                    {!isActive && (
                      <button
                        className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-1 rounded-lg"
                        onClick={() => activateMutation.mutate(dogId)}
                        disabled={activating === dogId}
                      >
                        {activating === dogId ? '...جاري التفعيل' : 'اجعلني أستخدمه'}
                      </button>
                    )}
                    <button
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-1 rounded-lg border border-red-600"
                      onClick={() => sellMutation.mutate(dogId)}
                      disabled={selling === dogId || isActive}
                      title={isActive ? 'لا يمكنك بيع الكلب الحالي' : ''}
                    >
                      {selling === dogId ? '...جاري البيع' : 'بيع (25%)'}
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
          <h2 className="text-xl font-bold text-red-500 mb-4">سوق الكلاب</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {dogs.map((dog) => (
              <div key={dog.id} className={`bg-zinc-900 rounded-xl p-4 border ${isOwned(dog.id) ? 'border-zinc-700 opacity-60' : 'border-zinc-800'} text-white`}>
                <h3 className="font-bold text-lg text-red-400 mb-2">{dog.name}</h3>
                <p className="text-gray-300 mb-2">{dog.description}</p>
                <div className="flex justify-between text-sm mb-1"><span>السعر:</span><span className="text-red-400 font-mono">{dog.cost}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>قوة الهجوم:</span><span className="text-red-400 font-mono">{dog.powerBonus}</span></div>
                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
                  onClick={() => buyMutation.mutate(dog.id)}
                  disabled={buying === dog.id || isOwned(dog.id)}
                >
                  {isOwned(dog.id) ? 'تمتلك هذا الكلب' : (buying === dog.id ? '...جاري الشراء' : 'شراء')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
} 