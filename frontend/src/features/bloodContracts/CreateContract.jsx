import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Target, DollarSign, User, Search, AlertCircle, CheckCircle, Loader, ImageIcon, Plus } from 'lucide-react';

const CreateContract = ({ currentUserId, onContractCreated }) => {
  const [targetId, setTargetId] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetId || isNaN(targetId)) {
      setTargetUsername('');
      setUsernameError('');
      return;
    }
    setUsernameLoading(true);
    setUsernameError('');
    setTargetUsername('');
    fetch(`/api/users/${targetId}`)
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          // Use character name if available, otherwise use username
          setTargetUsername(data.character?.name || data.username);
        } else {
          setUsernameError('المستخدم غير موجود.');
        }
      })
      .catch(() => setUsernameError('فشل جلب اسم المستخدم.'))
      .finally(() => setUsernameLoading(false));
  }, [targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!targetId || !price) {
      setError('يرجى تعبئة جميع الحقول.');
      return;
    }
    if (targetId === currentUserId) {
      setError('لا يمكنك استهداف نفسك.');
      return;
    }
    if (isNaN(price) || Number(price) <= 0) {
      setError('يجب أن يكون السعر رقماً موجباً.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('/api/bloodcontracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ targetId: Number(targetId), price: Number(price) }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message?.includes('لا يمكن وضع عقد دم على هذا اللاعب لأنه محمي من الهجمات حالياً')) {
          toast.error('🛡️ لا يمكن وضع عقد دم على هذا اللاعب لأنه محمي من الهجمات حالياً.');
        } else {
          setError(data.message || 'فشل إنشاء العقد.');
        }
      } else {
        setSuccess('تم إنشاء العقد بنجاح!');
        setTargetId('');
        setPrice('');
        if (onContractCreated) onContractCreated();
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Form Header with Visual Banner */}
      <div className="relative h-16 bg-gradient-to-r from-blood-800/30 to-blood-600/20 rounded-lg border border-blood-500/20 flex items-center p-3 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blood-500/5 to-transparent animate-pulse" />
        
        <div className="flex items-center space-x-2 z-10">
          <div className="w-8 h-8 bg-blood-600 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">إنشاء عقد دم</h3>
            <p className="text-xs text-blood-300">Create Blood Contract</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-auto">
          <ImageIcon className="w-4 h-4 text-blood-300" />
          <Target className="w-4 h-4 text-blood-400 animate-pulse" />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target Player Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-blood-400" />
            <span>معرّف اللاعب المستهدف</span>
          </label>
          
          <div className="relative">
            <input
              type="text"
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              className="w-full bg-black/60 border border-blood-500/30 text-white placeholder-blood-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all duration-300"
              placeholder="Enter player ID..."
              disabled={loading}
            />
            {usernameLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader className="w-4 h-4 text-blood-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Username Status */}
          {usernameLoading && (
            <div className="flex items-center space-x-2 text-blood-300 text-sm">
              <Search className="w-4 h-4 animate-pulse" />
              <span>جاري البحث عن الاسم...</span>
            </div>
          )}
          
          {targetUsername && !usernameError && (
            <div className="flex items-center space-x-2 text-green-400 text-sm bg-green-900/20 border border-green-500/20 rounded p-2">
              <CheckCircle className="w-4 h-4" />
              <span>اسم اللاعب: {targetUsername}</span>
            </div>
          )}
          
          {usernameError && (
            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded p-2">
              <AlertCircle className="w-4 h-4" />
              <span>{usernameError}</span>
            </div>
          )}
        </div>

        {/* Price Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blood-400" />
            <span>السعر</span>
          </label>
          
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-black/60 border border-blood-500/30 text-white placeholder-blood-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all duration-300"
              placeholder="Enter contract price..."
              min="1"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blood-400 text-sm">
              $
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center space-x-2 text-green-400 text-sm bg-green-900/20 border border-green-500/20 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !targetId || !price || usernameError}
          className="w-full bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blood-500/30 disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">جاري الإنشاء...</span>
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              <span className="text-sm">تأكيد العقد</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Info */}
      <div className="bg-blood-900/10 border border-blood-500/10 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-xs text-blood-300">
          <ImageIcon className="w-3 h-3" />
          <span>Contract will expire after 24 hours if not fulfilled</span>
        </div>
      </div>
    </div>
  );
};

export default CreateContract;
