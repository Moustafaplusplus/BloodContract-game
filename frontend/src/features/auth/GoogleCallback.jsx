import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useBackgroundMusicContext } from '@/contexts/BackgroundMusicContext';
import { Target, Chrome, Skull } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center blood-gradient">
      <div className="text-center card-3d p-6">
        <div className="relative mb-4">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto"></div>
          <Chrome className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-white text-sm font-medium animate-pulse">
          جاري إكمال تسجيل الدخول…
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-blood-500/60">
          <Skull className="w-3 h-3" />
          <span className="text-xs">Blood Contract</span>
          <Skull className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
