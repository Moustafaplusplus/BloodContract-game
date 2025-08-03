import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import { Skull, Target, DollarSign, Users, Sword, Shield, Clock, ImageIcon } from 'lucide-react';
import CreateContract from './CreateContract';
import ContractsList from './ContractsList';
import AttackResultModal from './AttackResultModal';
import GhostAssassinForm from './GhostAssassinForm';

const BloodContracts = ({ currentUserId }) => {
  const { 
    socket, 
    bloodContracts, 
    requestBloodContracts 
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
      requestBloodContracts();
    }
  }, [socket, requestBloodContracts]);

  // Manual test function
  const testRequest = () => {
    if (socket && socket.connected) {
      requestBloodContracts();
    }
  };

  // Listen for real-time fight results
  useEffect(() => {
    if (!socket) return;

    const handleFightResult = (data) => {
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
    const token = null;
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
          requestBloodContracts();
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
  }, [socket, requestBloodContracts]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setFightResult(null);
  };

  const handleContractCreated = useCallback(() => {
    // Request fresh blood contract data
    if (socket && socket.connected) {
      requestBloodContracts();
    }
    setRefreshKey(k => k + 1);
  }, [socket, requestBloodContracts]);

  const handleGhostAssassinSuccess = useCallback(() => {
    // Request fresh blood contract data
    if (socket && socket.connected) {
      requestBloodContracts();
    }
    setRefreshKey(k => k + 1);
  }, [socket, requestBloodContracts]);

  const contractCount = bloodContracts?.length || 0;
  const activeContracts = bloodContracts?.filter(c => new Date(c.expiresAt) > new Date()).length || 0;

  return (
    <div className="min-h-screen p-2 sm:p-4 space-y-4">
      {/* Blood Contracts Header Banner with Background Image */}
      <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-gray-900 to-black">
          <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.15\"%3E%3Cpolygon points=\"25,5 30,20 45,20 35,30 40,45 25,35 10,45 15,30 5,20 20,20\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"}></div>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">عقود الدم</h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">Blood Contracts</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <Target className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{activeContracts}</div>
              <div className="text-xs text-white/80 drop-shadow">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-black/80 border border-blood-500/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-blood-400" />
            <span className="text-xs text-blood-300">Total</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white">{contractCount}</div>
        </div>

        <div className="bg-black/80 border border-blood-500/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-blood-400" />
            <span className="text-xs text-blood-300">Active</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white">{activeContracts}</div>
        </div>

        <div className="bg-black/80 border border-blood-500/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Sword className="w-4 h-4 text-blood-400" />
            <span className="text-xs text-blood-300">Attacks</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white">-</div>
        </div>

        <div className="bg-black/80 border border-blood-500/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-blood-400" />
            <span className="text-xs text-blood-300">Rewards</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-white">-</div>
        </div>
      </div>

      {/* Content Sections with Enhanced Cards */}
      <div className="space-y-4">
        {/* Test Button */}
        <div className="bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 shadow-xl shadow-blood-900/20">
          <div className="p-3 sm:p-4">
            <button
              onClick={testRequest}
              className="bg-blood-600 hover:bg-blood-700 text-white px-4 py-2 rounded-lg"
            >
              Test Request Blood Contracts
            </button>
          </div>
        </div>

        {/* Ghost Assassin Section */}
        <div className="bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 shadow-xl shadow-blood-900/20">
          <div className="p-3 sm:p-4 border-b border-blood-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blood-600 rounded flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-white">Ghost Assassin</h2>
              <div className="flex space-x-1 ml-auto">
                <div className="w-1.5 h-1.5 bg-blood-400 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-blood-500 rounded-full animate-pulse delay-150" />
                <div className="w-1.5 h-1.5 bg-blood-600 rounded-full animate-pulse delay-300" />
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <GhostAssassinForm onSuccess={handleGhostAssassinSuccess} />
          </div>
        </div>

        {/* Create Contract Section */}
        <div className="bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 shadow-xl shadow-blood-900/20">
          <div className="p-3 sm:p-4 border-b border-blood-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blood-600 rounded flex items-center justify-center">
                <Target className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-white">Create Contract</h2>
              <ImageIcon className="w-4 h-4 text-blood-300 ml-auto" />
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <CreateContract currentUserId={currentUserId} onContractCreated={handleContractCreated} />
          </div>
        </div>

        {/* Contracts List Section */}
        <div className="bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 shadow-xl shadow-blood-900/20">
          <div className="p-3 sm:p-4 border-b border-blood-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blood-600 rounded flex items-center justify-center">
                <Skull className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-white">Available Contracts</h2>
              <div className="flex items-center space-x-1 ml-auto">
                <span className="text-xs text-blood-300">{activeContracts} active</span>
                <ImageIcon className="w-4 h-4 text-blood-300" />
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <ContractsList 
              onAttack={handleAttack} 
              key={refreshKey} 
              contracts={bloodContracts}
            />
          </div>
        </div>
      </div>

      {/* Attack Result Modal */}
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
