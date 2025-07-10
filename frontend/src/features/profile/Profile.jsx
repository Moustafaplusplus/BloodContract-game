import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Profile() {
  const {
    data: character,
    isLoading,
    error
  } = useQuery({
    queryKey: ['character'],
    queryFn: () => axios.get('/api/character').then(res => res.data),
    staleTime: 1 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل الملف الشخصي</p>
      </div>
    );
  }

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">👤 الملف الشخصي</h1>
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-white max-w-lg mx-auto">
        <div className="flex flex-col items-center space-y-2 mb-4">
          {character?.avatarUrl ? (
            <img src={character.avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-red-600 bg-zinc-800" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-3xl text-red-500">
              {(character?.nickname || character?.name || '?')[0]}
            </div>
          )}
          <h2 className="text-xl font-bold text-red-500">{character?.nickname || character?.name || '---'}</h2>
          <p className="text-gray-300">{character?.email || '---'}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-right">
          <span>المستوى:</span>
          <span className="text-red-400 font-mono">{character?.level ?? '---'}</span>
          <span>الخبرة:</span>
          <span className="text-red-400 font-mono">{character?.exp ?? '---'}</span>
          <span>النقود:</span>
          <span className="text-red-400 font-mono">{character?.money?.toLocaleString() ?? '---'}</span>
          <span>العنوان:</span>
          <span className="text-red-400 font-mono">{character?.title || '---'}</span>
          <span>الأيقونة:</span>
          <span className="text-red-400 font-mono">{character?.avatarUrl || '---'}</span>
          <span>الاقتباس:</span>
          <span className="text-red-400 font-mono">{character?.quote || '---'}</span>
          <span>الأيام في اللعبة:</span>
          <span className="text-red-400 font-mono">{character?.daysInGame ?? '---'}</span>
          <span>عدد القتل:</span>
          <span className="text-red-400 font-mono">{character?.killCount ?? '---'}</span>
          <span>آخر نشاط:</span>
          <span className="text-red-400 font-mono">{character?.lastActive ? new Date(character.lastActive).toLocaleString() : '---'}</span>
          <span>التأثيرات:</span>
          <span className="text-red-400 font-mono">{Array.isArray(character?.buffs) ? character.buffs.map(buff => buff.name).join(', ') : (typeof character?.buffs === 'object' ? Object.keys(character.buffs).join(', ') : '---')}</span>
          <span>العصابة:</span>
          <span className="text-red-400 font-mono">{character?.gangId ?? '---'}</span>
          <span>المنزل المكتمل:</span>
          <span className="text-red-400 font-mono">{character?.equippedHouseId ?? '---'}</span>
        </div>
      </div>
    </section>
  );
} 