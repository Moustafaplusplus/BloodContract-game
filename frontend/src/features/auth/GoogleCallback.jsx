import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBackgroundMusicContext } from '@/contexts/BackgroundMusicContext';
import { Target } from 'lucide-react';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();
  const { play } = useBackgroundMusicContext();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    
    if (token) {
      // Store the token
      setToken(token);
      
      // Background music will start after user interaction
      
      // Redirect based on whether user is new or existing
      if (isNewUser) {
        console.log('🆕 New user from Google OAuth, redirecting to intro');
        navigate('/intro');
      } else {
        console.log('👤 Existing user from Google OAuth, redirecting to dashboard');
        navigate('/dashboard');
      }
    } else {
      // No token received, redirect to login
      console.log('❌ No token received from Google OAuth');
      navigate('/login');
    }
  }, [searchParams, setToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="text-center">
        <div className="relative">
          <div className="loading-spinner"></div>
          <Target className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-white mt-6 text-lg font-medium">
          جاري إكمال تسجيل الدخول…
        </p>
      </div>
    </div>
  );
} 