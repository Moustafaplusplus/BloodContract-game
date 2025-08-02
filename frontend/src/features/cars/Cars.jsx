import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const carService = {
  async getCars() {
    const response = await fetch('/api/cars', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }
    return response.json();
  },

  async getOwnedCars() {
    const response = await fetch('/api/cars/user', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch owned cars');
    }
    return response.json();
  },

  async buyCar(carId) {
    const response = await fetch('/api/cars/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ carId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy car');
    }
    return response.json();
  },

  async sellCar(carId) {
    const response = await fetch(`/api/cars/${carId}/sell`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sell car');
    }
    return response.json();
  },

  async activateCar(carId) {
    const response = await fetch(`/api/cars/${carId}/activate`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate car');
    }
    return response.json();
  },

  async deactivateCar() {
    const response = await fetch('/api/cars/deactivate', {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deactivate car');
    }
    return response.json();
  }
};

const Cars = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('owned');

  const { data: availableCars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['cars'],
    queryFn: carService.getCars,
    enabled: !!user && activeTab === 'market'
  });

  const { data: ownedCars = [], isLoading: loadingOwned } = useQuery({
    queryKey: ['owned-cars'],
    queryFn: carService.getOwnedCars,
    enabled: !!user
  });

  const buyCarMutation = useMutation({
    mutationFn: carService.buyCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'Car purchased successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const sellCarMutation = useMutation({
    mutationFn: carService.sellCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      const currencyText = data.currency === 'blackcoin' ? 'blackcoins' : 'cash';
      toast.success(`Car sold! You received $${data.refund} ${currencyText}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const activateCarMutation = useMutation({
    mutationFn: carService.activateCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'Car activated successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deactivateCarMutation = useMutation({
    mutationFn: carService.deactivateCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'Car deactivated successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleBuyCar = (carId) => {
    buyCarMutation.mutate(carId);
  };

  const handleSellCar = (carId) => {
    if (window.confirm('Are you sure you want to sell this car?')) {
      sellCarMutation.mutate(carId);
    }
  };

  const handleActivateCar = (carId) => {
    activateCarMutation.mutate(carId);
  };

  const handleDeactivateCar = () => {
    deactivateCarMutation.mutate();
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

  const CarCard = ({ car, type = 'owned', isActive = false }) => {
    const isLoading = buyCarMutation.isPending || sellCarMutation.isPending || 
                     activateCarMutation.isPending || deactivateCarMutation.isPending;

    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border border-blood-600/30 rounded-lg p-3 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blood-500/20">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blood-600 to-blood-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">🚗</span>
              </div>
              <h3 className="text-white font-semibold text-sm">{car.name}</h3>
            </div>
            <div className="flex items-center space-x-1">
              {isActive && (
                <span className="bg-blood-600 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
              <span className={`text-xs ${getRarityColor(car.rarity)}`}>
                {getRarityStars(car.rarity)}
              </span>
            </div>
          </div>

          <div className="w-full h-16 bg-black/30 rounded flex items-center justify-center">
            {car.imageUrl ? (
              <img 
                src={car.imageUrl} 
                alt={car.name}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🚗
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {car.attackBonus > 0 && (
              <div className="bg-black/30 rounded p-1">
                <span className="text-gray-400">Attack:</span>
                <span className="text-blood-400 ml-1">+{car.attackBonus}</span>
              </div>
            )}
            {car.defenseBonus > 0 && (
              <div className="bg-black/30 rounded p-1">
                <span className="text-gray-400">Defense:</span>
                <span className="text-blue-400 ml-1">+{car.defenseBonus}</span>
              </div>
            )}
          </div>

          {type === 'market' && (
            <div className="bg-black/30 rounded p-1 text-xs">
              <span className="text-gray-400">Price:</span>
              <span className={`ml-1 ${car.currency === 'blackcoin' ? 'text-blood-400' : 'text-green-400'}`}>
                {car.currency === 'blackcoin' ? '⚫' : '$'}{car.cost?.toLocaleString() || 'N/A'}
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {type === 'owned' ? (
              <>
                {isActive ? (
                  <button
                    onClick={handleDeactivateCar}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateCar(car.id)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => handleSellCar(car.id)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white text-xs py-1.5 px-2 rounded transition-all duration-200 disabled:opacity-50"
                >
                  Sell
                </button>
              </>
            ) : (
              <button
                onClick={() => handleBuyCar(car.id)}
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
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Cars</h1>
            <p className="text-blood-300 mt-1">Manage your vehicle collection</p>
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
            My Cars ({ownedCars.length})
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'market'
                ? 'bg-blood-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Car Market
          </button>
        </div>

        {activeTab === 'owned' ? (
          <div>
            {loadingOwned ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500"></div>
              </div>
            ) : ownedCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ownedCars.map((ownedCar) => (
                  <CarCard 
                    key={ownedCar.id} 
                    car={ownedCar.Car || ownedCar} 
                    type="owned" 
                    isActive={ownedCar.isActive}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Cars Yet</h3>
                <p className="text-gray-400">Visit the Car Market to buy your first vehicle</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingCars ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500"></div>
              </div>
            ) : availableCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableCars.map((car) => (
                  <CarCard key={car.id} car={car} type="market" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Cars Available</h3>
                <p className="text-gray-400">Check back later for new vehicles</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
