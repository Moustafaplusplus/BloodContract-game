import { Target } from 'lucide-react';

export default function LoadingOrErrorPlaceholder({ loading, error, loadingText = 'جاري التحميل...', errorText = 'فشل التحميل', children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
      <div className="text-center bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-accent-red/30 rounded-xl p-8">
        <Target className="w-16 h-16 text-accent-red mx-auto mb-4" />
        {loading ? (
          <>
            <h2 className="text-xl font-bold text-white mb-2">{loadingText}</h2>
            {children}
          </>
        ) : error ? (
          <>
            <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
            <p className="text-hitman-300">{errorText || error}</p>
          </>
        ) : null}
      </div>
    </div>
  );
} 