import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import axios from 'axios';

export function useConfinement() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [hospitalStatus, setHospitalStatus] = useState(null);
  const [jailStatus, setJailStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch confinement status
  const fetchConfinementStatus = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [hospitalRes, jailRes] = await Promise.all([
        axios.get('/api/confinement/hospital'),
        axios.get('/api/confinement/jail')
      ]);
      
      setHospitalStatus(hospitalRes.data);
      setJailStatus(jailRes.data);
    } catch (error) {
      console.error('Failed to fetch confinement status:', error);
      setError(error.message);
      // Set default values if fetch fails
      setHospitalStatus({ inHospital: false });
      setJailStatus({ inJail: false });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is in any confinement
  const isConfined = () => {
    return (hospitalStatus?.inHospital || jailStatus?.inJail) ?? false;
  };

  // Check if user is in hospital
  const isInHospital = () => {
    return hospitalStatus?.inHospital ?? false;
  };

  // Check if user is in jail
  const isInJail = () => {
    return jailStatus?.inJail ?? false;
  };

  // Get confinement type
  const getConfinementType = () => {
    if (hospitalStatus?.inHospital) return 'hospital';
    if (jailStatus?.inJail) return 'jail';
    return null;
  };

  // Get confinement message
  const getConfinementMessage = () => {
    if (hospitalStatus?.inHospital) {
      return {
        title: 'أنت في المستشفى',
        message: 'لا يمكن الوصول لهذه الميزة أثناء وجودك في المستشفى',
        type: 'hospital',
        remainingSeconds: hospitalStatus.remainingSeconds,
        cost: hospitalStatus.cost
      };
    }
    
    if (jailStatus?.inJail) {
      return {
        title: 'أنت في السجن',
        message: 'لا يمكن الوصول لهذه الميزة أثناء وجودك في السجن',
        type: 'jail',
        remainingSeconds: jailStatus.remainingSeconds,
        cost: jailStatus.cost
      };
    }
    
    return null;
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Handle API errors that indicate confinement
  const handleConfinementError = (error) => {
    if (error.response?.status === 403) {
      const data = error.response.data;
      if (data.type === 'hospital' || data.type === 'jail') {
        return {
          isConfinementError: true,
          type: data.type,
          message: data.message,
          remainingSeconds: data.remainingSeconds,
          cost: data.cost
        };
      }
    }
    return { isConfinementError: false };
  };

  // Initial fetch
  useEffect(() => {
    fetchConfinementStatus();
  }, [token]);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleHospitalUpdate = () => {
      fetchConfinementStatus();
    };

    const handleJailUpdate = () => {
      fetchConfinementStatus();
    };

    socket.on('hospital:enter', handleHospitalUpdate);
    socket.on('hospital:leave', handleHospitalUpdate);
    socket.on('jail:enter', handleJailUpdate);
    socket.on('jail:leave', handleJailUpdate);

    return () => {
      socket.off('hospital:enter', handleHospitalUpdate);
      socket.off('hospital:leave', handleHospitalUpdate);
      socket.off('jail:enter', handleJailUpdate);
      socket.off('jail:leave', handleJailUpdate);
    };
  }, [socket]);

  return {
    hospitalStatus,
    jailStatus,
    loading,
    error,
    isConfined,
    isInHospital,
    isInJail,
    getConfinementType,
    getConfinementMessage,
    formatTime,
    handleConfinementError,
    fetchConfinementStatus
  };
} 