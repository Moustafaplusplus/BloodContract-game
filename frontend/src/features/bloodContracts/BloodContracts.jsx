import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import CreateContract from './CreateContract';
import ContractsList from './ContractsList';
import AttackResultModal from './AttackResultModal';
import GhostAssassinForm from './GhostAssassinForm';

const BloodContracts = ({ currentUserId }) => {
  const { 
    socket, 
    bloodContracts, 
    requestBloodContractUpdate 
  } = useSocket();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [attackSuccess, setAttackSuccess] = useState(false);
  const [reward, setReward] = useState(0);
  const [posterName, setPosterName] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [fightResult, setFightResult] = useState(null);

  // Request initial blood contract data when component mounts
  useEffect(() => {
    if (socket && socket.connected) {
      requestBloodContractUpdate();
    }
  }, [socket, requestBloodContractUpdate]);

  // Listen for real-time fight results
  useEffect(() => {
    if (!socket) return;

    const handleFightResult = (data) => {
      console.log('[BloodContracts] Fight result received:', data);
      setFightResult(data);
      setModalOpen(true);
    };

    socket.on('fightResult', handleFightResult);

    return () => {
      socket.off('fightResult', handleFightResult);
    };
  }, [socket]);

  const handleAttack = useCallback(async (contract) => {
    setModalMessage('');
    setReward(0);
    setPosterName('');
    setFightResult(null);
    const token = localStorage.getItem('jwt');
    try {
      const res = await fetch(`/api/bloodcontracts/${contract.id}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (data.success) {
        // Fetch reward info
        const rewardRes = await fetch(`/api/bloodcontracts/${contract.id}/reward`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        const rewardData = await rewardRes.json();
        setAttackSuccess(true);
        setReward(rewardData.reward);
        setPosterName(rewardData.poster?.username || '');
        setModalMessage('');
        setFightResult(data.fightResult);
        
        // Request fresh blood contract data
        if (socket && socket.connected) {
          requestBloodContractUpdate();
        }
      } else {
        setAttackSuccess(false);
        if (data.message?.includes('لا يمكن تنفيذ العقد لأن الهدف محمي من الهجمات حالياً')) {
          toast.error('🛡️ لا يمكن تنفيذ العقد لأن الهدف محمي من الهجمات حالياً.');
        } else {
          setModalMessage(data.message || 'فشل الهجوم.');
        }
        setFightResult(data.fightResult);
      }
    } catch (error) {
      setAttackSuccess(false);
      setModalMessage('حدث خطأ أثناء الاتصال بالخادم.');
      setFightResult(null);
    }
    setModalOpen(true);
  }, [socket, requestBloodContractUpdate]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setFightResult(null);
  };

  const handleContractCreated = useCallback(() => {
    // Request fresh blood contract data
    if (socket && socket.connected) {
      requestBloodContractUpdate();
    }
    setRefreshKey(k => k + 1);
  }, [socket, requestBloodContractUpdate]);

  const handleGhostAssassinSuccess = useCallback(() => {
    // Request fresh blood contract data
    if (socket && socket.connected) {
      requestBloodContractUpdate();
    }
    setRefreshKey(k => k + 1);
  }, [socket, requestBloodContractUpdate]);

  return (
    <div>
      <GhostAssassinForm onSuccess={handleGhostAssassinSuccess} />
      <CreateContract currentUserId={currentUserId} onContractCreated={handleContractCreated} />
      <ContractsList 
        onAttack={handleAttack} 
        key={refreshKey} 
        contracts={bloodContracts}
      />
      <AttackResultModal
        open={modalOpen}
        onClose={handleCloseModal}
        success={attackSuccess}
        reward={reward}
        posterName={posterName}
        message={modalMessage}
        fightResult={fightResult}
      />
    </div>
  );
};

export default BloodContracts; 