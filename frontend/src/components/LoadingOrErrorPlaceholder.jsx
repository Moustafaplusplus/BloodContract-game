import { Target, AlertCircle, Loader, RefreshCw } from 'lucide-react';

export default function LoadingOrErrorPlaceholder({ 
  loading, 
  error, 
  loadingText = 'جاري التحميل...', 
  errorText = 'فشل التحميل', 
  children,
  onRetry 
}) {
  if (loading) {
    return (
      <div className="min-h-screen blood-gradient flex items-center justify-center p-4">
        <div className="text-center card-3d p-8 max-w-md">
          {/* Enhanced Loading Animation */}
          <div className="relative mb-6">
            <div className="loading-shimmer w-16 h-16 rounded-full mx-auto"></div>
            <Target className="w-8 h-8 text-blood-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          
          <h2 className="text-xl font-bold text-blood-400 mb-2">{loadingText}</h2>
          
          {/* Loading Progress Indicator */}
          <div className="progress-3d mb-4 h-2">
            <div className="progress-3d-fill bg-gradient-to-r from-blood-600 to-blood-400 animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          <div className="text-sm text-white/60">يرجى الانتظار قليلاً...</div>
          
          {children}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen blood-gradient flex items-center justify-center p-4">
        <div className="text-center card-3d p-8 max-w-md bg-gradient-to-br from-blood-950/40 to-black/60 border-blood-500/50">
          {/* Enhanced Error Icon */}
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blood-500/20 rounded-full flex items-center justify-center mx-auto border border-blood-500/40">
              <AlertCircle className="w-8 h-8 text-blood-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-blood-400 mb-2">خطأ في التحميل</h2>
          <p className="text-white/70 mb-6">{errorText || error}</p>
          
          {/* Enhanced Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-3d px-6 py-3 flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-transform duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          )}
          
          {children}
        </div>
      </div>
    );
  }

  return null;
}
