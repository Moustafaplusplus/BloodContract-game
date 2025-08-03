import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

const houseService = {
  async getHouses() {
    const response = await fetch('/api/houses', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch houses');
    }
    return response.json();
  },

  async getOwnedHouses() {
    const response = await fetch('/api/houses/owned', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch owned houses');
    }
    return response.json();
  },

  async buyHouse(houseId) {
    const response = await fetch('/api/houses/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ houseId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy house');
    }
    return response.json();
  },

  async sellHouse(houseId) {
    const response = await fetch('/api/houses/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ houseId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sell house');
    }
    return response.json();
  },

  async equipHouse(houseId) {
    const response = await fetch('/api/houses/equip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ houseId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to equip house');
    }
    return response.json();
  },

  async unequipHouse() {
    const response = await fetch('/api/houses/unequip', {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unequip house');
    }
    return response.json();
  }
};

const Houses = () => {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('owned');

  const { data: availableHouses = [], isLoading: loadingHouses } = useQuery({
    queryKey: ['houses'],
    queryFn: houseService.getHouses,
    enabled: !!user && activeTab === 'market'
  });

  const { data: ownedHouses = [], isLoading: loadingOwned } = useQuery({
    queryKey: ['owned-houses'],
    queryFn: houseService.getOwnedHouses,
    enabled: !!user
  });

  const { data: character } = useQuery({
    queryKey: ['character'],
    queryFn: async () => {
      const response = await fetch('/api/character', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch character');
      return response.json();
    },
    enabled: !!user
  });

  const buyHouseMutation = useMutation({
    mutationFn: houseService.buyHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'House purchased successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const sellHouseMutation = useMutation({
    mutationFn: houseService.sellHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      const currencyText = data.currency === 'blackcoin' ? 'blackcoins' : 'cash';
      toast.success(`House sold! You received $${data.refund} ${currencyText}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const equipHouseMutation = useMutation({
    mutationFn: houseService.equipHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'House equipped successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const unequipHouseMutation = useMutation({
    mutationFn: houseService.unequipHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'House unequipped successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleBuyHouse = (houseId) => {
    buyHouseMutation.mutate(houseId);
  };

  const handleSellHouse = (houseId) => {
    if (window.confirm('Are you sure you want to sell this house?')) {
      sellHouseMutation.mutate(houseId);
    }
  };

  const handleEquipHouse = (houseId) => {
    equipHouseMutation.mutate(houseId);
  };

  const handleUnequipHouse = () => {
    unequipHouseMutation.mutate();
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legend: 'text-yellow-400'
    };
    return colors[rarity?.toLowerCase()] || colors.common;
  };

  const getRarityStars = (rarity) => {
    const stars = {
      common: '⭐',
      uncommon: '⭐⭐',
      rare: '⭐⭐⭐',
      epic: '⭐⭐⭐⭐',
      legend: '⭐⭐⭐⭐⭐'
    };
    return stars[rarity?.toLowerCase()] || stars.common;
  };

  const isEquipped = (houseId) => character?.equippedHouseId === houseId;

  const HouseCard = ({ house, type = 'owned', isHouseEquipped = false }) => {
    const isLoading = buyHouseMutation.isPending || sellHouseMutation.isPending || 
                     equipHouseMutation.isPending || unequipHouseMutation.isPending;

    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border border-blood-600/30 rounded-lg p-3 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blood-500/20">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blood-600 to-blood-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">🏠</span>
              </div>
              <h3 className="text-white font-semibold text-sm">{house.name}</h3>
            </div>
            <div className="flex items-center space-x-1">
              {isHouseEquipped && (
                <span className="bg-blood-600 text-white text-xs px-2 py-1 rounded-full">
                  Equipped
                </span>
              )}
              <span className={`text-xs ${getRarityColor(house.rarity)}`}>
                {getRarityStars(house.rarity)}
              </span>
            </div>
          </div>

          <div className="w-full h-16 bg-black/30 rounded flex items-center justify-center">
            {house.imageUrl ? (
              <img 
                src={house.imageUrl} 
                alt={house.name}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🏠
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {house.defenseBonus > 0 && (
              <div className="bg-black/30 rounded p-1">
                <span className="text-gray-400">Defense:</span>
                <span className="text-blue-400 ml-1">+{house.defenseBonus}</span>
              </div>
            )}
            {house.hpBonus > 0 && (
              <div className="bg-black/30 rounded p-1">
                <span className="text-gray-400">Health:</span>
                <span className="text-green-400 ml-1">+{house.hpBonus}</span>
              </div>
            )}
          </div>

          {type === 'market' && (
            <div className="bg-black/30 rounded p-1 text-xs">
              <span className="text-gray-400">Price:</span>
              <span className={`ml-1 ${house.currency === 'blackcoin' ? 'text-blood-400' : 'text-green-400'}`}>
                {house.currency === 'blackcoin' ? '⚫' : '$'}{house.cost?.toLocaleString() || 'N/A'}
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {type === 'owned' ? (
              <>
                {isHouseEquipped ? (
                  <button
                    onClick={handleUnequipHouse}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    Unequip
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquipHouse(house.id)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    Equip
                  </button>
                )}
                <button
                  onClick={() => handleSellHouse(house.id)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                >
                  Sell
                </button>
              </>
            ) : (
              <button
                onClick={() => handleBuyHouse(house.id)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
              >
                Buy
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0">
          <svg className="w-full h-full object-cover opacity-20" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circles" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="20" fill="currentColor" className="text-blood-600" opacity="0.3"/>
                <circle cx="75" cy="25" r="15" fill="currentColor" className="text-blood-500" opacity="0.2"/>
                <circle cx="50" cy="75" r="18" fill="currentColor" className="text-blood-700" opacity="0.25"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circles)"/>
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Houses</h1>
            <p className="text-blood-300 mt-1">Manage your property portfolio</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex bg-gray-800/50 backdrop-blur-md rounded-lg p-1 mb-6 border border-blood-600/30">
          <button
            onClick={() => setActiveTab('owned')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'owned'
                ? 'bg-blood-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            My Houses ({ownedHouses.length})
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'market'
                ? 'bg-blood-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Real Estate Market
          </button>
        </div>

        {activeTab === 'owned' ? (
          <div>
            {loadingOwned ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500"></div>
              </div>
            ) : ownedHouses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ownedHouses.map((ownedHouse) => (
                  <HouseCard 
                    key={ownedHouse.id} 
                    house={ownedHouse.House || ownedHouse} 
                    type="owned" 
                    isHouseEquipped={isEquipped(ownedHouse.houseId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Houses Yet</h3>
                <p className="text-gray-400">Visit the Real Estate Market to buy your first property</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingHouses ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500"></div>
              </div>
            ) : availableHouses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableHouses.map((house) => (
                  <HouseCard key={house.id} house={house} type="market" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Houses Available</h3>
                <p className="text-gray-400">Check back later for new properties</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Houses;
