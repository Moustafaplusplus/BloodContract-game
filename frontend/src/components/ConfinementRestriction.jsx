import { useNavigate } from 'react-router-dom';
import { useConfinement } from '@/hooks/useConfinement';
import { AlertTriangle, Clock, Heart, Lock, ArrowRight } from 'lucide-react';
import MoneyIcon from './MoneyIcon';

export default function ConfinementRestriction({ 
  showDetails = true, 
  className = "",
  onClose = null 
}) {
  const navigate = useNavigate();
  const { getConfinementMessage, formatTime } = useConfinement();
  
  const confinementMessage = getConfinementMessage();
  
  if (!confinementMessage) return null;

  const handleNavigate = () => {
    if (confinementMessage.type === 'hospital') {
      navigate('/hospital');
    } else if (confinementMessage.type === 'jail') {
      navigate('/jail');
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className={`card-3d bg-gradient-to-br from-blood-950/90 to-black/80 border-blood-500/50 p-6 backdrop-blur-sm ${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {confinementMessage.type === 'hospital' ? (
            <Heart className="w-8 h-8 text-blood-400 animate-pulse" />
          ) : (
            <Lock className="w-8 h-8 text-blood-400 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-blood-400">
              {confinementMessage.title}
            </h3>
            {onClose && (
              <button
                onClick={handleClose}
                className="text-white/40 hover:text-white transition-colors"
              >
                ×
              </button>
            )}
          </div>

          <p className="text-white/70 mb-4">
            {confinementMessage.message}
          </p>

          {showDetails && (
            <div className="space-y-3">
              {/* Timer */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blood-400" />
                <span className="text-white/70">الوقت المتبقي:</span>
                <span className="font-mono text-blood-400 font-bold">
                  {formatTime(confinementMessage.remainingSeconds)}
                </span>
              </div>

              {/* Cost */}
              <div className="flex items-center gap-2 text-sm">
                <MoneyIcon className="w-4 h-4" />
                <span className="text-white/70">تكلفة الخروج السريع:</span>
                <span className="font-bold text-green-400">
                  {confinementMessage.cost?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleNavigate}
            className="btn-3d mt-4 w-full py-2 px-4 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            {confinementMessage.type === 'hospital' ? 'الذهاب إلى المستشفى' : 'الذهاب إلى السجن'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
