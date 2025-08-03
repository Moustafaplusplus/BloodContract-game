import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MoneyIcon from '@/components/MoneyIcon';
import { 
  Users, 
  Search,
  Edit,
  Ban,
  Package,
  User,
  MoreHorizontal,
  DollarSign,
  Coins,
  Trophy,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react';
import InventoryTooltip from '@/components/InventoryTooltip';

export default function CharacterManagement() {
  const queryClient = useQueryClient();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [inventoryTooltip, setInventoryTooltip] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    userId: null
  });
  const [inventoryData, setInventoryData] = useState(null);
  const [inventoryCounts, setInventoryCounts] = useState({});
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all characters
  const { data: charactersData, isLoading: charactersLoading } = useQuery({
    queryKey: ['admin-characters', debouncedSearchTerm],
    queryFn: () => {
      const token = localStorage.getItem('jwt');
      return axios.get(`/api/admin/characters?search=${debouncedSearchTerm}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(res => res.data);
    },
    staleTime: 30 * 1000,
  });

  // Fetch inventory counts for all users
  const fetchInventoryCounts = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const counts = {};
      
      // Fetch counts for each character
      for (const character of charactersData?.characters || []) {
        if (character.User?.id) {
          try {
            const response = await axios.get(`/api/admin/users/${character.User.id}/inventory`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            counts[character.User.id] = response.data.totalItems || 0;
          } catch (error) {
            counts[character.User.id] = 0;
          }
        }
      }
      
      setInventoryCounts(counts);
    } catch (error) {
      // Silently handle inventory count errors
    }
  };

  // Fetch inventory counts when characters data is loaded
  useEffect(() => {
    if (charactersData?.characters) {
      fetchInventoryCounts();
    }
  }, [charactersData]);

  // Update character mutation
  const updateCharacterMutation = useMutation({
    mutationFn: ({ id, updates }) => {
      const token = localStorage.getItem('jwt');
      return axios.put(`/api/admin/characters/${id}`, updates, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-characters']);
      toast.success('تم تحديث الشخصية بنجاح');
      setEditingField(null);
      setEditValue('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث الشخصية');
    },
  });

  // Ban/Unban user mutation
  const banUserMutation = useMutation({
    mutationFn: ({ userId, isBanned }) => {
      const token = localStorage.getItem('jwt');
      return axios.put(`/api/admin/users/${userId}/ban`, { isBanned }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (_, { isBanned }) => {
      queryClient.invalidateQueries(['admin-characters']);
      toast.success(isBanned ? 'تم حظر المستخدم بنجاح' : 'تم إلغاء حظر المستخدم بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث حالة الحظر');
    },
  });

  // Calculate statistics
  const totalCharacters = charactersData?.characters?.length || 0;
  const onlineCharacters = charactersData?.characters?.filter(c => c.User?.isOnline)?.length || 0;
  const bannedUsers = charactersData?.characters?.filter(c => c.User?.isBanned)?.length || 0;
  const totalMoney = charactersData?.characters?.reduce((sum, c) => sum + (c.money || 0), 0) || 0;
  const totalBlackcoins = charactersData?.characters?.reduce((sum, c) => sum + (c.blackcoins || 0), 0) || 0;

  const handleEdit = (character, field) => {
    setSelectedCharacter(character);
    setEditingField(field);
    setEditValue(character[field]?.toString() || '');
  };

  const handleSave = () => {
    if (!selectedCharacter || !editingField) return;
    
    const updates = { [editingField]: editValue };
    updateCharacterMutation.mutate({ id: selectedCharacter.id, updates });
  };

  const handleAdjustMoney = (characterId) => {
    const character = charactersData?.characters?.find(c => c.id === characterId);
    if (character) {
      handleEdit(character, 'money');
    }
  };

  const handleAdjustBlackcoins = (characterId) => {
    const character = charactersData?.characters?.find(c => c.id === characterId);
    if (character) {
      handleEdit(character, 'blackcoins');
    }
  };

  const handleSetLevel = (characterId) => {
    const character = charactersData?.characters?.find(c => c.id === characterId);
    if (character) {
      handleEdit(character, 'level');
    }
  };

  const handleResetCharacter = (characterId) => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين هذه الشخصية؟')) {
      updateCharacterMutation.mutate({
        id: characterId,
        updates: {
          money: 1000,
          blackcoins: 0,
          experience: 0,
          level: 1,
          health: 100,
          energy: 100,
        }
      });
    }
  };

  const handleBanUser = (userId, isCurrentlyBanned) => {
    const action = isCurrentlyBanned ? 'إلغاء حظر' : 'حظر';
    if (window.confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) {
      banUserMutation.mutate({ userId, isBanned: !isCurrentlyBanned });
    }
  };

  const handleViewIpHistory = (userId) => {
    // Implementation for viewing IP history
    console.log('View IP history for user:', userId);
  };

  const handleLoginAsUser = (userId, username) => {
    if (window.confirm(`هل تريد تسجيل الدخول كـ ${username}؟`)) {
      // Implementation for login as user
      console.log('Login as user:', userId);
    }
  };

  const handleShowInventory = (event, userId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setInventoryTooltip({
      isVisible: true,
      position: { x: rect.left, y: rect.bottom },
      userId
    });
    
    // Fetch inventory data
    const token = localStorage.getItem('jwt');
    axios.get(`/api/admin/users/${userId}/inventory`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(res => {
      setInventoryData(res.data);
    }).catch(error => {
      console.error('Failed to fetch inventory:', error);
    });
  };

  const handleHideInventory = () => {
    setInventoryTooltip({ isVisible: false, position: { x: 0, y: 0 }, userId: null });
    setInventoryData(null);
  };

  const handleSelectCharacter = (character) => {
    setSelectedCharacters(prev => {
      const isSelected = prev.some(c => c.id === character.id);
      if (isSelected) {
        return prev.filter(c => c.id !== character.id);
      } else {
        return [...prev, character];
      }
    });
  };

  if (charactersLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bouya mb-4 text-white">
          إدارة الشخصيات
        </h2>
        <p className="text-white">إدارة حسابات اللاعبين والإعدادات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Users className="w-8 h-8 text-accent-blue mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{totalCharacters}</h3>
          <p className="text-white text-sm">إجمالي الشخصيات</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <User className="w-8 h-8 text-accent-green mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{onlineCharacters}</h3>
          <p className="text-white text-sm">المستخدمين المتصلين</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Ban className="w-8 h-8 text-accent-red mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{bannedUsers}</h3>
          <p className="text-white text-sm">المستخدمين المحظورين</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <MoneyIcon className="w-8 h-8 mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{totalMoney.toLocaleString()}</h3>
          <p className="text-white text-sm">إجمالي المال</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Coins className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{totalBlackcoins.toLocaleString()}</h3>
          <p className="text-white text-sm">إجمالي العملة السوداء</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Activity className="w-8 h-8 text-accent-purple mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{totalCharacters > 0 ? Math.round((onlineCharacters / totalCharacters) * 100) : 0}%</h3>
          <p className="text-white text-sm">نسبة النشاط</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hitman-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في الشخصيات..."
            className="w-full bg-hitman-800/50 border border-hitman-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-hitman-400 focus:border-accent-red focus:outline-none"
          />
        </div>
      </div>

      {/* Characters Table */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-white font-bold">الشخصية</th>
                <th className="px-6 py-4 text-right text-white font-bold">المستوى</th>
                <th className="px-6 py-4 text-right text-white font-bold">المال</th>
                <th className="px-6 py-4 text-right text-white font-bold">العملة السوداء</th>
                <th className="px-6 py-4 text-right text-white font-bold">الخبرة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الحالة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {charactersData?.characters?.map((character) => (
                <tr key={character.id} className="hover:bg-hitman-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-red to-red-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{character.name}</div>
                        <div className="text-sm text-hitman-400">{character.User?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{character.level}</td>
                  <td className="px-6 py-4 text-white">{character.money?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white">{character.blackcoins?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white">{character.experience?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${character.User?.isOnline ? 'bg-green-400' : 'bg-hitman-500'}`}></div>
                      <span className="text-white text-sm">
                        {character.User?.isOnline ? 'متصل' : 'غير متصل'}
                      </span>
                      {character.User?.isBanned && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">محظور</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShowInventory(null, character.User?.id)}
                        className="p-2 bg-hitman-700/50 hover:bg-hitman-600/50 text-hitman-400 hover:text-white rounded-lg transition-colors"
                        title="عرض المخزون"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEdit(character)}
                        className="p-2 bg-hitman-700/50 hover:bg-hitman-600/50 text-hitman-400 hover:text-white rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleBanUser(character.User?.id, character.User?.isBanned)}
                        className={`p-2 rounded-lg transition-colors ${
                          character.User?.isBanned
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                        title={character.User?.isBanned ? 'إلغاء الحظر' : 'حظر'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCharacters.length > 0 && (
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">
            إجراءات جماعية ({selectedCharacters.length} شخصية محددة)
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors">
              <UserCheck className="w-4 h-4 inline mr-2" />
              إلغاء حظر الكل
            </button>
            <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors">
              <UserX className="w-4 h-4 inline mr-2" />
              حظر الكل
            </button>
            <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors">
              <DollarSign className="w-4 h-4 inline mr-2" />
              إضافة مال
            </button>
            <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-colors">
              <Coins className="w-4 h-4 inline mr-2" />
              إضافة عملة سوداء
            </button>
          </div>
        </div>
      )}

      {/* Inventory Tooltip */}
      {inventoryTooltip.isVisible && inventoryData && (
        <InventoryTooltip
          data={inventoryData}
          position={inventoryTooltip.position}
          onClose={handleHideInventory}
        />
      )}
    </div>
  );
} 