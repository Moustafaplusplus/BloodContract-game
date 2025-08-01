import React from 'react';
import { useSocket } from '@/hooks/useSocket';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

export const ConnectionStatus = () => {
  const { isConnected, connectionAttempts } = useSocket();

  if (isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-green-900/80 border border-green-600/50 rounded-lg px-3 py-2">
          <FaWifi className="text-green-400 text-sm" />
          <span className="text-green-400 text-xs">متصل</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-red-900/80 border border-red-600/50 rounded-lg px-3 py-2">
        <FaExclamationTriangle className="text-red-400 text-sm" />
        <span className="text-red-400 text-xs">
          {connectionAttempts > 0 ? `إعادة الاتصال... (${connectionAttempts})` : 'غير متصل'}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus; 