import { useState } from "react";
import { UserCheck, X, AlertTriangle } from "lucide-react";
import GuestSyncModal from "./GuestSyncModal";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export default function GuestSyncNotification() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isGuest, customToken } = useFirebaseAuth();

  // Don't show if user is not a guest or if dismissed
  if (!isGuest || dismissed) {
    return null;
  }

  const handleSyncSuccess = (newToken) => {
    setToken(newToken);
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-600/50 rounded-xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 space-x-reverse">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">
                حساب ضيف
              </h3>
              <p className="text-yellow-200 text-sm mb-4">
                أنت تلعب بحساب ضيف. قم بإنشاء حساب دائم لحفظ تقدمك في اللعبة
              </p>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <UserCheck className="w-4 h-4 ml-2" />
                  ربط الحساب
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-yellow-300 hover:text-yellow-100 text-sm transition-colors duration-200 px-3 py-2"
                >
                  لاحقاً
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-400 hover:text-yellow-200 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <GuestSyncModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSyncSuccess}
      />
    </>
  );
} 