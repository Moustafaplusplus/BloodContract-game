// src/components/JailDialog.jsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

export default function JailDialog() {
  const { socket } = useSocket();
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(0);

  // Listen for jail enter/leave events
  useEffect(() => {
    if (!socket) return;
    const handleEnter = ({ releaseAt }) => {
      const releaseTime = new Date(releaseAt).getTime();
      setRemaining(Math.max(0, Math.floor((releaseTime - Date.now()) / 1000)));
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    socket.on('jail:enter', handleEnter);
    socket.on('jail:leave', handleLeave);
    return () => {
      socket.off('jail:enter', handleEnter);
      socket.off('jail:leave', handleLeave);
    };
  }, [socket]);

  // Countdown timer
  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  const formatTime = sec => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="card p-6 max-w-sm text-center space-y-4">
        <div className="text-4xl mb-2">🔒</div>
        <h2 className="text-xl font-bold text-accent-orange">أنت الآن في السجن</h2>
        <p className="text-gray-600 dark:text-gray-400">
          وقت الإفراج: <span className="font-mono text-accent-orange">{formatTime(remaining)}</span>
        </p>
        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-accent-orange to-accent-red h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(0, (remaining / (24 * 3600)) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}