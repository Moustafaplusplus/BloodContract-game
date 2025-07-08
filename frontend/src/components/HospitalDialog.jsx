// src/components/HospitalDialog.jsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

export default function HospitalDialog() {
  const { socket } = useSocket();
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handleEnter = ({ releaseAt }) => {
      const releaseTime = new Date(releaseAt).getTime();
      setRemaining(Math.max(0, Math.floor((releaseTime - Date.now()) / 1000)));
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    socket.on('hospital:enter', handleEnter);
    socket.on('hospital:leave', handleLeave);
    return () => {
      socket.off('hospital:enter', handleEnter);
      socket.off('hospital:leave', handleLeave);
    };
  }, [socket]);

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
    <div dir="rtl" className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-xs text-center space-y-4">
        <h2 className="text-xl font-bold">أنت الآن في المستشفى</h2>
        <p>وقت الخروج: {formatTime(remaining)}</p>
      </div>
    </div>
  );
}
