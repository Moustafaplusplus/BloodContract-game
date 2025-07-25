import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Target } from 'lucide-react';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token and redirect to dashboard
      setToken(token);
      navigate('/dashboard');
    } else {
      // No token received, redirect to login
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