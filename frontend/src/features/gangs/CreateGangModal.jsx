import { useState } from 'react';
import axios from 'axios';
import { X, Crown, Coins, DollarSign, AlertCircle } from 'lucide-react';

export default function CreateGangModal({ onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('blackcoins');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/gangs', { name, description, method });
      window.location.reload();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'فشل الإنشاء';
      if (errorMessage.includes('Not enough money')) {
        setError('لا تملك مال كافي لإنشاء العصابة');
      } else if (errorMessage.includes('Not enough black coins')) {
        setError('لا تملك بلاك كوين كافي لإنشاء العصابة');
      } else if (errorMessage.includes('already in a gang')) {
        setError('أنت بالفعل في عصابة');
      } else if (errorMessage.includes('already taken')) {
        setError('اسم العصابة مستخدم بالفعل');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-hitman-800/90 to-hitman-900/90 backdrop-blur-sm border border-hitman-700 rounded-2xl p-8 w-full max-w-md text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-red to-accent-orange bg-clip-text text-transparent">
            إنشاء عصابة جديدة
          </h2>
          <button
            onClick={onClose}
            className="text-hitman-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-hitman-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Gang Name */}
          <div>
            <label className="block text-sm font-medium text-hitman-300 mb-2">
              اسم العصابة
            </label>
            <input
              type="text"
              className="w-full p-4 rounded-xl bg-hitman-800 border border-hitman-600 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent transition-all"
              placeholder="أدخل اسم العصابة..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-hitman-300 mb-2">
              وصف العصابة
            </label>
            <textarea
              className="w-full p-4 rounded-xl bg-hitman-800 border border-hitman-600 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-red focus:border-transparent resize-none transition-all"
              placeholder="اكتب وصفًا للعصابة..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={200}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-hitman-300 mb-3">
              طريقة الدفع
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 bg-hitman-800/50 border border-hitman-600 rounded-xl cursor-pointer hover:border-accent-blue transition-all">
                <input
                  type="radio"
                  name="method"
                  value="blackcoins"
                  checked={method === 'blackcoins'}
                  onChange={() => setMethod('blackcoins')}
                  className="mr-3 text-accent-blue"
                />
                <div className="flex items-center gap-3">
                  <img src="/images/blackcoins-icon.png" alt="Blackcoin" className="w-5 h-5 object-contain" />
                  <div>
                    <div className="font-medium text-white">30 بلاك كوين</div>
                    <div className="text-sm text-hitman-400">الطريقة الأرخص</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center p-4 bg-hitman-800/50 border border-hitman-600 rounded-xl cursor-pointer hover:border-accent-green transition-all">
                <input
                  type="radio"
                  name="method"
                  value="vip"
                  checked={method === 'vip'}
                  onChange={() => setMethod('vip')}
                  className="mr-3 text-accent-green"
                />
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-accent-yellow" />
                  <div>
                    <div className="font-medium text-white">VIP + 100,000 دولار</div>
                    <div className="text-sm text-hitman-400">لللاعبين المميزين</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 p-4 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreate}
              disabled={loading || !name.trim() || !description.trim()}
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء العصابة'}
            </button>
            <button
              className="flex-1 bg-hitman-700 hover:bg-hitman-600 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300"
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-hitman-800/50 rounded-xl border border-hitman-600">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-accent-yellow mt-0.5 flex-shrink-0" />
            <div className="text-sm text-hitman-300">
              <div className="font-medium text-white mb-1">معلومات مهمة:</div>
              <ul className="space-y-1 text-xs">
                <li>• ستصبح قائد العصابة تلقائيًا</li>
                <li>• يمكنك إضافة حتى 30 عضو</li>
                <li>• يمكنك إدارة الخزنة والمخزون</li>
                <li>• يمكنك حذف العصابة في أي وقت</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
