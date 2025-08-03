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
      <div className={`min-h-screen blood-gradient text-white ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center card-3d p-8">
            <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-4"></div>
            <p className="text-white/70">جاري التحقق من حالة الاحتجاز...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConfined()) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen blood-gradient text-white ${className}`}>
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
