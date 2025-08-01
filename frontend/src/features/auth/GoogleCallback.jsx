import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useBackgroundMusicContext } from '@/contexts/BackgroundMusicContext';
import { Target } from 'lucide-react';

export default function GoogleCallback() {
  const { user, loading } = useFirebaseAuth();
  const { play } = useBackgroundMusicContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        navigate('/dashboard');
      } else {
        // No user, redirect to login
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

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