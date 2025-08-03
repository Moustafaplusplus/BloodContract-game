import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Heart, ThumbsUp, ThumbsDown, Trophy, Star, Target, Skull, ImageIcon, Building2, Loader } from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';
import { toast } from 'react-hot-toast';
import VipName from '@/features/profile/VipName.jsx';
import '@/features/profile/vipSparkle.css';

const TABS = [
  { key: 'fame', label: 'الشهرة', icon: Trophy, color: 'yellow', bgGrad: 'from-yellow-950/30 to-amber-950/20' },
  { key: 'level', label: 'المستوى', icon: Star, color: 'blue', bgGrad: 'from-blue-950/30 to-cyan-950/20' },
  { key: 'money', label: 'المال', icon: MoneyIcon, color: 'green', bgGrad: 'from-green-950/30 to-emerald-950/20' },
  { key: 'killCount', label: 'القتل', icon: Target, color: 'red', bgGrad: 'from-red-950/30 to-blood-950/20' },
  { key: 'crimesCommitted', label: 'الجرائم', icon: Skull, color: 'blood', bgGrad: 'from-blood-950/30 to-red-950/20' },
];

function Ranking() {
  const [activeTab, setActiveTab] = useState('fame');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});
  const [ratingLoading, setRatingLoading] = useState({});
  const { customToken } = useFirebaseAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/ranking?sort=${activeTab}&limit=50`)
      .then(res => {
        setPlayers(res.data);
        setLoading(false);
        // Fetch ratings for all players
        fetchRatingsForPlayers(res.data);
      })
      .catch(err => {
        setError('فشل في تحميل التصنيفات');
        setLoading(false);
      });
  }, [activeTab]);

  const fetchRatingsForPlayers = async (playersList) => {
    if (!customToken) return;
    
    const ratingsData = {};
    for (const player of playersList) {
      try {
        const response = await axios.get(`/api/profile/${player.userId}/ratings`, {
          headers: { Authorization: `Bearer ${customToken}` }
        });
        ratingsData[player.userId] = response.data;
      } catch (error) {
        ratingsData[player.userId] = { likes: 0, dislikes: 0, userRating: null };
      }
    }
    setRatings(ratingsData);
  };

  const handleRate = async (userId, rating) => {
    if (!customToken) {
      toast.error('يجب تسجيل الدخول لتقييم الملف الشخصي');
      return;
    }

    setRatingLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.post(`/api/profile/${userId}/rate`, { rating }, {
        headers: { Authorization: `Bearer ${customToken}` }
      });
      
      setRatings(prev => {
        const current = prev[userId] || { likes: 0, dislikes: 0, userRating: null };
        const newRating = { ...current, userRating: rating };
        
        // Update counts
        if (rating === 'LIKE') {
          newRating.likes = current.likes + (current.userRating === 'DISLIKE' ? 1 : current.userRating === 'LIKE' ? 0 : 1);
          newRating.dislikes = current.dislikes - (current.userRating === 'DISLIKE' ? 1 : 0);
        } else {
          newRating.dislikes = current.dislikes + (current.userRating === 'LIKE' ? 1 : current.userRating === 'DISLIKE' ? 0 : 1);
          newRating.likes = current.likes - (current.userRating === 'LIKE' ? 1 : 0);
        }
        
        return { ...prev, [userId]: newRating };
      });
      
      toast.success(rating === 'LIKE' ? 'تم الإعجاب بالملف الشخصي' : 'تم عدم الإعجاب بالملف الشخصي');
    } catch (error) {
      toast.error('حدث خطأ أثناء التقييم');
    } finally {
      setRatingLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'money':
        return `${value.toLocaleString()}`;
      case 'fame':
      case 'level':
      case 'killCount':
      case 'crimesCommitted':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const currentTab = TABS.find(tab => tab.key === activeTab);

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-4 space-y-6">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">تصنيف اللاعبين</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Player Rankings</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Trophy className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{currentTab?.label}</div>
                <div className="text-xs text-white/80 drop-shadow">Ranking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="card-3d p-4">
          <h2 className="text-lg font-bold text-blood-400 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            فئات التصنيف
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {TABS.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`card-3d bg-gradient-to-br ${tab.bgGrad} border-${tab.color}-500/30 p-3 text-center group transition-all duration-300 ${
                    activeTab === tab.key 
                      ? `border-${tab.color}-500/60 shadow-lg shadow-${tab.color}-500/30` 
                      : 'hover:border-white/40'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-${tab.color}-500/20 border border-${tab.color}-500/40 inline-block mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-5 h-5 text-${tab.color}-400`} />
                  </div>
                  <div className={`text-sm font-bold ${
                    activeTab === tab.key ? `text-${tab.color}-400` : 'text-white/90'
                  }`}>
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rankings Table */}
        <div className="card-3d p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blood-400 flex items-center gap-2">
              <currentTab.icon className="w-5 h-5" />
              ترتيب {currentTab?.label}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Building2 className="w-4 h-4" />
              <span>أفضل 50 لاعب</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 card-3d bg-black/40 border-white/20 px-6 py-4">
                <Loader className="w-6 h-6 animate-spin text-blood-400" />
                <p className="text-white/90">جاري تحميل التصنيفات...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="card-3d bg-red-950/30 border-red-500/50 px-6 py-4 inline-block">
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-right text-sm font-bold text-blood-400">#</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-blood-400">اللاعب</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-blood-400">{currentTab?.label}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-blood-400">التقييم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {players.map((player, idx) => {
                    const playerRating = ratings[player.userId] || { likes: 0, dislikes: 0, userRating: null };
                    const isRatingLoading = ratingLoading[player.userId];
                    
                    return (
                      <tr 
                        key={player.ranking} 
                        className={`hover:bg-white/5 transition-colors duration-200 ${
                          idx < 3 ? 'bg-gradient-to-r from-yellow-950/20 to-yellow-800/10' : ''
                        }`}
                      >
                        {/* Ranking */}
                        <td className="px-4 py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            idx === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black' :
                            idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300 text-black' :
                            idx === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white' :
                            'bg-gradient-to-r from-white/20 to-white/10 text-white/90'
                          }`}>
                            {player.ranking}
                          </div>
                        </td>
                        
                        {/* Player Name */}
                        <td className="px-4 py-4">
                          <Link 
                            to={`/dashboard/profile/${player.username}`}
                            className="flex items-center gap-3 group hover:text-blood-400 transition-colors duration-200"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:border-blood-400/50 transition-colors">
                              <span className="text-sm font-bold text-white group-hover:text-blood-400">
                                {(player.name || player.username)?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-blood-400 transition-colors">
                                <VipName user={player} disableLink={true} />
                              </div>
                              <div className="text-xs text-white/50">
                                المستوى {player.level || 1}
                              </div>
                            </div>
                          </Link>
                        </td>
                        
                        {/* Criteria Value */}
                        <td className="px-4 py-4 text-right">
                          <span className={`font-mono text-lg font-bold text-${currentTab?.color}-400`}>
                            {formatValue(player.criteria, activeTab)}
                          </span>
                        </td>
                        
                        {/* Rating */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-3">
                            {/* Like Button */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRate(player.userId, 'LIKE')}
                                disabled={isRatingLoading}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  playerRating.userRating === 'LIKE'
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                                    : 'bg-white/10 text-white/70 hover:bg-green-600 hover:text-white hover:shadow-lg hover:shadow-green-600/30'
                                } ${isRatingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-bold text-green-400 min-w-[20px] text-center">
                                {playerRating.likes}
                              </span>
                            </div>
                            
                            {/* Dislike Button */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRate(player.userId, 'DISLIKE')}
                                disabled={isRatingLoading}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  playerRating.userRating === 'DISLIKE'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                    : 'bg-white/10 text-white/70 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/30'
                                } ${isRatingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-bold text-red-400 min-w-[20px] text-center">
                                {playerRating.dislikes}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer Info */}
        <div className="card-3d p-4 text-center">
          <p className="text-white/60 text-sm">
            يتم تحديث التصنيفات كل 5 دقائق • يمكنك النقر على اسم اللاعب لعرض ملفه الشخصي
          </p>
        </div>
      </div>
    </div>
  );
}

export default Ranking;
