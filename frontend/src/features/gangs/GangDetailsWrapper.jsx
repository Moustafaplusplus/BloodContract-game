import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import GangDetails from './GangDetails';
import { toast } from 'react-hot-toast';

export default function GangDetailsWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthed, tokenLoaded } = useAuth();
  const [gang, setGang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Refresh gang data function
  const refreshGangData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`/api/gangs/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setGang(response.data);
    } catch (err) {
      console.error('Failed to load gang data:', err);
      if (err.response?.status === 404) {
        setError('العصابة غير موجودة');
        toast.error('العصابة غير موجودة');
      } else {
        setError('فشل تحميل بيانات العصابة');
        toast.error('فشل تحميل بيانات العصابة');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load gang data when component mounts or gangId changes
  useEffect(() => {
    if (!tokenLoaded) {
      return; // Wait for auth to be loaded
    }

    if (!isAuthed) {
      navigate('/auth/login');
      return;
    }

    if (!id) {
      navigate('/dashboard/gangs');
      return;
    }

    refreshGangData();
  }, [id, isAuthed, tokenLoaded, navigate]);

  // Show loading state
  if (!tokenLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-red mx-auto mb-6"></div>
          <p className="text-white text-lg">جاري تحميل بيانات العصابة...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-900/30 border border-red-600 text-red-400 p-6 rounded-xl mb-6">
            <h2 className="text-xl font-bold mb-2">خطأ في التحميل</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/gangs')}
            className="bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            العودة للعصابات
          </button>
        </div>
      </div>
    );
  }

  // Show gang details when data is loaded
  if (gang) {
    return <GangDetails gang={gang} onRefresh={refreshGangData} />;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-red mx-auto mb-6"></div>
        <p className="text-white text-lg">جاري التحميل...</p>
      </div>
    </div>
  );
} 