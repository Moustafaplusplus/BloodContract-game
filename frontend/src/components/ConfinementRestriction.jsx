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
    <div className={`bg-gradient-to-br from-hitman-800/90 to-hitman-900/90 border border-accent-red/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm ${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {confinementMessage.type === 'hospital' ? (
            <Heart className="w-8 h-8 text-accent-red animate-pulse" />
          ) : (
            <Lock className="w-8 h-8 text-accent-red animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-accent-red">
              {confinementMessage.title}
            </h3>
            {onClose && (
              <button
                onClick={handleClose}
                className="text-hitman-400 hover:text-white transition-colors"
              >
                ×
              </button>
            )}
          </div>

          <p className="text-hitman-300 mb-4">
            {confinementMessage.message}
          </p>

          {showDetails && (
            <div className="space-y-3">
              {/* Timer */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent-red" />
                <span className="text-hitman-300">الوقت المتبقي:</span>
                <span className="font-mono text-accent-red font-bold">
                  {formatTime(confinementMessage.remainingSeconds)}
                </span>
              </div>

              {/* Cost */}
              <div className="flex items-center gap-2 text-sm">
                <MoneyIcon className="w-4 h-4" />
                <span className="text-hitman-300">تكلفة الخروج السريع:</span>
                <span className="font-bold text-accent-green">
                  {confinementMessage.cost?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleNavigate}
            className="mt-4 w-full bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            {confinementMessage.type === 'hospital' ? 'الذهاب إلى المستشفى' : 'الذهاب إلى السجن'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 