import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen blood-gradient flex flex-col items-center justify-center p-4">
      <div className="text-center card-3d p-8 max-w-md w-full">
        {/* Enhanced Error Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-blood-500/20 rounded-full flex items-center justify-center mx-auto border border-blood-500/40">
            <AlertTriangle className="w-12 h-12 text-blood-400 animate-pulse" />
          </div>
        </div>
        
        {/* Error Code */}
        <h1 className="text-6xl font-bouya text-transparent bg-clip-text bg-gradient-to-r from-blood-400 via-blood-300 to-blood-400 animate-glow-blood mb-4">
          404
        </h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-bold text-blood-400 mb-2">الصفحة غير موجودة</h2>
        <p className="text-white/70 mb-8">
          عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها إلى مكان آخر.
        </p>
        
        {/* Back to Home Button */}
        <Link
          to="/dashboard"
          className="btn-3d inline-flex items-center justify-center gap-2 px-6 py-3 font-bold hover:scale-105 transition-transform duration-300"
        >
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </Link>
        
        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-blood-500/30">
          <p className="text-white/50 text-sm">
            إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالدعم الفني
          </p>
        </div>
      </div>
    </div>
  );
}
