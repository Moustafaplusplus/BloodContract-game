import { useConfinement } from '@/hooks/useConfinement';
import ConfinementRestriction from './ConfinementRestriction';

export default function ConfinementWrapper({ 
  children, 
  showRestriction = true,
  restrictionPosition = 'top',
  className = ""
}) {
  const { isConfined, loading } = useConfinement();

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
            <p className="text-hitman-300">جاري التحقق من حالة الاحتجاز...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConfined()) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white ${className}`}>
      {showRestriction && (
        <div className={`p-4 ${restrictionPosition === 'top' ? 'pt-20' : 'pt-4'}`}>
          <ConfinementRestriction />
        </div>
      )}
      
      {restrictionPosition === 'overlay' ? (
        <div className="relative">
          {children}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <ConfinementRestriction />
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
} 