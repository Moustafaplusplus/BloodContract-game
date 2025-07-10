import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Gangs() {
  const {
    data: gangs = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['gangs'],
    queryFn: () => axios.get('/api/gangs').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل العصابات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل العصابات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">العصابات</h1>
        <p className="text-gray-600 dark:text-gray-400">انضم لعصابات أو أنشئ عصابتك الخاصة</p>
      </div>

      {/* Coming Soon */}
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold mb-4">قريباً</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          نظام العصابات قيد التطوير. ستتمكن قريباً من:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <div className="card p-4">
            <div className="text-2xl mb-2">🏠</div>
            <h3 className="font-semibold mb-2">إنشاء عصابات</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">أنشئ عصابتك الخاصة وادع أصدقاءك</p>
          </div>
          <div className="card p-4">
            <div className="text-2xl mb-2">⚔️</div>
            <h3 className="font-semibold mb-2">حروب العصابات</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">قاتل ضد عصابات أخرى</p>
          </div>
          <div className="card p-4">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold mb-2">مكافآت جماعية</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">اربح مكافآت مع فريقك</p>
          </div>
        </div>
      </div>
    </div>
  );
} 