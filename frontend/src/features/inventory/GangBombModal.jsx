import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Bomb, Users, Crown, Target } from 'lucide-react';
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
      const token = localStorage.getItem('jwt');
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
      const token = localStorage.getItem('jwt');
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-hitman-800/90 to-hitman-900/90 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <Bomb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">قنبلة العصابة</h2>
              <p className="text-sm text-hitman-400">اختر العصابة المستهدفة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-hitman-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-hitman-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400 mb-1">تحذير!</h3>
              <p className="text-sm text-hitman-300">
                سيتم إدخال جميع أعضاء العصابة المستهدفة المستشفى لمدة 30 دقيقة. 
                لا يمكنك استهداف عصابة الخاصة بك.
              </p>
            </div>
          </div>
        </div>

        {/* Gang Selection */}
        <div className="space-y-4">
          <h3 className="font-bold text-white mb-3">اختر العصابة المستهدفة:</h3>
          
          {gangsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-red mx-auto mb-3"></div>
              <p className="text-hitman-400">جاري تحميل العصابات...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {gangs.map(gang => {
                const isMyGang = myGang && myGang.id === gang.id;
                const memberCount = gang.GangMembers?.length || 0;
                
                return (
                  <div
                    key={gang.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedGangId === gang.id
                        ? 'border-accent-red bg-accent-red/10'
                        : isMyGang
                        ? 'border-hitman-600 bg-hitman-800/50 cursor-not-allowed opacity-50'
                        : 'border-hitman-600 bg-hitman-800/30 hover:border-hitman-500 hover:bg-hitman-800/50'
                    }`}
                    onClick={() => !isMyGang && setSelectedGangId(gang.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-full flex items-center justify-center">
                          {isMyGang ? (
                            <Crown className="w-4 h-4 text-accent-yellow" />
                          ) : (
                            <Users className="w-4 h-4 text-accent-blue" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">
                            {gang.name}
                            {isMyGang && <span className="text-accent-yellow text-sm ml-2">(عصابتك)</span>}
                          </h4>
                          <p className="text-sm text-hitman-400">
                            {memberCount} عضو
                          </p>
                        </div>
                      </div>
                      
                      {selectedGangId === gang.id && (
                        <div className="w-5 h-5 bg-accent-red rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {isMyGang && (
                      <p className="text-xs text-red-400 mt-2">
                        لا يمكن استهداف عصابة الخاصة بك
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-hitman-700 hover:bg-hitman-600 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300"
          >
            إلغاء
          </button>
          <button
            onClick={handleUseGangBomb}
            disabled={!selectedGangId || loading}
            className="flex-1 bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
    </div>
  );
} 