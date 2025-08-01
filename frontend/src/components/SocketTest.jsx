import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

export const SocketTest = () => {
  const { 
    socket, 
    isConnected, 
    connectionAttempts, 
    userId,
    requestHud,
    socketRequest 
  } = useSocket();
  
  const [testResult, setTestResult] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (isConnected && socket) {
      // Test basic socket communication
      socket.emit('test', { message: 'Hello from frontend' });
      
      socket.on('test_response', (data) => {
        setTestResult(data);
        setLastUpdate(new Date().toLocaleTimeString());
      });

      // Request initial data
      requestHud();
    }
  }, [isConnected, socket, requestHud]);

  const handleTestRequest = async () => {
    try {
      const result = await socketRequest('test', { message: 'Test request' });
      setTestResult(result);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      setTestResult({ error: error.message });
      setLastUpdate(new Date().toLocaleTimeString());
    }
  };

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-900/80 border border-red-600/50 rounded-lg p-3">
        <div className="text-red-400 text-xs">
          Socket.IO: Disconnected (Attempts: {connectionAttempts})
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-green-900/80 border border-green-600/50 rounded-lg p-3 max-w-xs">
      <div className="text-green-400 text-xs mb-2">
        Socket.IO: Connected ✅
      </div>
      <div className="text-white/70 text-xs mb-2">
        User ID: {userId || 'Not set'}
      </div>
      <button 
        onClick={handleTestRequest}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded mb-2"
      >
        Test Socket
      </button>
      {testResult && (
        <div className="text-xs text-white/70">
          <div>Last Test: {lastUpdate}</div>
          <div>Result: {JSON.stringify(testResult).slice(0, 50)}...</div>
        </div>
      )}
    </div>
  );
};

export default SocketTest; 