import React from 'react';
import { LogOut, Shield } from 'lucide-react';

export default function AdminReturnButton() {
  const adminLoggedAsUser = localStorage.getItem('adminLoggedAsUser');
  const adminOriginalToken = localStorage.getItem('adminOriginalToken');

  if (!adminLoggedAsUser || !adminOriginalToken) {
    return null;
  }

  const handleReturnToAdmin = () => {
    // Restore the original admin token
    // Firebase token is automatically handled by axios interceptor
    
    // Clear the temporary storage
    localStorage.removeItem('adminOriginalToken');
    localStorage.removeItem('adminLoggedAsUser');
    
    // Reload the page to switch back to admin context
    window.location.reload();
  };

  const userInfo = JSON.parse(adminLoggedAsUser);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 border border-purple-500 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-white" />
          <div className="text-white text-sm">
            <div className="font-medium">تسجيل دخول كـ</div>
            <div className="text-purple-200">{userInfo.username}</div>
          </div>
          <button
            onClick={handleReturnToAdmin}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
            title="العودة إلى حساب الإدارة"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 