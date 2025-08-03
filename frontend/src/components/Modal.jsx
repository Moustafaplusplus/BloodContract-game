import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'حسناً', 
  onConfirm,
  showCancel = false,
  cancelText = 'إلغاء',
  children,
  inputType,
  inputPlaceholder,
  inputValue,
  onInputChange,
  extraButton
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-blood-400 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-400 animate-pulse" />;
      case 'loading':
        return <Loader className="w-12 h-12 text-blood-400 animate-spin" />;
      default:
        return <Info className="w-12 h-12 text-blood-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/50';
      case 'error':
        return 'border-blood-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'loading':
        return 'border-blood-500/50';
      default:
        return 'border-blood-500/50';
    }
  };

  const getBackgroundGradient = () => {
    switch (type) {
      case 'success':
        return 'from-green-950/40 to-emerald-950/20';
      case 'error':
        return 'from-blood-950/40 to-black/60';
      case 'warning':
        return 'from-yellow-950/40 to-amber-950/20';
      case 'loading':
        return 'from-blood-950/40 to-black/60';
      default:
        return 'from-blood-950/40 to-black/60';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800';
      case 'error':
        return 'bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800';
      case 'loading':
        return 'bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800';
      default:
        return 'bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-blood-400';
      case 'warning':
        return 'text-yellow-400';
      case 'loading':
        return 'text-blood-400';
      default:
        return 'text-blood-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={type !== 'loading' ? onClose : undefined}
      />
      
      {/* Enhanced Modal */}
      <div className={`card-3d relative bg-gradient-to-br ${getBackgroundGradient()} border-2 ${getBorderColor()} max-w-md w-full mx-auto p-8 text-white animate-fade-in`}>
        {/* Enhanced Close button */}
        {type !== 'loading' && (
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Enhanced Content */}
        <div className="text-center">
          {/* Enhanced Icon with Background */}
          <div className="mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-gradient-to-br ${getBackgroundGradient()} border ${getBorderColor()}`}>
              {getIcon()}
            </div>
          </div>

          {/* Enhanced Title */}
          <h2 className={`text-2xl font-bold mb-4 ${getTitleColor()}`}>
            {title}
          </h2>

          {/* Enhanced Divider */}
          <div className={`w-24 h-1 bg-gradient-to-r from-transparent via-current to-transparent mx-auto mb-6 ${getTitleColor()}`} />

          {/* Enhanced Message */}
          <div className="text-white/90 text-base leading-relaxed mb-6 whitespace-pre-line">
            {message}
          </div>

          {/* Enhanced Input field */}
          {inputType && (
            <div className="mb-6">
              <input
                type={inputType}
                placeholder={inputPlaceholder}
                value={inputValue || ''}
                onChange={(e) => onInputChange && onInputChange(e.target.value)}
                className="input-3d w-full text-center"
                autoFocus
                disabled={type === 'loading'}
              />
            </div>
          )}

          {/* Custom children */}
          {children}

          {/* Enhanced Buttons */}
          {type !== 'loading' && (
            <div className="flex gap-3 justify-center">
              {showCancel && (
                <button
                  onClick={onClose}
                  className="btn-3d-secondary px-6 py-3 font-bold hover:scale-105 transition-transform duration-200"
                >
                  {cancelText}
                </button>
              )}
              {extraButton && (
                <button
                  onClick={() => {
                    if (extraButton.action) {
                      extraButton.action();
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 border border-purple-500/50"
                >
                  {extraButton.text}
                </button>
              )}
              <button
                onClick={() => {
                  if (onConfirm) {
                    if (inputType && inputValue) {
                      onConfirm(inputValue);
                    } else if (!inputType) {
                      onConfirm();
                    }
                  }
                  if (!inputType || inputValue) {
                    onClose();
                  }
                }}
                className={`btn-3d px-6 py-3 font-bold rounded-lg transition-all duration-200 transform hover:scale-105 border border-current/50`}
              >
                {confirmText}
              </button>
            </div>
          )}

          {/* Loading state indicator */}
          {type === 'loading' && (
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <div className="loading-shimmer w-4 h-4 rounded-full"></div>
              <span>يرجى الانتظار...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
