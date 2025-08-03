import { Link } from "react-router-dom";
import { User, AlertTriangle, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen blood-gradient flex flex-col items-center justify-center p-4">
      <div className="text-center card-3d p-8 max-w-md w-full">
        {/* Enhanced Error Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-blood-500/20 rounded-full flex items-center justify-center mx-auto border border-blood-500/40">
            <User className="w-12 h-12 text-blood-400 animate-pulse" />
          </div>
        </div>
        
        {/* Error Code */}
        <h1 className="text-5xl font-bouya text-transparent bg-clip-text bg-gradient-to-r from-blood-400 via-blood-300 to-blood-400 animate-glow-blood mb-4">
          لا يوجد
        </h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-bold text-blood-400 mb-2">الملف الشخصي غير موجود</h2>
        <p className="text-white/70 mb-6">
          عذراً، الملف الشخصي الذي تبحث عنه غير متوفر أو تم حذفه.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/dashboard/profile/search"
            className="btn-3d w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-bold hover:scale-105 transition-transform duration-300"
          >
            <Search className="w-5 h-5" />
            البحث عن لاعب آخر
          </Link>
          
          <Link
            to="/dashboard"
            className="btn-3d-secondary w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-bold hover:scale-105 transition-transform duration-300"
          >
            العودة للرئيسية
          </Link>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-blood-500/30">
          <p className="text-white/50 text-sm">
            تأكد من صحة اسم المستخدم أو رقم الهوية
          </p>
        </div>
      </div>
    </div>
  );
}
