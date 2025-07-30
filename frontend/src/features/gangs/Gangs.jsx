import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Crown, Target, Shield, Plus, Search, Filter, Star, Activity } from 'lucide-react';
import CreateGangModal from './CreateGangModal';
import { useSocket } from "@/hooks/useSocket";
import { toast } from 'react-hot-toast';

export default function Gangs() {
  const [gangs, setGangs] = useState([]);
  const [myGang, setMyGang] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { socket } = useSocket();

  // Real-time updates for gangs list
  useEffect(() => {
    if (!socket) return;
    const fetchGangs = () => {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      Promise.all([
        axios.get('/api/gangs', { headers }),
        axios.get('/api/gangs/user/mine', { headers }).catch(() => null),
        axios.get('/api/gangs/user/join-requests', { headers }).catch(() => [])
      ]).then(([gangsRes, myGangRes, requestsRes]) => {
        setGangs(gangsRes.data);
        setMyGang(myGangRes?.data || null);
        setPendingRequests(Array.isArray(requestsRes?.data) ? requestsRes.data : []);
      });
    };
    socket.on('gangs:update', fetchGangs);
    const pollInterval = setInterval(fetchGangs, 30000);
    return () => {
      socket.off('gangs:update', fetchGangs);
      clearInterval(pollInterval);
    };
  }, [socket]);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('jwt');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      axios.get('/api/gangs', { headers }),
      axios.get('/api/gangs/user/mine', { headers }).catch(() => null),
      axios.get('/api/gangs/user/join-requests', { headers }).catch(() => [])
    ]).then(([gangsRes, myGangRes, requestsRes]) => {
      setGangs(gangsRes.data);
      setMyGang(myGangRes?.data || null);
      setPendingRequests(Array.isArray(requestsRes?.data) ? requestsRes.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleJoinGang = async (gangId) => {
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/${gangId}/join`, {}, { headers });
      
      // Show success toast
      toast.success('تم إرسال طلب الانضمام بنجاح!');
      
      // Instead of reload, update state directly
      Promise.all([
        axios.get('/api/gangs', { headers }),
        axios.get('/api/gangs/user/mine', { headers }).catch(() => null),
        axios.get('/api/gangs/user/join-requests', { headers }).catch(() => [])
      ]).then(([gangsRes, myGangRes, requestsRes]) => {
        setGangs(gangsRes.data);
        setMyGang(myGangRes?.data || null);
        setPendingRequests(Array.isArray(requestsRes?.data) ? requestsRes.data : []);
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'فشل الانضمام للعصابة';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancelRequest = async (gangId) => {
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/gangs/${gangId}/join-requests/cancel`, { headers });
      
      // Show success toast
      toast.success('تم إلغاء طلب الانضمام بنجاح!');
      
      // Update pending requests
      const requestsRes = await axios.get('/api/gangs/user/join-requests', { headers });
      setPendingRequests(Array.isArray(requestsRes?.data) ? requestsRes.data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'فشل إلغاء الطلب';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const filteredGangs = gangs.filter(gang => {
    const matchesSearch = gang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gang.description.toLowerCase().includes(searchTerm.toLowerCase());
    const memberCount = gang.GangMembers?.length || 0;
    const matchesFilter = filterLevel === 'all' || 
                         (filterLevel === 'high' && memberCount >= 20) ||
                         (filterLevel === 'medium' && memberCount >= 10 && memberCount < 20) ||
                         (filterLevel === 'low' && memberCount < 10);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-red mx-auto mb-6"></div>
          <p className="text-white text-lg">جاري تحميل العصابات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-red to-accent-orange bg-clip-text text-transparent">
              العصابات
            </h1>
            <p className="text-hitman-300 text-lg">
              انضم إلى عصابة أو أنشئ واحدة جديدة لتصبح أقوى
            </p>
            {myGang && (
              <div className="mt-4 p-4 bg-accent-blue/20 border border-accent-blue/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-accent-yellow" />
                  <div>
                    <div className="font-bold text-white">أنت في عصابة: {myGang.name}</div>
                    <div className="text-sm text-hitman-300">اضغط على اسم العصابة للعودة إليها</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Create Gang Button - Only show if not in a gang */}
          {!myGang && (
            <div className="mb-8">
              <button
                className="bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-6 h-6" />
                إنشاء عصابة جديدة
              </button>
            </div>
          )}

          {/* Search and Filter */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hitman-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في العصابات..."
                className="w-full pl-10 pr-4 py-3 bg-hitman-800/50 border border-hitman-700 rounded-xl text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hitman-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-hitman-800/50 border border-hitman-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent appearance-none"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="all">جميع العصابات</option>
                <option value="high">كبيرة (20+ عضو)</option>
                <option value="medium">متوسطة (10-19 عضو)</option>
                <option value="low">صغيرة (أقل من 10 أعضاء)</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-600 text-red-400 p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Gangs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGangs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-hitman-300 mb-2">لا توجد عصابات</h3>
                <p className="text-hitman-400">كن أول من ينشئ عصابة!</p>
              </div>
            ) : (
              filteredGangs.map(gang => {
                // Calculate total fame of all members using Character data
                const totalFame = gang.GangMembers?.reduce((sum, member) => {
                  const character = member.User?.Character;
                  if (character) {
                    // Fame formula: (level * 100) + (strength * 20) + (hp * 8) + (defense * 20)
                    const fame = (character.level * 100) + (character.strength * 20) + (character.hp * 8) + (character.defense * 20);
                    return sum + Math.round(fame);
                  }
                  return sum;
                }, 0) || 0;
                const isMyGang = myGang && myGang.id === gang.id;

                return (
                  <div
                    key={gang.id}
                    className={`bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 transform hover:scale-105 group ${
                      isMyGang 
                        ? 'border-accent-blue hover:border-accent-blue/70 cursor-pointer' 
                        : 'border-hitman-700 hover:border-accent-red/50'
                    }`}
                    onClick={isMyGang ? () => navigate(`/gangs/${gang.id}`) : undefined}
                  >
                    {/* Gang Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold transition-colors mb-1 ${
                          isMyGang ? 'text-accent-blue' : 'text-white group-hover:text-accent-red'
                        }`}>
                          {gang.name}
                          {isMyGang && <span className="text-sm text-accent-yellow ml-2">(عصابتك)</span>}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-hitman-400">
                          <Users className="w-4 h-4" />
                          <span>{gang.GangMembers?.length ?? 0} عضو</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-accent-red/20 border border-accent-red/30 rounded-lg px-3 py-1 text-sm">
                          <span className="text-accent-red font-bold">
                            {gang.GangMembers?.length ?? 0}/{gang.maxMembers}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-hitman-300 text-sm mb-4 line-clamp-3">
                      {gang.description}
                    </p>

                    {/* Gang Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-hitman-800/50 rounded-lg p-3 text-center">
                        <Star className="w-5 h-5 text-accent-yellow mx-auto mb-1" />
                        <div className="text-sm text-hitman-400">إجمالي الشهرة</div>
                        <div className="font-bold text-white">{totalFame.toLocaleString()}</div>
                      </div>
                      <div className="bg-hitman-800/50 rounded-lg p-3 text-center">
                        <Users className="w-5 h-5 text-accent-blue mx-auto mb-1" />
                        <div className="text-sm text-hitman-400">متوسط الشهرة</div>
                        <div className="font-bold text-white">
                          {gang.GangMembers?.length > 0 
                            ? Math.round(totalFame / gang.GangMembers.length).toLocaleString() 
                            : '0'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isMyGang ? (
                      <button
                        className="w-full bg-gradient-to-r from-accent-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                        onClick={() => navigate(`/gangs/${gang.id}`)}
                      >
                        عرض عصابتك
                      </button>
                    ) : (() => {
                      const hasPendingRequest = Array.isArray(pendingRequests) && pendingRequests.some(req => req.gangId === gang.id);
                      
                      if (hasPendingRequest) {
                        return (
                          <button
                            className="w-full bg-gradient-to-r from-accent-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                            onClick={() => handleCancelRequest(gang.id)}
                          >
                            إلغاء الطلب
                          </button>
                        );
                      }
                      
                      return (
                        <button
                          className="w-full bg-gradient-to-r from-accent-green to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleJoinGang(gang.id)}
                          disabled={gang.GangMembers?.length >= gang.maxMembers || myGang}
                        >
                          {gang.GangMembers?.length >= gang.maxMembers 
                            ? 'العصابة ممتلئة' 
                            : myGang 
                              ? 'أنت في عصابة أخرى' 
                              : 'انضم للعصابة'
                          }
                        </button>
                      );
                    })()}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom CTA - Only show if not in a gang */}
          {!myGang && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-accent-red/20 to-accent-orange/20 border border-accent-red/30 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4">لا تجد عصابة مناسبة؟</h3>
                <p className="text-hitman-300 mb-6">
                  أنشئ عصابة خاصة بك وكن قائدها
                </p>
                <button
                  className="bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => setShowCreateModal(true)}
                >
                  إنشاء عصابة جديدة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Gang Modal */}
      {showCreateModal && (
        <CreateGangModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}