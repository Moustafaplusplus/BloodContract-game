import React, { useState, useEffect } from 'react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';
import { Target, Clock, Star, TrendingUp, DollarSign, Sword, Shield, User, ImageIcon } from 'lucide-react';

function getRemainingTime(expiry) {
  const now = new Date();
  const end = new Date(expiry);
  const diff = end - now;
  if (diff <= 0) return 'انتهى';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getStatusInfo(contract) {
  if (contract.isPoster) return { text: 'صاحب العقد', color: 'blue', icon: User };
  if (contract.isTarget) return { text: 'هدف العقد', color: 'red', icon: Target };
  return { text: 'متاح', color: 'green', icon: Sword };
}

function getTimeStatus(expiry) {
  const now = new Date();
  const end = new Date(expiry);
  const diff = end - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (diff <= 0) return 'expired';
  if (hours <= 1) return 'urgent';
  if (hours <= 6) return 'warning';
  return 'normal';
}

const ContractCard = ({ contract, onAttack, tick }) => {
  const statusInfo = getStatusInfo(contract);
  const timeStatus = getTimeStatus(contract.expiresAt);
  const remainingTime = getRemainingTime(contract.expiresAt);
  
  const timeColors = {
    expired: 'text-gray-400',
    urgent: 'text-red-400',
    warning: 'text-yellow-400',
    normal: 'text-green-400'
  };

  return (
    <div className="bg-black/60 border border-blood-500/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm hover:border-blood-500/40 transition-all duration-300">
      {/* Contract Header with Target Banner */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-blood-500 to-blood-700 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white truncate">
              <VipName user={contract.target} />
            </div>
            <div className="text-xs text-blood-300">Target Player</div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${
          statusInfo.color === 'blue' ? 'bg-blue-900/30 border-blue-500/30 text-blue-300' :
          statusInfo.color === 'red' ? 'bg-red-900/30 border-red-500/30 text-red-300' :
          'bg-green-900/30 border-green-500/30 text-green-300'
        }`}>
          <statusInfo.icon className="w-3 h-3" />
          <span className="hidden sm:inline">{statusInfo.text}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-blood-900/20 border border-blood-500/10 rounded p-2">
          <div className="flex items-center space-x-1 mb-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-blood-300">Fame</span>
          </div>
          <div className="text-sm font-bold text-white">{contract.target?.fame || 0}</div>
        </div>

        <div className="bg-blood-900/20 border border-blood-500/10 rounded p-2">
          <div className="flex items-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blood-300">Level</span>
          </div>
          <div className="text-sm font-bold text-white">{contract.target?.level || 1}</div>
        </div>

        <div className="bg-blood-900/20 border border-blood-500/10 rounded p-2">
          <div className="flex items-center space-x-1 mb-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-xs text-blood-300">Price</span>
          </div>
          <div className="text-sm font-bold text-white">${contract.price}</div>
        </div>

        <div className="bg-blood-900/20 border border-blood-500/10 rounded p-2">
          <div className="flex items-center space-x-1 mb-1">
            <Clock className="w-3 h-3 text-blood-400" />
            <span className="text-xs text-blood-300">Time</span>
          </div>
          <div className={`text-sm font-bold ${timeColors[timeStatus]}`}>
            {remainingTime}
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-4 h-4 text-blood-300" />
          <span className="text-xs text-blood-400">Contract #{contract.id}</span>
        </div>
        
        {contract.canFulfill && (
          <button
            onClick={() => onAttack(contract)}
            className="bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blood-500/30 flex items-center space-x-2 text-sm"
          >
            <Sword className="w-4 h-4" />
            <span>هجوم</span>
          </button>
        )}
      </div>
    </div>
  );
};

const ContractsList = ({ onAttack, contracts = [] }) => {
  const [tick, setTick] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('[ContractsList] Received contracts:', {
      contracts,
      contractsLength: contracts?.length,
      contractsData: contracts
    });
  }, [contracts]);

  // Timer to update countdown every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (contracts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blood-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blood-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Contracts Available</h3>
        <p className="text-blood-300 text-sm">لا توجد عقود متاحة حالياً</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blood-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-blood-500 rounded-full animate-pulse delay-150" />
          <div className="w-2 h-2 bg-blood-600 rounded-full animate-pulse delay-300" />
        </div>
      </div>
    );
  }

  // Filter and sort contracts
  const activeContracts = contracts.filter(c => new Date(c.expiresAt) > new Date());
  const expiredContracts = contracts.filter(c => new Date(c.expiresAt) <= new Date());
  
  return (
    <div className="space-y-4">
      {/* Active Contracts */}
      {activeContracts.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Sword className="w-4 h-4 text-blood-400" />
            <h3 className="text-sm font-semibold text-white">Active Contracts</h3>
            <span className="text-xs text-blood-300">({activeContracts.length})</span>
            <div className="flex space-x-1 ml-auto">
              <ImageIcon className="w-3 h-3 text-blood-400" />
              <div className="w-1 h-1 bg-blood-400 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid gap-3">
            {activeContracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onAttack={onAttack}
                tick={tick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expired Contracts */}
      {expiredContracts.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-400">Expired Contracts</h3>
            <span className="text-xs text-gray-500">({expiredContracts.length})</span>
          </div>
          <div className="grid gap-3 opacity-50">
            {expiredContracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onAttack={onAttack}
                tick={tick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsList;
