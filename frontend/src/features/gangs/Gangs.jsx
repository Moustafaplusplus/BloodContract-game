import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Crown, Target, Shield, Plus, Search, Filter, Star, Activity, ImageIcon, Loader, UserPlus, TrendingUp } from 'lucide-react';
import CreateGangModal from './CreateGangModal';
import { useSocket } from "@/hooks/useSocket";
import { toast } from 'react-hot-toast';

const GangCard = ({ gang, isMyGang, myGang, pendingRequests, onJoinGang, onCancelRequest, navigate }) => {
  // Calculate total fame of all members
  const totalFame = gang.GangMembers?.reduce((sum, member) => {
    const character = member.User?.Character;
    if (character) {
      const fame = (character.level * 100) + (character.strength * 20) + (character.hp * 8) + (character.defense * 20);
      return sum + Math.round(fame);
    }
    return sum;
  }, 0) || 0;

  const memberCount = gang.GangMembers?.length || 0;
  const maxMembers = gang.maxMembers || 50;
  const isFull = memberCount >= maxMembers;
  const hasPendingRequest = Array.isArray(pendingRequests) && pendingRequests.some(req => req.gangId === gang.id);

  return (
    <div
      className={`bg-black/80 border rounded-xl p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
        isMyGang 
          ? 'border-blue-500/40 hover:border-blue-500/60' 
          : 'border-blood-500/20 hover:border-blood-500/40'
      }`}
      onClick={isMyGang ? () => navigate(`/gangs/${gang.id}`) : undefined}
    >
      {/* Gang Header with Background */}
      <div className="relative h-16 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg mb-4 overflow-hidden">
        {/* Background Pattern */}
        <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M15 15m-12 0a12,12 0 1,1 24,0a12,12 0 1,1 -24,0\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"}></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isMyGang ? 'bg-blue-600/80' : 'bg-blood-600/80'
            } backdrop-blur-sm`}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white drop-shadow text-sm">
                {gang.name}
                {isMyGang && <span className="text-xs text-yellow-400 ml-1">(عصابتك)</span>}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isFull ? 'bg-red-900/60 text-red-300' : 'bg-green-900/60 text-green-300'
            }`}>
              {memberCount}/{maxMembers}
            </div>
            <ImageIcon className="w-4 h-4 text-white/60" />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-blood-200 text-sm mb-4 line-clamp-2 leading-relaxed">
        {gang.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blood-900/20 border border-blood-500/10 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-blood-300">Total Fame</span>
          </div>
          <div className="text-sm font-bold text-white">{totalFame.toLocaleString()}</div>
        </div>

        <div className="bg-blood-900/20 border border-blood-500/10 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blood-300">Avg Fame</span>
          </div>
          <div className="text-sm font-bold text-white">
            {memberCount > 0 ? Math.round(totalFame / memberCount).toLocaleString() : '0'}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {isMyGang ? (
        <button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
          onClick={() => navigate(`/gangs/${gang.id}`)}
        >
          عرض عصابتك
        </button>
      ) : hasPendingRequest ? (
        <button
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
          onClick={() => onCancelRequest(gang.id)}
        >
          إلغاء الطلب
        </button>
      ) : (
        <button
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 text-sm"
          onClick={() => onJoinGang(gang.id)}
          disabled={isFull || myGang}
        >
          {isFull ? 'العصابة ممتلئة' : myGang ? 'أنت في عصابة أخرى' : 'انضم للعصابة'}
        </button>
      )}
    </div>
  );
};

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
      const token = null;
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
    const token = null;
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
      const token = null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/${gangId}/join`, {}, { headers });
      
      toast.success('تم إرسال طلب الانضمام بنجاح!');
      
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
      const token = null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/gangs/${gangId}/join-requests/cancel`, { headers });
      
      toast.success('تم إلغاء طلب الانضمام بنجاح!');
      
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
      <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 flex items-center justify-center p-4">
        <div className="text-center bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 p-8">
          <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل العصابات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 p-2 sm:p-4 space-y-4">
        
        {/* Gangs Header Banner with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-gray-800 to-red-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23a855f7\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 30m-20 0a20,20 0 1,1 40,0a20,20 0 1,1 -40,0M30 10l10 20l-10 10l-10-20z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">العصابات</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">انضم إلى عصابة أو أنشئ واحدة جديدة</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Users className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{gangs.length}</div>
                <div className="text-xs text-white/80 drop-shadow">Gangs</div>
              </div>
            </div>
          </div>
        </div>

        {/* My Gang Status */}
        {myGang && (
          <div className="bg-black/80 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">أنت في عصابة: {myGang.name}</div>
                <div className="text-sm text-blood-300">اضغط على اسم العصابة للعودة إليها</div>
              </div>
            </div>
          </div>
        )}

        {/* Create Gang Button */}
        {!myGang && (
          <button
            className="w-full bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blood-500/30 flex items-center justify-center space-x-3"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء عصابة جديدة</span>
          </button>
        )}

        {/* Search and Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في العصابات..."
              className="w-full bg-black/60 border border-blood-500/30 text-white placeholder-blood-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blood-400 w-4 h-4" />
          </div>
          
          <div className="relative">
            <select
              className="w-full bg-black/60 border border-blood-500/30 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all duration-300 appearance-none"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="all">جميع العصابات</option>
              <option value="high">كبيرة (20+ عضو)</option>
              <option value="medium">متوسطة (10-19 عضو)</option>
              <option value="low">صغيرة (أقل من 10 أعضاء)</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blood-400 w-4 h-4" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Gangs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGangs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-blood-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blood-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">لا توجد عصابات</h3>
              <p className="text-blood-300">كن أول من ينشئ عصابة!</p>
            </div>
          ) : (
            filteredGangs.map(gang => {
              const isMyGang = myGang && myGang.id === gang.id;
              return (
                <GangCard
                  key={gang.id}
                  gang={gang}
                  isMyGang={isMyGang}
                  myGang={myGang}
                  pendingRequests={pendingRequests}
                  onJoinGang={handleJoinGang}
                  onCancelRequest={handleCancelRequest}
                  navigate={navigate}
                />
              );
            })
          )}
        </div>

        {/* Create Gang CTA */}
        {!myGang && (
          <div className="bg-black/80 border border-blood-500/20 rounded-xl p-6 text-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-blood-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">لا تجد عصابة مناسبة؟</h3>
            <p className="text-blood-300 mb-4">أنشئ عصابة خاصة بك وكن قائدها</p>
            <button
              className="bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowCreateModal(true)}
            >
              إنشاء عصابة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Create Gang Modal */}
      {showCreateModal && (
        <CreateGangModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}
