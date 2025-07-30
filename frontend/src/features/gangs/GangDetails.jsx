import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Crown, 
  Users, 
  DollarSign, 
  Shield, 
  Target, 
  Edit3, 
  Trash2, 
  LogOut,
  UserPlus,
  Star,
  Activity,
  Briefcase,
  Home,
  UserMinus,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import VipName from '../profile/VipName.jsx';
import '../profile/vipSparkle.css';

export default function GangDetails({ gang, onRefresh }) {
  const { isAuthed, tokenLoaded } = useAuth();
  const [board, setBoard] = useState(gang.board);
  const [editingBoard, setEditingBoard] = useState(false);

  const [vault, setVault] = useState(gang.money);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [userMember, setUserMember] = useState(null);
  const [kickingMember, setKickingMember] = useState(null);
  const [promotingMember, setPromotingMember] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);

  const navigate = useNavigate();

  // Get current user data and check membership
  useEffect(() => {
    // Wait for auth to be loaded before making any requests
    if (!tokenLoaded) {
      return;
    }

    const getCurrentUser = async () => {
      try {
        const response = await axios.get('/api/profile');
        const userData = response.data;
        
              // Check membership by both userId and User.id to be safe
      const member = gang.GangMembers?.find(m => 
        m.User?.id === userData.userId || m.userId === userData.userId
      );
      setUserMember(member);
      } catch (err) {
        console.error('Failed to get current user:', err);
        
        // Fallback: try to decode JWT token to get user ID
        try {
          const token = localStorage.getItem('jwt');
          if (token) {
            // Simple JWT decode (payload only)
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            const member = gang.GangMembers?.find(m => 
              m.User?.id === payload.id || m.userId === payload.id
            );
            setUserMember(member);
          }
        } catch (jwtErr) {
          console.error('Failed to decode JWT:', jwtErr);
        }
      }
    };

    if (isAuthed) {
      getCurrentUser();
    }
  }, [gang.GangMembers, isAuthed, tokenLoaded]);

    // Check user's role in the gang
  const isMember = !!userMember;
  const isAdmin = userMember?.role === 'LEADER' || userMember?.role === 'OFFICER';
  const isOwner = userMember?.role === 'LEADER';

  // Load join requests when component mounts and user is admin
  useEffect(() => {
    if (isAdmin && gang.id) {
      loadJoinRequests();
    }
  }, [isAdmin, gang.id]);



  // Update vault state when gang prop changes
  useEffect(() => {
    setVault(gang.money || 0);
  }, [gang.money]);

  // Calculate total fame of all members
  const totalFame = gang.GangMembers?.reduce((sum, member) => {
    const character = member.User?.Character;
    if (character) {
      // Fame formula: (level * 100) + (strength * 20) + (hp * 8) + (defense * 20)
      const fame = (character.level * 100) + (character.strength * 20) + (character.hp * 8) + (character.defense * 20);
      return sum + Math.round(fame);
    }
    return sum;
  }, 0) || 0;

  const saveBoard = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.patch(`/api/gangs/${gang.id}/board`, { board }, { headers });
      setBoard(res.data.board);
      setEditingBoard(false);
    } catch (err) {
      setError(err.response?.data?.error || 'فشل حفظ اللوحة');
    } finally {
      setLoading(false);
    }
  };

  const leaveGang = async () => {
    if (!window.confirm('هل أنت متأكد من مغادرة العصابة؟')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/leave`, {}, { headers });
      navigate('/dashboard/gangs');
    } catch (err) {
      setError(err.response?.data?.error || 'فشل مغادرة العصابة');
    } finally {
      setLoading(false);
    }
  };

  const donateToVault = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const amount = parseInt(donateAmount, 10);
      if (!amount || amount <= 0) throw new Error('أدخل مبلغًا صحيحًا');
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`/api/gangs/${gang.id}/contribute`, { amount }, { headers });
      setVault(res.data.gangMoney);
      setDonateAmount('');
    } catch (err) {
      setError(err.response?.data?.error || 'فشل التبرع');
    } finally {
      setLoading(false);
    }
  };

  const transferFromVault = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const amount = parseInt(transferAmount, 10);
      if (!amount || amount <= 0) throw new Error('أدخل مبلغًا صحيحًا');
      if (!transferTarget) throw new Error('اختر عضوًا');
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`/api/gangs/${gang.id}/transfer-money`, { memberId: transferTarget, amount }, { headers });
      setVault(res.data.gangMoney);
      setTransferAmount('');
      setTransferTarget('');
    } catch (err) {
      setError(err.response?.data?.error || 'فشل التحويل');
    } finally {
      setLoading(false);
    }
  };

  const deleteGang = async () => {
    setDeleting(true);
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/api/gangs/${gang.id}`, { headers });
      navigate('/dashboard/gangs');
    } catch (err) {
      setError(err.response?.data?.error || 'فشل حذف العصابة');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const kickMember = async (targetUserId) => {
    if (!window.confirm('هل أنت متأكد من طرد هذا العضو؟')) return;
    setKickingMember(targetUserId);
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/${gang.id}/kick`, { targetUserId }, { headers });
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'فشل طرد العضو');
    } finally {
      setKickingMember(null);
    }
  };

  const promoteMember = async (targetUserId) => {
    if (!window.confirm('هل أنت متأكد من ترقية هذا العضو إلى ضابط؟')) return;
    setPromotingMember(targetUserId);
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/${gang.id}/promote`, { targetUserId }, { headers });
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'فشل ترقية العضو');
    } finally {
      setPromotingMember(null);
    }
  };

  const demoteOfficer = async (targetUserId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء رتبة الضابط لهذا العضو؟')) return;
    setPromotingMember(targetUserId);
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/${gang.id}/demote`, { targetUserId }, { headers });
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'فشل إلغاء رتبة الضابط');
    } finally {
      setPromotingMember(null);
    }
  };

  // Load join requests
  const loadJoinRequests = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`/api/gangs/${gang.id}/join-requests`, { headers });
      setJoinRequests(response.data);
    } catch (err) {
      console.error('Failed to load join requests:', err);
    }
  };

  // Accept join request
  const acceptJoinRequest = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا الطلب؟')) return;
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/${gang.id}/join-requests/accept`, { requestId }, { headers });
      await loadJoinRequests(); // Reload requests
      if (onRefresh) onRefresh(); // Refresh gang data to show new member
    } catch (err) {
      setError(err.response?.data?.error || 'فشل قبول الطلب');
    }
  };

  // Reject join request
  const rejectJoinRequest = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/gangs/${gang.id}/join-requests/reject`, { requestId }, { headers });
      await loadJoinRequests(); // Reload requests
    } catch (err) {
      setError(err.response?.data?.error || 'فشل رفض الطلب');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-hitman-900/80 backdrop-blur-sm border-b border-hitman-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            className="text-accent-red hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-hitman-800" 
            onClick={() => navigate('/dashboard/gangs')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-red to-accent-orange bg-clip-text text-transparent">
              {gang.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-600 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Gang Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent-red" />
                معلومات العصابة
              </h2>
              <p className="text-hitman-300 mb-6 leading-relaxed">{gang.description}</p>
              
              {/* Gang Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-hitman-800/50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-accent-blue mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{gang.GangMembers?.length ?? 0}</div>
                  <div className="text-sm text-hitman-400">الأعضاء</div>
                </div>
                <div className="bg-hitman-800/50 rounded-lg p-4 text-center">
                  <Star className="w-6 h-6 text-accent-yellow mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{totalFame.toLocaleString()}</div>
                  <div className="text-sm text-hitman-400">إجمالي الشهرة</div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Gang Vault */}
            <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent-green" />
                خزنة العصابة
              </h3>
              <div className="bg-hitman-800/50 rounded-lg p-4 text-center mb-4">
                <div className="text-3xl font-bold text-accent-green">{vault.toLocaleString()}</div>
                <div className="text-sm text-hitman-400">دولار</div>
              </div>
              
              {/* Donate to vault - Members only */}
              {isMember && (
                <form onSubmit={donateToVault} className="space-y-3">
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 rounded-lg bg-hitman-800 border border-hitman-600 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
                    placeholder="المبلغ"
                    value={donateAmount}
                    onChange={e => setDonateAmount(e.target.value)}
                    disabled={loading}
                  />
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-accent-green to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    تبرع للخزنة
                  </button>
                </form>
              )}
            </div>

            {/* Quick Actions */}
            {isMember && (
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">إجراءات سريعة</h3>
                <div className="space-y-3">
                  <button
                    className="w-full bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={leaveGang}
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4" />
                    مغادرة العصابة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Members List */}
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-blue" />
            أعضاء العصابة ({gang.GangMembers?.length ?? 0}/{gang.maxMembers})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gang.GangMembers?.map(member => (
              <div key={member.id} className="bg-hitman-800/50 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-full flex items-center justify-center text-accent-red font-bold">
                  {member.User?.username?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <VipName user={member.User} />
                  <div className="text-sm text-hitman-400 flex items-center gap-1">
                    {member.role === 'LEADER' && <Crown className="w-3 h-3 text-accent-yellow" />}
                    {member.role === 'OFFICER' && <Star className="w-3 h-3 text-accent-blue" />}
                    <span>{member.role === 'LEADER' ? 'قائد' : member.role === 'OFFICER' ? 'ضابط' : 'عضو'}</span>
                  </div>
                  <div className="text-xs text-hitman-500">
                    الشهرة: {(() => {
                      const character = member.User?.Character;
                      if (character) {
                        const fame = (character.level * 100) + (character.strength * 20) + (character.hp * 8) + (character.defense * 20);
                        return Math.round(fame);
                      }
                      return 0;
                    })()}
                  </div>
                </div>
                
                {/* Member Management Buttons - Only show for leaders and officers */}
                {isAdmin && member.User?.id !== userMember?.User?.id && (
                  <div className="flex gap-1">
                    {/* Kick button - Leaders can kick anyone except themselves, Officers can kick members */}
                    {(isOwner || (isAdmin && member.role === 'MEMBER')) && (
                      <button
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                        onClick={() => kickMember(member.User?.id)}
                        disabled={kickingMember === member.User?.id}
                        title="طرد العضو"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Promote/Demote buttons - Only leaders can promote/demote */}
                    {isOwner && member.role === 'MEMBER' && (
                      <button
                        className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded transition-colors"
                        onClick={() => promoteMember(member.User?.id)}
                        disabled={promotingMember === member.User?.id}
                        title="ترقية إلى ضابط"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    
                    {isOwner && member.role === 'OFFICER' && (
                      <button
                        className="p-1 text-orange-400 hover:text-orange-300 hover:bg-orange-900/30 rounded transition-colors"
                        onClick={() => demoteOfficer(member.User?.id)}
                        disabled={promotingMember === member.User?.id}
                        title="إلغاء رتبة الضابط"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Join Requests - Admin only */}
        {isAdmin && joinRequests.length > 0 && (
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent-green" />
              طلبات الانضمام ({joinRequests.length})
            </h2>
            <div className="space-y-4">
              {joinRequests.map(request => (
                <div key={request.id} className="bg-hitman-800/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-full flex items-center justify-center text-accent-green font-bold">
                      {request.User?.username?.[0] || '?'}
                    </div>
                    <div>
                      <VipName user={request.User} />
                      <div className="text-sm text-hitman-400">
                        {request.message || 'لا توجد رسالة'}
                      </div>
                      <div className="text-xs text-hitman-500">
                        {new Date(request.createdAt).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-gradient-to-r from-accent-green to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2"
                      onClick={() => acceptJoinRequest(request.id)}
                    >
                      <UserCheck className="w-4 h-4" />
                      قبول
                    </button>
                    <button
                      className="bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2"
                      onClick={() => rejectJoinRequest(request.id)}
                    >
                      <UserX className="w-4 h-4" />
                      رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Board - Members only */}
        {isMember && (
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-accent-purple" />
              لوحة الإدارة
            </h2>
            {editingBoard ? (
              <div className="space-y-4">
                <textarea
                  className="w-full p-4 rounded-lg bg-hitman-800 border border-hitman-600 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-purple resize-none"
                  value={board}
                  onChange={e => setBoard(e.target.value)}
                  rows={4}
                  placeholder="اكتب رسالة لأعضاء العصابة..."
                  disabled={loading}
                />
                <div className="flex gap-3">
                  <button 
                    className="bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
                    onClick={saveBoard}
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button 
                    className="bg-hitman-700 hover:bg-hitman-600 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300"
                    onClick={() => setEditingBoard(false)}
                    disabled={loading}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-hitman-800/50 rounded-lg p-4 mb-4 whitespace-pre-wrap break-words min-h-[100px]">
                  {board || 'لا توجد رسائل من الإدارة'}
                </div>
                {isAdmin && (
                  <button 
                    className="bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300"
                    onClick={() => setEditingBoard(true)}
                  >
                    تعديل اللوحة
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin Only Sections */}
        {isAdmin && (
          <>
            {/* Transfer Money - Owner only */}
            {isOwner && (
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent-green" />
                  تحويل من الخزنة
                </h2>
                <form onSubmit={transferFromVault} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      className="w-full p-3 rounded-lg bg-hitman-800 border border-hitman-600 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
                      value={transferTarget}
                      onChange={e => setTransferTarget(e.target.value)}
                      disabled={loading || gang.GangMembers?.length === 0}
                    >
                      <option value="">اختر عضوًا</option>
                      {gang.GangMembers?.map(m => (
                        <option key={m.id} value={m.User?.id}>
                          {m.User?.username} {m.role === 'LEADER' ? '(قائد)' : m.role === 'OFFICER' ? '(ضابط)' : '(عضو)'}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-3 rounded-lg bg-hitman-800 border border-hitman-600 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-green"
                      placeholder="المبلغ"
                      value={transferAmount}
                      onChange={e => setTransferAmount(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-accent-green to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
                    disabled={loading || gang.GangMembers?.length === 0}
                  >
                    تحويل المال
                  </button>
                </form>
              </div>
            )}


          </>
        )}

        {/* Delete Gang - Owner only */}
        {isOwner && (
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-600/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              حذف العصابة
            </h2>
            <p className="text-hitman-300 mb-4">
              تحذير: حذف العصابة إجراء نهائي لا يمكن التراجع عنه. سيتم طرد جميع الأعضاء.
            </p>
            {!deleteConfirm ? (
              <button
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                حذف العصابة نهائيًا
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-red-400 text-center font-bold">
                  هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
                    onClick={deleteGang}
                    disabled={deleting}
                  >
                    {deleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                  </button>
                  <button
                    className="flex-1 bg-hitman-700 hover:bg-hitman-600 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300"
                    onClick={() => setDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
}
