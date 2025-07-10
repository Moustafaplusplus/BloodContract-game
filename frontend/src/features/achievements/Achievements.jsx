import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Achievements() {
  const queryClient = useQueryClient();

  // Fetch all achievements
  const {
    data: allAchievements = [],
    isLoading: allAchievementsLoading,
    error: allAchievementsError
  } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: () => axios.get('/api/achievements').then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user's achievements
  const {
    data: userAchievements = [],
    isLoading: userAchievementsLoading,
    error: userAchievementsError
  } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: () => axios.get('/api/achievements/user').then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Check achievements mutation
  const checkAchievementsMutation = useMutation({
    mutationFn: () => axios.post('/api/achievements/check').then(res => res.data),
    onSuccess: (data) => {
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach(achievement => {
          toast.success(`🏆 إنجاز جديد: ${achievement.name}! حصلت على ${achievement.xpReward} خبرة`);
        });
      } else {
        toast.info('لا توجد إنجازات جديدة');
      }
      queryClient.invalidateQueries(['user-achievements']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في فحص الإنجازات';
      toast.error(message);
    }
  });

  if (allAchievementsLoading || userAchievementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الإنجازات...</p>
        </div>
      </div>
    );
  }

  if (allAchievementsError || userAchievementsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل الإنجازات</p>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'CRIME': return '🔪';
      case 'LEVEL': return '📈';
      case 'WEALTH': return '💰';
      case 'STATS': return '💪';
      case 'PROPERTY': return '🏠';
      case 'VEHICLES': return '🚗';
      default: return '🏆';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'CRIME': return 'text-accent-red';
      case 'LEVEL': return 'text-accent-blue';
      case 'WEALTH': return 'text-accent-green';
      case 'STATS': return 'text-accent-orange';
      case 'PROPERTY': return 'text-accent-purple';
      case 'VEHICLES': return 'text-accent-yellow';
      default: return 'text-accent-blue';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'CRIME': return 'الجرائم';
      case 'LEVEL': return 'المستويات';
      case 'WEALTH': return 'الثروة';
      case 'STATS': return 'الإحصائيات';
      case 'PROPERTY': return 'الممتلكات';
      case 'VEHICLES': return 'المركبات';
      default: return 'عام';
    }
  };

  const unlockedCount = userAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;
  const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🏆 الإنجازات</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {allAchievements.map((ach) => (
          <div key={ach.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-white">
            <h3 className="font-bold text-lg text-red-500 mb-2">{ach.name}</h3>
            <p className="text-gray-300 mb-2">{ach.description}</p>
            <div className="flex justify-between text-sm mb-2">
              <span>النقاط:</span>
              <span className="text-red-400 font-mono">{ach.points}</span>
            </div>
            {ach.claimed ? (
              <span className="inline-block bg-red-600 text-white rounded px-2 py-1 text-xs mt-2">تم الاستلام</span>
            ) : (
              <button
                onClick={() => claim(ach.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
                disabled={claimingId === ach.id}
              >
                {claimingId === ach.id ? 'جاري الاستلام...' : 'استلم' }
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
} 