import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

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
  children
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      default:
        return <Info className="w-12 h-12 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30';
      case 'error':
        return 'border-red-500/30';
      case 'warning':
        return 'border-yellow-500/30';
      default:
        return 'border-blue-500/30';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-gradient-to-br from-hitman-900 to-black border-2 ${getBorderColor()} rounded-2xl shadow-2xl max-w-md w-full mx-auto p-8 text-white animate-fade-in`}>
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red">
            {title}
          </h2>

          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-6" />

          {/* Message */}
          <p className="text-hitman-300 text-lg leading-relaxed mb-8">
            {message}
          </p>

          {/* Custom children (e.g., price input) */}
          {children}

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-hitman-700 hover:bg-hitman-600 text-white font-bold rounded-lg transition-all duration-200 border border-hitman-600"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-6 py-3 ${getButtonColor()} text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 