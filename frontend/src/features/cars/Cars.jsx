import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Cars() {
  const queryClient = useQueryClient();
  const [selectedCar, setSelectedCar] = useState(null);

  // Fetch available cars
  const {
    data: cars = [],
    isLoading: carsLoading,
    error: carsError
  } = useQuery({
    queryKey: ['cars'],
    queryFn: () => axios.get('/api/cars').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user's cars
  const {
    data: userCars = [],
    isLoading: userCarsLoading,
    error: userCarsError
  } = useQuery({
    queryKey: ['user-cars'],
    queryFn: () => axios.get('/api/cars/my-cars').then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Buy car mutation
  const buyCarMutation = useMutation({
    mutationFn: (carId) => axios.post(`/api/cars/${carId}/buy`).then(res => res.data),
    onSuccess: (data) => {
      toast.success(`تم شراء السيارة بنجاح! ${data.message || ''}`);
      queryClient.invalidateQueries(['user-cars']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في شراء السيارة';
      toast.error(message);
    }
  });

  // Sell car mutation
  const sellCarMutation = useMutation({
    mutationFn: (carId) => axios.post(`/api/cars/${carId}/sell`).then(res => res.data),
    onSuccess: (data) => {
      toast.success(`تم بيع السيارة بنجاح! حصلت على ${data.money} نقود`);
      queryClient.invalidateQueries(['user-cars']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في بيع السيارة';
      toast.error(message);
    }
  });

  // Upgrade car mutation
  const upgradeCarMutation = useMutation({
    mutationFn: ({ carId, upgradeType }) => 
      axios.post(`/api/cars/${carId}/upgrade`, { upgradeType }).then(res => res.data),
    onSuccess: (data) => {
      toast.success(`تم ترقية السيارة بنجاح! ${data.message || ''}`);
      queryClient.invalidateQueries(['user-cars']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في ترقية السيارة';
      toast.error(message);
    }
  });

  if (carsLoading || userCarsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل السيارات...</p>
        </div>
      </div>
    );
  }

  if (carsError || userCarsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل السيارات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">السيارات</h1>
        <p className="text-gray-600 dark:text-gray-400">امتلك سيارات فاخرة واربح من سباقاتها</p>
      </div>

      {/* User's Cars */}
      {userCars.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-accent-green">سياراتك</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userCars.map((userCar) => (
              <div key={userCar.id} className="card p-4">
                <h3 className="font-semibold text-lg mb-2">{userCar.car.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">{userCar.car.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>السرعة:</span>
                    <span className="font-mono text-accent-blue">{userCar.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التحكم:</span>
                    <span className="font-mono text-accent-green">{userCar.control}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ الشراء:</span>
                    <span className="font-mono text-xs">{new Date(userCar.purchasedAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => upgradeCarMutation.mutate({ carId: userCar.car.id, upgradeType: 'speed' })}
                    disabled={upgradeCarMutation.isLoading}
                    className="btn-secondary w-full text-sm"
                  >
                    ترقية السرعة (1000 نقود)
                  </button>
                  <button
                    onClick={() => upgradeCarMutation.mutate({ carId: userCar.car.id, upgradeType: 'control' })}
                    disabled={upgradeCarMutation.isLoading}
                    className="btn-secondary w-full text-sm"
                  >
                    ترقية التحكم (1000 نقود)
                  </button>
                  <button
                    onClick={() => sellCarMutation.mutate(userCar.car.id)}
                    disabled={sellCarMutation.isLoading}
                    className="btn-danger w-full text-sm"
                  >
                    {sellCarMutation.isLoading ? 'جاري البيع...' : 'بيع السيارة'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Cars */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">السيارات المتاحة للشراء</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car) => {
            const isOwned = userCars.some(uc => uc.car.id === car.id);
            
            return (
              <div key={car.id} className="card p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{car.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">{car.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>السعر:</span>
                    <span className="font-mono text-accent-blue">{car.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>السرعة الأساسية:</span>
                    <span className="font-mono text-accent-blue">{car.baseSpeed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التحكم الأساسي:</span>
                    <span className="font-mono text-accent-green">{car.baseControl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المتطلبات:</span>
                    <span className="font-mono text-accent-orange">المستوى {car.levelRequirement}</span>
                  </div>
                </div>

                {isOwned ? (
                  <div className="text-center py-2 bg-accent-green/10 text-accent-green rounded-lg">
                    تم امتلاك هذه السيارة
                  </div>
                ) : (
                  <button
                    onClick={() => buyCarMutation.mutate(car.id)}
                    disabled={buyCarMutation.isLoading}
                    className="btn-primary w-full"
                  >
                    {buyCarMutation.isLoading ? 'جاري الشراء...' : 'شراء السيارة'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-accent-blue">{userCars.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">السيارات المملوكة</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-accent-green">
            {userCars.reduce((total, uc) => total + uc.speed, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي السرعة</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-accent-purple">{cars.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">السيارات المتاحة</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-accent-orange">
            {Math.round((userCars.length / cars.length) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">نسبة الإنجاز</div>
        </div>
      </div>
    </div>
  );
} 