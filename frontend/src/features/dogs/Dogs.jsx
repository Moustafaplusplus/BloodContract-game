import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const dogService = {
  async getDogs() {
    const response = await fetch('/api/dogs', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dogs');
    }
    return response.json();
  },

  async getMarketDogs() {
    const response = await fetch('/api/dogs/market', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch market dogs');
    }
    return response.json();
  },

  async buyDog(dogId) {
    const response = await fetch(`/api/dogs/buy/${dogId}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy dog');
    }
    return response.json();
  },

  async sellDog(dogId) {
    const response = await fetch(`/api/dogs/sell/${dogId}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sell dog');
    }
    return response.json();
  },

  async equipDog(dogId) {
    const response = await fetch(`/api/dogs/equip/${dogId}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to equip dog');
    }
    return response.json();
  },

  async unequipDog(dogId) {
    const response = await fetch(`/api/dogs/unequip/${dogId}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unequip dog');
    }
    return response.json();
  }
};

const Dogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('owned');

  const { data: ownedDogs = [], isLoading: loadingOwned } = useQuery({
    queryKey: ['dogs'],
    queryFn: dogService.getDogs,
    enabled: !!user
  });

  const { data: marketDogs = [], isLoading: loadingMarket } = useQuery({
    queryKey: ['dogs', 'market'],
    queryFn: dogService.getMarketDogs,
    enabled: !!user && activeTab === 'market'
  });

  const buyDogMutation = useMutation({
    mutationFn: dogService.buyDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['dogs', 'market'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'Dog purchased successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const sellDogMutation = useMutation({
    mutationFn: dogService.sellDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['dogs', 'market'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'Dog sold successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const equipDogMutation = useMutation({
    mutationFn: dogService.equipDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'Dog equipped successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const unequipDogMutation = useMutation({
    mutationFn: dogService.unequipDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'Dog unequipped successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleBuyDog = (dogId) => {
    buyDogMutation.mutate(dogId);
  };

  const handleSellDog = (dogId) => {
    if (window.confirm('Are you sure you want to sell this dog?')) {
      sellDogMutation.mutate(dogId);
    }
  };

  const handleEquipDog = (dogId) => {
    equipDogMutation.mutate(dogId);
  };

  const handleUnequipDog = (dogId) => {
    unequipDogMutation.mutate(dogId);
  };

  const DogCard = ({ dog, type = 'owned' }) => {
    const isLoading = buyDogMutation.isPending || sellDogMutation.isPending || 
                     equipDogMutation.isPending || unequipDogMutation.isPending;

    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border border-blood-600/30 rounded-lg p-3 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blood-500/20">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blood-600 to-blood-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">🐕</span>
              </div>
              <h3 className="text-white font-semibold text-sm">{dog.name}</h3>
            </div>
            {type === 'owned' && dog.is_equipped && (
              <span className="bg-blood-600 text-white text-xs px-2 py-1 rounded-full">
                Equipped
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/30 rounded p-1">
              <span className="text-gray-400">Breed:</span>
              <span className="text-white ml-1">{dog.breed}</span>
            </div>
            <div className="bg-black/30 rounded p-1">
              <span className="text-gray-400">Level:</span>
              <span className="text-white ml-1">{dog.level}</span>
            </div>
            <div className="bg-black/30 rounded p-1">
              <span className="text-gray-400">Attack:</span>
              <span className="text-blood-400 ml-1">+{dog.attack_bonus}</span>
            </div>
            <div className="bg-black/30 rounded p-1">
              <span className="text-gray-400">Defense:</span>
              <span className="text-blue-400 ml-1">+{dog.defense_bonus}</span>
            </div>
          </div>

          {type === 'market' && (
            <div className="bg-black/30 rounded p-1 text-xs">
              <span className="text-gray-400">Price:</span>
              <span className="text-green-400 ml-1">${dog.price?.toLocaleString() || 'N/A'}</span>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {type === 'owned' ? (
              <>
                {dog.is_equipped ? (
                  <button
                    onClick={() => handleUnequipDog(dog.id)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    Unequip
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquipDog(dog.id)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    Equip
                  </button>
                )}
                <button
                  onClick={() => handleSellDog(dog.id)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                >
                  Sell
                </button>
              </>
            ) : (
              <button
                onClick={() => handleBuyDog(dog.id)}
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
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Dogs</h1>
            <p className="text-blood-300 mt-1">Manage your loyal companions</p>
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
            My Dogs ({ownedDogs.length})
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'market'
                ? 'bg-blood-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Dog Market
          </button>
        </div>

        {activeTab === 'owned' ? (
          <div>
            {loadingOwned ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500"></div>
              </div>
            ) : ownedDogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ownedDogs.map((dog) => (
                  <DogCard key={dog.id} dog={dog} type="owned" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🐕</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Dogs Yet</h3>
                <p className="text-gray-400">Visit the Dog Market to find your first companion</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingMarket ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500"></div>
              </div>
            ) : marketDogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketDogs.map((dog) => (
                  <DogCard key={dog.id} dog={dog} type="market" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🐕</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Dogs Available</h3>
                <p className="text-gray-400">Check back later for new companions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dogs;
