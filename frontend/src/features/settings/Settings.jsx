import { useState } from 'react';
import { useBackgroundMusicContext } from '@/contexts/BackgroundMusicContext';
import { useNotificationSoundContext } from '@/contexts/NotificationSoundContext';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Volume2, VolumeX, Volume1, Volume, Settings as SettingsIcon, Music, User, Shield, Bell, Play, Pause, Mail, Lock, ExternalLink, AlertCircle } from 'lucide-react';
import { initiateGoogleOAuth } from '@/utils/testGoogleOAuth';
import axios from 'axios';

export default function Settings() {
  const { isPlaying, volume, toggle, setVolume, userInteracted, isMuted, toggleMute } = useBackgroundMusicContext();
  const { isMuted: notificationMuted, volume: notificationVolume, toggleMute: toggleNotificationMute, setVolume: setNotificationVolume, playNotification } = useNotificationSoundContext();
  const { customToken } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState('audio');
  const [accountModal, setAccountModal] = useState({ isOpen: false, type: '' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  // Check if user is guest by decoding JWT token
  const isGuest = () => {
    if (!customToken) return false;
    try {
      const payload = JSON.parse(atob(customToken.split('.')[1]));
      return payload.guest === true;
    } catch {
      return false;
    }
  };

  const handleGoogleLink = async () => {
    setLoading(true);
    try {
      await initiateGoogleOAuth(setToken, (modalData) => {
        setAccountModal({ isOpen: true, type: 'success', ...modalData });
      });
    } catch (error) {
      setAccountModal({ 
        isOpen: true, 
        type: 'error', 
        title: 'خطأ في ربط الحساب', 
        message: 'فشل في ربط الحساب بحساب جوجل' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/guest-to-account', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setToken(response.data.token);
      setAccountModal({ 
        isOpen: true, 
        type: 'success', 
        title: 'تم إنشاء الحساب', 
        message: 'تم تحويل حساب الضيف إلى حساب عادي بنجاح' 
      });
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في إنشاء الحساب';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getVolumeIcon = () => {
    if (!userInteracted) return VolumeX;
    if (isMuted) return VolumeX;
    if (!isPlaying) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 0.3) return Volume;
    if (volume < 0.7) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  const tabs = [
    { id: 'audio', label: 'الصوت', icon: Music },
    { id: 'account', label: 'الحساب', icon: User },
    { id: 'privacy', label: 'الخصوصية', icon: Shield },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
  ];

  const renderAudioSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Music className="w-5 h-5 ml-2 text-accent-red" />
          إعدادات الموسيقى الخلفية
        </h3>
        
        <div className="space-y-4">
          {/* Music Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">حالة الموسيقى</span>
            <div className="flex items-center gap-2">
              <VolumeIcon className="w-5 h-5" />
              <span className="text-sm text-gray-400">
                {!userInteracted ? 'غير مفعلة' : isMuted ? 'مكتومة' : (isPlaying ? 'تعمل' : 'متوقفة')}
              </span>
            </div>
          </div>

          {/* Mute/Unmute Button */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">كتم/إلغاء كتم الصوت</span>
            <button
              onClick={toggleMute}
              disabled={!userInteracted}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                !userInteracted
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : isMuted
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {!userInteracted ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>انقر لتفعيل</span>
                </>
              ) : isMuted ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>إلغاء الكتم</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>كتم الصوت</span>
                </>
              )}
            </button>
          </div>

          {/* Play/Pause Button */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">تشغيل/إيقاف</span>
            <button
              onClick={toggle}
              disabled={!userInteracted || isMuted}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                !userInteracted || isMuted
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {!userInteracted ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>انقر لتفعيل</span>
                </>
              ) : isMuted ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>مكتوم</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>إيقاف</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>تشغيل</span>
                </>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">مستوى الصوت</span>
              <span className="text-sm text-gray-400">{Math.round(volume * 100)}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                disabled={!userInteracted || isMuted}
                className={`w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider ${
                  !userInteracted || isMuted ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Info Message */}
          {!userInteracted && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                💡 انقر على أي مكان في الصفحة لتفعيل الموسيقى الخلفية
              </p>
            </div>
          )}

          {/* Mute Info */}
          {isMuted && userInteracted && (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
              <p className="text-sm text-yellow-300">
                🔇 الموسيقى مكتومة. انقر على "إلغاء الكتم" لتشغيلها مرة أخرى
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 ml-2 text-accent-red" />
          إعدادات الحساب
        </h3>
        
        <div className="space-y-4">
          {/* Account Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">نوع الحساب</span>
            <div className="flex items-center gap-2">
              {isGuest() ? (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-yellow-400">حساب ضيف</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400">حساب عادي</span>
                </>
              )}
            </div>
          </div>

          {/* Guest Account Options */}
          {isGuest() && (
            <>
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                <h4 className="text-yellow-300 font-semibold mb-2">تحويل حساب الضيف</h4>
                <p className="text-sm text-yellow-200 mb-4">
                  يمكنك تحويل حساب الضيف إلى حساب عادي لحفظ تقدمك بشكل دائم
                </p>
                
                <div className="space-y-3">
                  {/* Google Account Link */}
                  <button
                    onClick={handleGoogleLink}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>ربط بحساب جوجل</span>
                  </button>

                  {/* Email Registration */}
                  <button
                    onClick={() => setAccountModal({ isOpen: true, type: 'email' })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Mail className="w-5 h-5" />
                    <span>إنشاء حساب بالبريد الإلكتروني</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Regular Account Info */}
          {!isGuest() && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
              <h4 className="text-green-300 font-semibold mb-2">حساب عادي</h4>
              <p className="text-sm text-green-200">
                حسابك محفوظ بشكل دائم ويمكنك الوصول إليه من أي جهاز
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 ml-2 text-accent-red" />
          إعدادات الخصوصية
        </h3>
        <p className="text-gray-400">سيتم إضافة إعدادات الخصوصية هنا قريباً</p>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 ml-2 text-accent-red" />
          إعدادات الإشعارات
        </h3>
        
        <div className="space-y-4">
          {/* Notification Sound Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">صوت الإشعارات</span>
            <div className="flex items-center gap-2">
              {notificationMuted ? (
                <VolumeX className="w-5 h-5 text-gray-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-green-400" />
              )}
              <span className="text-sm text-gray-400">
                {notificationMuted ? 'مكتوم' : 'مفعل'}
              </span>
            </div>
          </div>

          {/* Mute/Unmute Button */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">إيقاف/تشغيل الصوت</span>
            <button
              onClick={toggleNotificationMute}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                notificationMuted
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {notificationMuted ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>تشغيل الصوت</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>إيقاف الصوت</span>
                </>
              )}
            </button>
          </div>

          {/* Notification Volume Control */}
          {!notificationMuted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">مستوى صوت الإشعارات</span>
                <span className="text-sm text-gray-400">{Math.round(notificationVolume * 100)}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={notificationVolume}
                  onChange={(e) => setNotificationVolume(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${notificationVolume * 100}%, #374151 ${notificationVolume * 100}%, #374151 100%)`
                  }}
                />
              </div>
            </div>
          )}

          {/* Test Notification Button */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">اختبار الصوت</span>
            <button
              onClick={playNotification}
              disabled={notificationMuted}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                notificationMuted
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>تشغيل صوت تجريبي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'audio':
        return renderAudioSettings();
      case 'account':
        return renderAccountSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderAudioSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SettingsIcon className="w-8 h-8 text-accent-red ml-2" />
            <h1 className="text-3xl font-bold text-white">الإعدادات</h1>
          </div>
          <p className="text-gray-400">تخصيص تجربتك في اللعبة</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-accent-red text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          {renderTabContent()}
        </div>

        {/* Email Registration Modal */}
        {accountModal.isOpen && accountModal.type === 'email' && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">إنشاء حساب جديد</h3>
              
              <form onSubmit={handleEmailRegistration} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-accent-red"
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-accent-red"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-accent-red"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-accent-red"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-accent-red hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountModal({ isOpen: false, type: '' })}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success/Error Modal */}
        {accountModal.isOpen && (accountModal.type === 'success' || accountModal.type === 'error') && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
              <h3 className={`text-xl font-semibold mb-4 ${
                accountModal.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {accountModal.title}
              </h3>
              <p className="text-gray-300 mb-4">{accountModal.message}</p>
              <button
                onClick={() => setAccountModal({ isOpen: false, type: '' })}
                className="w-full px-4 py-2 bg-accent-red hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                موافق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 