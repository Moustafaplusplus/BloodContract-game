import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Bomb, Users, Crown, Target, AlertTriangle, Crosshair } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GangBombModal({ isOpen, onClose, onUse, itemId }) {
  const [gangs, setGangs] = useState([]);
  const [selectedGangId, setSelectedGangId] = useState('');
  const [loading, setLoading] = useState(false);
  const [gangsLoading, setGangsLoading] = useState(true);
  const [myGang, setMyGang] = useState(null);

  // Fetch available gangs
  useEffect(() => {
    if (isOpen) {
      fetchGangs();
    }
  }, [isOpen]);

  const fetchGangs = async () => {
    try {
      setGangsLoading(true);
      const token = null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [gangsRes, myGangRes] = await Promise.all([
        axios.get('/api/gangs', { headers }),
        axios.get('/api/gangs/user/mine', { headers }).catch(() => null)
      ]);
      
      setGangs(gangsRes.data);
      setMyGang(myGangRes?.data || null);
    } catch (error) {
      console.error('Failed to fetch gangs:', error);
      toast.error('فشل في تحميل العصابات');
    } finally {
      setGangsLoading(false);
    }
  };

  const handleUseGangBomb = async () => {
    if (!selectedGangId) {
      toast.error('يرجى اختيار عصابة مستهدفة');
      return;
    }

    setLoading(true);
    try {
      const token = null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(`/api/special-items/${itemId}/use`, {
        targetGangId: selectedGangId
      }, { headers });
      
      toast.success('تم استخدام قنبلة العصابة بنجاح!');
      onUse(response.data);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل استخدام قنبلة العصابة';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-3d bg-gradient-to-br from-blood-950/90 to-black/90 border-blood-500/50 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        
        {/* Enhanced Header */}
        <div className="relative p-6 border-b border-blood-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blood-500/10 to-red-500/10"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg">
                <Bomb className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blood-400">قنبلة العصابة</h2>
                <p className="text-sm text-white/60">اختر العصابة المستهدفة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Warning */}
        <div className="p-6 border-b border-blood-500/30">
          <div className="card-3d bg-red-950/40 border-red-500/50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <Crosshair className="w-4 h-4" />
                  تحذير خطير!
                </h3>
                <div className="space-y-2 text-sm text-red-200">
                  <p>• سيتم إدخال جميع أعضاء العصابة المستهدفة المستشفى لمدة 30 دقيقة</p>
                  <p>• لا يمكنك استهداف عصابتك الخاصة</p>
                  <p>• هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Gang Selection */}
        <div className="p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blood-400" />
            اختر العصابة المستهدفة:
          </h3>
          
          {gangsLoading ? (
            <div className="text-center py-8">
              <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
              <p className="text-white/60">جاري تحميل العصابات...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {gangs.map(gang => {
                const isMyGang = myGang && myGang.id === gang.id;
                const memberCount = gang.GangMembers?.length || 0;
                
                return (
                  <div
                    key={gang.id}
                    className={`card-3d p-4 transition-all cursor-pointer group ${
                      selectedGangId === gang.id
                        ? 'border-blood-500/70 bg-blood-500/10 shadow-lg shadow-blood-500/20'
                        : isMyGang
                        ? 'border-zinc-600/50 bg-zinc-800/30 cursor-not-allowed opacity-50'
                        : 'hover:border-blood-500/40 hover:bg-blood-950/20'
                    }`}
                    onClick={() => !isMyGang && setSelectedGangId(gang.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isMyGang 
                            ? 'bg-yellow-500/20 border border-yellow-500/40' 
                            : selectedGangId === gang.id
                            ? 'bg-blood-500/20 border border-blood-500/40'
                            : 'bg-black/40 border border-white/20'
                        }`}>
                          {isMyGang ? (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          ) : (
                            <Users className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white flex items-center gap-2">
                            {gang.name}
                            {isMyGang && (
                              <span className="text-yellow-400 text-xs bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/40">
                                عصابتك
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-white/60 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {memberCount} عضو
                          </p>
                        </div>
                      </div>
                      
                      {selectedGangId === gang.id && (
                        <div className="w-6 h-6 bg-blood-500 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {isMyGang && (
                      <div className="mt-3 p-2 bg-yellow-950/20 border border-yellow-500/30 rounded">
                        <p className="text-xs text-yellow-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          لا يمكن استهداف عصابتك الخاصة
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {gangs.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-2">لا توجد عصابات</h3>
                  <p className="text-white/60 text-sm">لا توجد عصابات متاحة للاستهداف</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Actions */}
        <div className="p-6 border-t border-blood-500/30">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-3d-secondary flex-1 py-3 text-center font-bold"
            >
              إلغاء
            </button>
            <button
              onClick={handleUseGangBomb}
              disabled={!selectedGangId || loading}
              className="btn-3d flex-1 py-3 text-center font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="loading-shimmer w-4 h-4 rounded-full"></div>
                  جاري الاستخدام...
                </>
              ) : (
                <>
                  <Bomb className="w-4 h-4" />
                  استخدام القنبلة
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Enhanced Effects Warning */}
        <div className="p-6 pt-0">
          <div className="card-3d bg-orange-950/20 border-orange-500/30 p-3">
            <div className="text-center text-xs text-orange-300">
              ⚠️ تأكد من اختيارك قبل التأكيد - العملية لا يمكن التراجع عنها
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
