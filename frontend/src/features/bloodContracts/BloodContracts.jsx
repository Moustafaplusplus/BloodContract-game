import React, { useState, useCallback } from 'react';
import CreateContract from './CreateContract';
import ContractsList from './ContractsList';
import AttackResultModal from './AttackResultModal';

const BloodContracts = ({ currentUserId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [attackSuccess, setAttackSuccess] = useState(false);
  const [reward, setReward] = useState(0);
  const [posterName, setPosterName] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [fightResult, setFightResult] = useState(null);

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
        setRefreshKey(k => k + 1);
      } else {
        setAttackSuccess(false);
        setModalMessage(data.message || 'فشل الهجوم.');
        setFightResult(data.fightResult);
      }
    } catch {
      setAttackSuccess(false);
      setModalMessage('حدث خطأ أثناء الاتصال بالخادم.');
      setFightResult(null);
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setFightResult(null);
  };

  return (
    <div>
      <CreateContract currentUserId={currentUserId} onContractCreated={() => setRefreshKey(k => k + 1)} />
      <ContractsList onAttack={handleAttack} key={refreshKey} />
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