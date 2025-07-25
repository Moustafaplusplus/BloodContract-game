import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import GangDetails from './GangDetails';
import { Users, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function GangDetailsWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthed, tokenLoaded } = useAuth();
  const [gang, setGang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMember, setIsMember] = useState(false);

  // Function to refresh gang data
  const refreshGangData = async () => {
    try {
      const gangResponse = await axios.get(`/api/gangs/${id}`);
      setGang(gangResponse.data);
    } catch (err) {
      console.error('Failed to refresh gang data:', err);
    }
  };

  useEffect(() => {
    // Wait for auth to be loaded before making any requests
    if (!tokenLoaded) {
      return;
    }

    setLoading(true);
    
    // First get current user data
    const getCurrentUser = async () => {
      try {
        const response = await axios.get('/api/character');
        const userData = response.data;
        
        // Return user data with both userId and User object
        return {
          id: userData.userId, // Use userId from character
          username: userData.User?.username,
          ...userData.User
        };
      } catch (err) {
        console.error('Failed to get current user:', err);
        
        // Fallback: try to decode JWT token to get user ID
        try {
          const token = localStorage.getItem('jwt');
          if (token) {
            // Simple JWT decode (payload only)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return { id: payload.id, username: payload.username };
          }
        } catch (jwtErr) {
          console.error('Failed to decode JWT:', jwtErr);
        }
        
        return null;
      }
    };

    // Then get gang data and check membership
    const loadGangData = async () => {
      try {
        const user = await getCurrentUser();
        const gangResponse = await axios.get(`/api/gangs/${id}`);
        setGang(gangResponse.data);
        
        if (user) {
          // Check membership by both userId and User.id to be safe
          const userMember = gangResponse.data.GangMembers?.find(m => 
            m.User?.id === user.id || m.userId === user.id
          );
          setIsMember(!!userMember);
        } else {
          setIsMember(false);
        }
        
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('العصابة غير موجودة');
        } else {
          setError('حدث خطأ في تحميل بيانات العصابة');
        }
        setLoading(false);
      }
    };

    if (isAuthed) {
      loadGangData();
    } else {
      setLoading(false);
      setError('يجب تسجيل الدخول أولاً');
    }
  }, [id, isAuthed, tokenLoaded]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-red mx-auto mb-6"></div>
          <p className="text-white text-lg">جاري تحميل بيانات العصابة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-accent-red/30 rounded-xl p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-hitman-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard/gangs')}
            className="bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للعصابات
          </button>
        </div>
      </div>
    );
  }

  if (!gang) return null;

  // If user is not a member, show limited view with join option
  if (!isMember) {
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
          {/* Limited Gang Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent-blue" />
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
                    <div className="w-6 h-6 bg-accent-yellow rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-xs font-bold text-black">⭐</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalFame.toLocaleString()}</div>
                    <div className="text-sm text-hitman-400">إجمالي الشهرة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Panel */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent-blue" />
                  انضم للعصابة
                </h3>
                <div className="text-center">
                  <div className="bg-accent-blue/20 border border-accent-blue/30 rounded-lg px-4 py-3 mb-4">
                    <div className="text-accent-blue font-bold text-lg">
                      {gang.GangMembers?.length ?? 0}/{gang.maxMembers}
                    </div>
                    <div className="text-sm text-hitman-400">عضو</div>
                  </div>
                  
                  {gang.GangMembers?.length >= gang.maxMembers ? (
                    <div className="bg-red-900/30 border border-red-600 text-red-400 p-4 rounded-lg">
                      <div className="font-bold mb-1">العصابة ممتلئة</div>
                      <div className="text-sm">لا يمكن الانضمام حالياً</div>
                    </div>
                  ) : (
                    <button
                      className="w-full bg-gradient-to-r from-accent-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                      onClick={async () => {
                        try {
                          await axios.post(`/api/gangs/${gang.id}/join`);
                          alert('تم إرسال طلب الانضمام بنجاح! انتظر موافقة قائد العصابة.');
                        } catch (err) {
                          if (err.response?.data?.error === 'You already have a pending join request for this gang') {
                            if (window.confirm('لديك طلب انضمام معلق لهذه العصابة. هل تريد إلغاء الطلب السابق وإرسال طلب جديد؟')) {
                              try {
                                await axios.delete(`/api/gangs/${gang.id}/join-requests/cancel`);
                                await axios.post(`/api/gangs/${gang.id}/join`);
                                alert('تم إرسال طلب الانضمام بنجاح! انتظر موافقة قائد العصابة.');
                              } catch (cancelErr) {
                                alert(cancelErr.response?.data?.error || 'فشل في إلغاء الطلب السابق وإرسال طلب جديد');
                              }
                            }
                          } else {
                            alert(err.response?.data?.error || 'فشل إرسال طلب الانضمام');
                          }
                        }
                      }}
                    >
                      إرسال طلب انضمام
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">معلومات مهمة</h3>
                <div className="space-y-3 text-sm text-hitman-300">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>
                    <span>انضم للعصابة للوصول لجميع الميزات</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
                    <span>شارك في الخزنة والمخزون</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-accent-purple rounded-full mt-2 flex-shrink-0"></div>
                    <span>تواصل مع الأعضاء الآخرين</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Public Members List */}
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
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
                    <div className="font-bold text-white">{member.User?.username}</div>
                    <div className="text-sm text-hitman-400">
                      {member.role === 'LEADER' ? 'قائد' : member.role === 'OFFICER' ? 'ضابط' : 'عضو'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is a member, show full details
  return <GangDetails gang={gang} onGangUpdate={refreshGangData} />;
} 