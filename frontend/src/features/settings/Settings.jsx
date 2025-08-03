import { useState } from 'react';
import { useBackgroundMusicContext } from '@/contexts/BackgroundMusicContext';
import { useNotificationSoundContext } from '@/contexts/NotificationSoundContext';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { 
  Volume2, 
  VolumeX, 
  Volume1, 
  Volume, 
  Settings as SettingsIcon, 
  Music, 
  User, 
  Shield, 
  Bell, 
  Play, 
  Pause, 
  Mail, 
  Lock, 
  ExternalLink, 
  AlertCircle,
  ImageIcon,
  Crown,
  Sliders,
  Power
} from 'lucide-react';
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
    <div className="space-y-4">
      <div className="card-3d p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center text-green-400">
          <Music className="w-5 h-5 ml-2" />
          إعدادات الموسيقى الخلفية
        </h3>
        
        <div className="space-y-4">
          {/* Music Status */}
          <div className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-3">
            <span className="text-white/80">حالة الموسيقى</span>
            <div className="flex items-center gap-2">
              <VolumeIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm text-white/70">
                {!userInteracted ? 'غير مفعلة' : isMuted ? 'مكتومة' : (isPlaying ? 'تعمل' : 'متوقفة')}
              </span>
            </div>
          </div>

          {/* Mute/Unmute Button */}
          <div className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-3">
            <span className="text-white/80">كتم/إلغاء كتم الصوت</span>
            <button
              onClick={toggleMute}
              disabled={!userInteracted}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm ${
                !userInteracted
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30'
                  : isMuted
                  ? 'btn-3d bg-green-600/80 hover:bg-green-700/80 text-white'
                  : 'btn-3d bg-red-600/80 hover:bg-red-700/80 text-white'
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
          <div className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-3">
            <span className="text-white/80">تشغيل/إيقاف</span>
            <button
              onClick={toggle}
              disabled={!userInteracted || isMuted}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm ${
                !userInteracted || isMuted
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30'
                  : isPlaying
                  ? 'btn-3d bg-red-600/80 hover:bg-red-700/80 text-white'
                  : 'btn-3d bg-green-600/80 hover:bg-green-700/80 text-white'
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
          <div className="card-3d bg-black/40 border-white/10 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80">مستوى الصوت</span>
              <span className="text-sm text-green-400 font-bold">{Math.round(volume * 100)}%</span>
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
                className={`w-full h-3 bg-hitman-700 rounded-lg appearance-none cursor-pointer slider ${
                  !userInteracted || isMuted ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{
                  background: `linear-gradient(to right, #16a34a 0%, #16a34a ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Info Messages */}
          {!userInteracted && (
            <div className="card-3d bg-blue-950/40 border-blue-500/30 p-3">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                انقر على أي مكان في الصفحة لتفعيل الموسيقى الخلفية
              </p>
            </div>
          )}

          {isMuted && userInteracted && (
            <div className="card-3d bg-yellow-950/40 border-yellow-500/30 p-3">
              <p className="text-sm text-yellow-300 flex items-center gap-2">
                <VolumeX className="w-4 h-4" />
                الموسيقى مكتومة. انقر على "إلغاء الكتم" لتشغيلها مرة أخرى
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-4">
      <div className="card-3d p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center text-blue-400">
          <User className="w-5 h-5 ml-2" />
          إعدادات الحساب
        </h3>
        
        <div className="space-y-4">
          {/* Account Status */}
          <div className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-3">
            <span className="text-white/80">نوع الحساب</span>
            <div className="flex items-center gap-2">
              {isGuest() ? (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-bold">حساب ضيف</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400 font-bold">حساب عادي</span>
                </>
              )}
            </div>
          </div>

          {/* Guest Account Options */}
          {isGuest() && (
            <div className="card-3d bg-yellow-950/40 border-yellow-500/30 p-4">
              <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                تحويل حساب الضيف
              </h4>
              <p className="text-sm text-yellow-200 mb-4">
                يمكنك تحويل حساب الضيف إلى حساب عادي لحفظ تقدمك بشكل دائم
              </p>
              
              <div className="space-y-3">
                {/* Google Account Link */}
                <button
                  onClick={handleGoogleLink}
                  disabled={loading}
                  className="w-full btn-3d bg-blue-600/80 hover:bg-blue-700/80 text-white py-3 flex items-center justify-center gap-2 disabled:opacity-50"
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
                  className="w-full btn-3d bg-green-600/80 hover:bg-green-700/80 text-white py-3 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>إنشاء حساب بالبريد الإلكتروني</span>
                </button>
              </div>
            </div>
          )}

          {/* Regular Account Info */}
          {!isGuest() && (
            <div className="card-3d bg-green-950/40 border-green-500/30 p-4">
              <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                حساب عادي
              </h4>
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
    <div className="space-y-4">
      <div className="card-3d p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center text-purple-400">
          <Shield className="w-5 h-5 ml-2" />
          إعدادات الخصوصية
        </h3>
        <div className="card-3d bg-black/40 border-white/10 p-4 text-center">
          <Lock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-white/70">سيتم إضافة إعدادات الخصوصية هنا قريباً</p>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <div className="card-3d p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center text-orange-400">
          <Bell className="w-5 h-5 ml-2" />
          إعدادات الإشعارات
        </h3>
        
        <div className="space-y-4">
          {/* Notification Sound Status */}
          <div className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-3">
            <span className="text-white/80">صوت الإشعارات</span>
            <div className="flex items-center gap-2">
              {notificationMuted ? (
                <VolumeX className="w-5 h-5 text-gray-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-orange-400" />
              )}
              <span className="text-sm text-white/70">
                {notificationMuted ? 'مكتوم' : 'مفعل'}
              </span>
            </div>
          </div>

          {/* Mute/Unmute Button */}
          <div className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-3">
            <span className="text-white/80">إيقاف/تشغيل الصوت</span>
            <button
              onClick={toggleNotificationMute}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm ${
                notificationMuted
                  ? 'btn-3d bg-green-600/80 hover:bg-green-700/80 text-white'
                  : 'btn-3d bg-red-600/80 hover:bg-red-700/80 text-white'
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
            <div className="card-3d bg-black/40 border-white/10 p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80">مستوى صوت الإشعارات</span>
                <span className="text-sm text-orange-400 font-bold">{Math.round(notificationVolume * 100)}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={notificationVolume}
                  onChange={(e) => setNotificationVolume(parseFloat(e.target.value))}
                  className="w-full h-3 bg-hitman-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${notificationVolume * 100}%, #374151 ${notificationVolume * 100}%, #374151 100%)`
                  }}
                />
              </div>
            </div>
          )}

          {/* Test Notification Button */}
          <div className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-3">
            <span className="text-white/80">اختبار الصوت</span>
            <button
              onClick={playNotification}
              disabled={notificationMuted}
              className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm ${
                notificationMuted
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30'
                  : 'btn-3d bg-blue-600/80 hover:bg-blue-700/80 text-white'
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
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%236b7280\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"8\"/%3E%3Cpath d=\"M10 10h10v10H10z\"/%3E%3Cpath d=\"M40 10h10v10H40z\"/%3E%3Cpath d=\"M10 40h10v10H10z\"/%3E%3Cpath d=\"M40 40h10v10H40z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الإعدادات</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Settings</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Sliders className="w-4 h-4 text-gray-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                  <Power className="w-4 h-4 text-gray-400" />
                  {tabs.length}
                </div>
                <div className="text-xs text-white/80 drop-shadow">قسم</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                  activeTab === tab.id
                    ? 'btn-3d bg-blood-600/80 text-white border-blood-500/50'
                    : 'card-3d bg-black/40 text-white/70 hover:bg-blood-500/20 border-white/20'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-gradient-to-b from-black/40 to-hitman-950/40">
          {renderTabContent()}
        </div>

        {/* Email Registration Modal */}
        {accountModal.isOpen && accountModal.type === 'email' && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card-3d bg-black/90 border-blood-500/50 p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                إنشاء حساب جديد
              </h3>
              
              <form onSubmit={handleEmailRegistration} className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2 text-sm">اسم المستخدم</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="input-3d w-full"
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-3d w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">كلمة المرور</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-3d w-full"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="input-3d w-full"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="card-3d bg-red-950/40 border-red-500/50 p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-3d py-2 disabled:opacity-50"
                  >
                    {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountModal({ isOpen: false, type: '' })}
                    className="btn-3d-secondary py-2 px-4"
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card-3d bg-black/90 border-blood-500/50 p-6 max-w-md w-full">
              <h3 className={`text-xl font-semibold mb-4 ${
                accountModal.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {accountModal.title}
              </h3>
              <p className="text-white/80 mb-4">{accountModal.message}</p>
              <button
                onClick={() => setAccountModal({ isOpen: false, type: '' })}
                className="w-full btn-3d py-2"
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
