import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { toast } from 'react-hot-toast';
import MoneyIcon from '@/components/MoneyIcon';

const BotManagement = () => {
  const { isAdmin } = useAuth();
  const [botStats, setBotStats] = useState(null);
  const [activityStatus, setActivityStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bots, setBots] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [onlineBots, setOnlineBots] = useState([]);
  
  // Manual update states
  const [showManualUpdate, setShowManualUpdate] = useState(false);
  const [manualUpdates, setManualUpdates] = useState({
    vipPercentage: 0,
    avgMoney: 0,
    avgLevel: 0,
    onlinePercentage: 0
  });
  const [updating, setUpdating] = useState(false);

  // Fetch bot statistics
  const fetchBotStats = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBotStats(data.data);
        // Initialize manual updates with current stats
        setManualUpdates({
          vipPercentage: data.data.vipPercentage || 0,
          avgMoney: data.data.avgMoney || 0,
          avgLevel: data.data.avgLevel || 0,
          onlinePercentage: data.data.onlinePercentage || 0
        });
      }
    } catch (error) {
      console.error('Error fetching bot stats:', error);
    }
  };

  // Fetch bot activity status
  const fetchActivityStatus = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/activity/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivityStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity status:', error);
    }
  };

  // Fetch all bots
  const fetchBots = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await fetch(`/api/bots?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBots(data.data.bots);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching bots:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch online bots
  const fetchOnlineBots = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/online?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOnlineBots(data.data.bots);
      }
    } catch (error) {
      console.error('Error fetching online bots:', error);
    }
  };

  // Start bot activity
  const startBotActivity = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/activity/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Bot activity started');
        fetchActivityStatus();
      } else {
        toast.error('Failed to start bot activity');
      }
    } catch (error) {
      console.error('Error starting bot activity:', error);
      toast.error('Failed to start bot activity');
    }
  };

  // Stop bot activity
  const stopBotActivity = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/activity/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Bot activity stopped');
        fetchActivityStatus();
      } else {
        toast.error('Failed to stop bot activity');
      }
    } catch (error) {
      console.error('Error stopping bot activity:', error);
      toast.error('Failed to stop bot activity');
    }
  };

  // Update bot activity manually
  const updateBotActivity = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/activity/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Bot activity updated');
        fetchBotStats();
        fetchOnlineBots();
      } else {
        toast.error('Failed to update bot activity');
      }
    } catch (error) {
      console.error('Error updating bot activity:', error);
      toast.error('Failed to update bot activity');
    }
  };

  // Delete all bots
  const deleteAllBots = async () => {
    if (!confirm('Are you sure you want to delete ALL bots? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/delete-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('All bots deleted');
        fetchBotStats();
        fetchBots(1);
        fetchOnlineBots();
      } else {
        toast.error('Failed to delete bots');
      }
    } catch (error) {
      console.error('Error deleting bots:', error);
      toast.error('Failed to delete bots');
    }
  };

  // Manual stats update
  const updateBotStats = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/bots/update-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(manualUpdates)
      });
      
      if (response.ok) {
        toast.success('Bot statistics updated successfully');
        fetchBotStats();
        setShowManualUpdate(false);
      } else {
        toast.error('Failed to update bot statistics');
      }
    } catch (error) {
      console.error('Error updating bot stats:', error);
      toast.error('Failed to update bot statistics');
    } finally {
      setUpdating(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBotStats();
    fetchActivityStatus();
    fetchBots(1);
    fetchOnlineBots();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchBotStats();
      fetchOnlineBots();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
        <p className="text-gray-400">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Bot Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualUpdate(!showManualUpdate)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {showManualUpdate ? 'Hide' : 'Manual Update'}
          </button>
          <button
            onClick={updateBotActivity}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Activity
          </button>
          <button
            onClick={deleteAllBots}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete All Bots
          </button>
        </div>
      </div>

      {/* Manual Stats Update */}
      {showManualUpdate && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Manual Statistics Update</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">VIP Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={manualUpdates.vipPercentage}
                onChange={(e) => setManualUpdates(prev => ({ ...prev, vipPercentage: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Average Money</label>
              <input
                type="number"
                min="0"
                value={manualUpdates.avgMoney}
                onChange={(e) => setManualUpdates(prev => ({ ...prev, avgMoney: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Average Level</label>
              <input
                type="number"
                min="1"
                max="100"
                value={manualUpdates.avgLevel}
                onChange={(e) => setManualUpdates(prev => ({ ...prev, avgLevel: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Online Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={manualUpdates.onlinePercentage}
                onChange={(e) => setManualUpdates(prev => ({ ...prev, onlinePercentage: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={updateBotStats}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Apply Changes'}
            </button>
            <button
              onClick={() => setShowManualUpdate(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bot Statistics */}
      {botStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Bots</h3>
            <p className="text-3xl font-bold text-blue-400">{botStats.totalBots}</p>
            <p className="text-sm text-gray-400">Active population</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Online Bots</h3>
            <p className="text-3xl font-bold text-green-400">{botStats.onlineBots}</p>
            <p className="text-sm text-gray-400">{botStats.onlinePercentage}% online</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">VIP Bots</h3>
            <p className="text-3xl font-bold text-yellow-400">{botStats.vipBots}</p>
            <p className="text-sm text-gray-400">{botStats.vipPercentage}% VIP</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Total Money</h3>
            <div className="flex items-center gap-2 mb-2">
              <MoneyIcon className="w-6 h-6" />
              <p className="text-3xl font-bold text-green-400">
                ${botStats.totalMoney?.toLocaleString() || 0}
              </p>
            </div>
            <p className="text-sm text-gray-400">Avg: ${botStats.avgMoney?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {/* Detailed Statistics */}
      {botStats && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Detailed Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">Level Distribution</h4>
              <p className="text-2xl font-bold text-blue-400">{botStats.avgLevel || 0}</p>
              <p className="text-sm text-gray-400">Average Level</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">Money Distribution</h4>
              <div className="flex items-center gap-2 mb-2">
                <MoneyIcon className="w-5 h-5" />
                <p className="text-2xl font-bold text-green-400">${botStats.avgMoney?.toLocaleString() || 0}</p>
              </div>
              <p className="text-sm text-gray-400">Average Money</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">Activity Status</h4>
              <p className="text-2xl font-bold text-purple-400">{botStats.onlinePercentage}%</p>
              <p className="text-sm text-gray-400">Currently Online</p>
            </div>
          </div>
        </div>
      )}

      {/* Activity Control */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Activity Control</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Status:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              activityStatus?.isRunning 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {activityStatus?.status || 'Unknown'}
            </span>
          </div>
          <button
            onClick={startBotActivity}
            disabled={activityStatus?.isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Start Activity
          </button>
          <button
            onClick={stopBotActivity}
            disabled={!activityStatus?.isRunning}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Stop Activity
          </button>
        </div>
      </div>

      {/* Online Bots */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Recently Online Bots</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onlineBots.map((bot) => (
            <div key={bot.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{bot.username}</h4>
                <span className="text-green-400 text-sm">Online</span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Level: {bot.Character?.level}</p>
                <div className="flex items-center gap-1">
                  <MoneyIcon className="w-4 h-4" />
                  <p>Money: ${bot.Character?.money?.toLocaleString()}</p>
                </div>
                <p>Last Active: {new Date(bot.Character?.lastActive).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Bots Table */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">All Bots</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Level</th>
                    <th className="px-6 py-3">Money</th>
                    <th className="px-6 py-3">VIP</th>
                    <th className="px-6 py-3">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((bot) => (
                    <tr key={bot.id} className="bg-gray-700 border-b border-gray-600">
                      <td className="px-6 py-4 font-medium text-white">{bot.username}</td>
                      <td className="px-6 py-4">{bot.Character?.level}</td>
                      <td className="px-6 py-4">${bot.Character?.money?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {bot.Character?.vipExpiresAt && new Date(bot.Character.vipExpiresAt) > new Date() ? (
                          <span className="text-yellow-400">VIP</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {bot.Character?.lastActive ? 
                          new Date(bot.Character.lastActive).toLocaleString() : 
                          'Never'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => fetchBots(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchBots(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BotManagement; 