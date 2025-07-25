import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Heart, ThumbsUp, ThumbsDown, Trophy, Star, DollarSign, Target, Skull } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TABS = [
  { key: 'fame', label: 'الشهرة', icon: Trophy },
  { key: 'level', label: 'المستوى', icon: Star },
  { key: 'money', label: 'المال', icon: DollarSign },
  { key: 'killCount', label: 'القتل', icon: Target },
  { key: 'crimesCommitted', label: 'الجرائم', icon: Skull },
];

const columns = {
  fame: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'الاسم' },
    { key: 'criteria', label: 'الشهرة' },
  ],
  level: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'الاسم' },
    { key: 'criteria', label: 'المستوى' },
  ],
  money: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'الاسم' },
    { key: 'criteria', label: 'المال' },
  ],
  killCount: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'الاسم' },
    { key: 'criteria', label: 'القتل' },
  ],
  crimesCommitted: [
    { key: 'ranking', label: '#' },
    { key: 'name', label: 'الاسم' },
    { key: 'criteria', label: 'الجرائم' },
  ],
};

function Ranking() {
  const [activeTab, setActiveTab] = useState('fame');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});
  const [ratingLoading, setRatingLoading] = useState({});
  const { token } = useAuth();

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
    if (!token) return;
    
    const ratingsData = {};
    for (const player of playersList) {
      try {
        const response = await axios.get(`/api/profile/${player.userId}/ratings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        ratingsData[player.userId] = response.data;
      } catch (error) {
        ratingsData[player.userId] = { likes: 0, dislikes: 0, userRating: null };
      }
    }
    setRatings(ratingsData);
  };

  const handleRate = async (userId, rating) => {
    if (!token) {
      toast.error('يجب تسجيل الدخول لتقييم الملف الشخصي');
      return;
    }

    setRatingLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.post(`/api/profile/${userId}/rate`, { rating }, {
        headers: { Authorization: `Bearer ${token}` }
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
        return `${value.toLocaleString()}$`;
      case 'fame':
      case 'level':
      case 'killCount':
      case 'crimesCommitted':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const getTabIcon = (tabKey) => {
    const tab = TABS.find(t => t.key === tabKey);
    return tab ? tab.icon : Trophy;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">
          تصنيف اللاعبين
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-2 animate-fade-in">
        {TABS.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 border-2 ${
                activeTab === tab.key 
                  ? 'border-accent-red bg-red-900/50 text-accent-red shadow-lg shadow-red-900/20' 
                  : 'border-hitman-700 bg-hitman-800/30 text-hitman-300 hover:border-accent-red hover:text-accent-red hover:bg-red-900/20'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Rankings Table */}
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
            <p className="text-hitman-300 text-lg">جاري تحميل التصنيفات...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hitman-900/80 border-b border-hitman-700">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-accent-red">#</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-accent-red">اللاعب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-accent-red">{TABS.find(t => t.key === activeTab)?.label}</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-accent-red">التقييم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hitman-700">
                {players.map((player, idx) => {
                  const playerRating = ratings[player.userId] || { likes: 0, dislikes: 0, userRating: null };
                  const isRatingLoading = ratingLoading[player.userId];
                  
                  return (
                    <tr 
                      key={player.ranking} 
                      className={`hover:bg-hitman-700/30 transition-colors duration-200 ${
                        idx < 3 ? 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/10' : ''
                      }`}
                    >
                      {/* Ranking */}
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-500 text-black' :
                          idx === 1 ? 'bg-gray-400 text-black' :
                          idx === 2 ? 'bg-amber-600 text-white' :
                          'bg-hitman-700 text-hitman-300'
                        }`}>
                          {player.ranking}
                        </div>
                      </td>
                      
                      {/* Player Name */}
                      <td className="px-6 py-4">
                        <Link 
                          to={`/dashboard/profile/${player.username}`}
                          className="flex items-center gap-3 group hover:text-accent-red transition-colors duration-200"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-full flex items-center justify-center border border-hitman-600 group-hover:border-accent-red transition-colors">
                            <span className="text-lg font-bold text-hitman-300 group-hover:text-accent-red">
                              {player.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-accent-red transition-colors">
                              {player.username}
                            </div>
                            <div className="text-xs text-hitman-400">
                              المستوى {player.level || 1}
                            </div>
                          </div>
                        </Link>
                      </td>
                      
                      {/* Criteria Value */}
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-lg font-bold text-accent-green">
                          {formatValue(player.criteria, activeTab)}
                        </span>
                      </td>
                      
                      {/* Rating */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Like/Dislike Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRate(player.userId, 'LIKE')}
                              disabled={isRatingLoading}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                playerRating.userRating === 'LIKE'
                                  ? 'bg-green-600 text-white shadow-lg'
                                  : 'bg-hitman-700 text-hitman-300 hover:bg-green-600 hover:text-white'
                              } ${isRatingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-green-400 min-w-[20px] text-center">
                              {playerRating.likes}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRate(player.userId, 'DISLIKE')}
                              disabled={isRatingLoading}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                playerRating.userRating === 'DISLIKE'
                                  ? 'bg-red-600 text-white shadow-lg'
                                  : 'bg-hitman-700 text-hitman-300 hover:bg-red-600 hover:text-white'
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
      <div className="max-w-4xl mx-auto mt-8 text-center text-hitman-400 text-sm">
        <p>يتم تحديث التصنيفات كل 5 دقائق • يمكنك النقر على اسم اللاعب لعرض ملفه الشخصي</p>
      </div>
    </div>
  );
}

export default Ranking;
