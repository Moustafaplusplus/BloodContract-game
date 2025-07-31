import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MoneyIcon from '@/components/MoneyIcon';
import { 
  Users, 
  Search,
  Edit,
  RefreshCw,
  Target,
  Shield,
  Ban,
  Globe,
  Package
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
      toast.error(error.response?.data?.error || 'فشل في تحديث الشخصية');
    },
  });

  // Adjust money mutation
  const adjustMoneyMutation = useMutation({
    mutationFn: ({ id, amount }) => {
      const token = localStorage.getItem('jwt');
      return axios.post(`/api/admin/characters/${id}/money`, { amount }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-characters']);
      toast.success(`تم تعديل المال: ${data.data.adjustment > 0 ? '+' : ''}${data.data.adjustment}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في تعديل المال');
    },
  });

  // Adjust blackcoins mutation
  const adjustBlackcoinsMutation = useMutation({
    mutationFn: ({ id, amount }) => {
      const token = localStorage.getItem('jwt');
      return axios.post(`/api/admin/characters/${id}/blackcoins`, { amount }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-characters']);
      toast.success(`تم تعديل البلاك كوينز: ${data.data.adjustment > 0 ? '+' : ''}${data.data.adjustment}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في تعديل البلاك كوينز');
    },
  });

  // Set level mutation
  const setLevelMutation = useMutation({
    mutationFn: ({ id, level }) => {
      const token = localStorage.getItem('jwt');
      return axios.post(`/api/admin/characters/${id}/level`, { level }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-characters']);
      toast.success(`تم تغيير المستوى من ${data.data.oldLevel} إلى ${data.data.newLevel}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في تغيير المستوى');
    },
  });

  // Login as user mutation
  const loginAsUserMutation = useMutation({
    mutationFn: ({ userId }) => {
      const token = localStorage.getItem('jwt');
      return axios.post(`/api/admin/users/${userId}/login-token`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (data) => {
      // Store the original admin token
      const adminToken = localStorage.getItem('jwt');
      localStorage.setItem('adminOriginalToken', adminToken);
      
      // Store the user token
      localStorage.setItem('jwt', data.data.token);
      
      // Store user info for easy return
      localStorage.setItem('adminLoggedAsUser', JSON.stringify({
        userId: data.data.user.id,
        username: data.data.user.username,
        characterName: data.data.character.name
      }));
      
      toast.success(`تم تسجيل الدخول كـ ${data.data.user.username}`);
      
      // Reload the page to switch to user context
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في تسجيل الدخول كالمستخدم');
    },
  });

  // Get user inventory mutation
  const getUserInventoryMutation = useMutation({
    mutationFn: ({ userId }) => {
      const token = localStorage.getItem('jwt');
      return axios.get(`/api/admin/users/${userId}/inventory`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (data) => {
      setInventoryData(data.data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في جلب مخزون المستخدم');
    },
  });

  // Reset character mutation
  const resetCharacterMutation = useMutation({
    mutationFn: ({ id }) => {
      const token = localStorage.getItem('jwt');
      return axios.post(`/api/admin/characters/${id}/reset`, { confirmPassword: 'CONFIRM_RESET' }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-characters']);
      toast.success('تم إعادة تعيين الشخصية بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في إعادة تعيين الشخصية');
    },
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: ({ userId, banned, reason }) => {
      const token = localStorage.getItem('jwt');
      return axios.post(`/api/admin/users/${userId}/ban`, { banned, reason }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('تم تحديث حالة المستخدم بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في تحديث حالة المستخدم');
    },
  });

  // Get user IPs mutation
  const getUserIpsMutation = useMutation({
    mutationFn: ({ userId }) => {
      const token = localStorage.getItem('jwt');
      return axios.get(`/api/admin/users/${userId}/ips`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (data) => {
      setUserIps(data.data);
      setShowIpsModal(true);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في جلب عناوين IP للمستخدم');
    },
  });

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
    const amount = prompt('أدخل المبلغ (استخدم - للخصم):');
    if (amount !== null && !isNaN(amount)) {
      adjustMoneyMutation.mutate({ id: characterId, amount: parseInt(amount) });
    }
  };

  const handleAdjustBlackcoins = (characterId) => {
    const amount = prompt('أدخل عدد البلاك كوينز (استخدم - للخصم):');
    if (amount !== null && !isNaN(amount)) {
      adjustBlackcoinsMutation.mutate({ id: characterId, amount: parseInt(amount) });
    }
  };

  const handleSetLevel = (characterId) => {
    const newLevel = prompt('المستوى الجديد:');
    if (newLevel && !isNaN(newLevel)) {
      setLevelMutation.mutate({ id: characterId, level: parseInt(newLevel) });
    }
  };

  const handleResetCharacter = (characterId) => {
    if (confirm('هل أنت متأكد من إعادة تعيين هذه الشخصية؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      resetCharacterMutation.mutate({ id: characterId });
    }
  };

  const handleBanUser = (userId, isCurrentlyBanned) => {
    const action = isCurrentlyBanned ? 'إلغاء حظر' : 'حظر';
    const reason = prompt(`سبب ${action} المستخدم (اختياري):`);
    if (reason !== null) {
      banUserMutation.mutate({ 
        userId, 
        banned: !isCurrentlyBanned, 
        reason 
      });
    }
  };

  const handleViewIpHistory = (userId) => {
    getUserIpsMutation.mutate({ userId });
  };

  const handleLoginAsUser = (userId, username) => {
    if (!userId) {
      toast.error('معرف المستخدم غير متوفر');
      return;
    }
    
    if (confirm(`هل أنت متأكد من تسجيل الدخول كـ ${username}؟`)) {
      loginAsUserMutation.mutate({ userId });
    }
  };

  const handleShowInventory = (event, userId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setInventoryTooltip({
      isVisible: true,
      position: { x: rect.left, y: rect.top },
      userId
    });
    
    // Fetch inventory data
    getUserInventoryMutation.mutate({ userId });
  };

  const handleHideInventory = () => {
    setInventoryTooltip({
      isVisible: false,
      position: { x: 0, y: 0 },
      userId: null
    });
    setInventoryData(null);
  };

  if (charactersLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل الشخصيات...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hitman-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث عن شخصية أو مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-hitman-800/50 border border-hitman-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-red"
          />
        </div>
      </div>

      {/* Characters Table */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">المستخدم</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">الاسم</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">المستوى</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">المال</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">البلاك كوينز</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">القوة</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">الدفاع</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">عنوان IP</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {charactersData?.characters?.map((character) => (
                <tr key={character.id} className="hover:bg-hitman-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-hitman-700 flex items-center justify-center">
                        {character.User?.username?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{character.User?.Character?.name || character.User?.username}</div>
                        <div className="text-sm text-hitman-400">{character.User?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingField === 'name' && selectedCharacter?.id === character.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-hitman-700 border border-accent-red rounded px-2 py-1 text-white"
                        />
                        <button
                          onClick={handleSave}
                          className="text-accent-green hover:text-white"
                        >
                          حفظ
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{character.name}</span>
                        <button
                          onClick={() => handleEdit(character, 'name')}
                          className="text-hitman-400 hover:text-accent-yellow"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{character.level}</span>
                      <button
                        onClick={() => handleSetLevel(character.id)}
                        className="text-hitman-400 hover:text-accent-yellow"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MoneyIcon className="w-4 h-4" />
                      <span className="font-medium">${character.money?.toLocaleString()}</span>
                      <button
                        onClick={() => handleAdjustMoney(character.id)}
                        className="text-hitman-400 hover:text-accent-yellow"
                        title="تعديل المال"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{character.blackcoins}</span>
                      <button
                        onClick={() => handleAdjustBlackcoins(character.id)}
                        className="text-hitman-400 hover:text-accent-yellow"
                        title="تعديل البلاك كوينز"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent-red" />
                      <span>{character.strength}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent-blue" />
                      <span>{character.defense}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent-blue" />
                      <span className="font-mono text-sm text-hitman-300">
                        {character.User?.lastIpAddress ? (
                          character.User.lastIpAddress.startsWith('192.168.1.') ? (
                            <span className="text-hitman-500 italic">لم يسجل دخول بعد</span>
                          ) : (
                            <span title={`Last IP: ${character.User.lastIpAddress}`}>
                              {character.User.lastIpAddress === '::1' ? 'localhost' : character.User.lastIpAddress}
                            </span>
                          )
                        ) : (
                          <span className="text-hitman-500 italic">لم يسجل دخول بعد</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBanUser(character.User?.id, character.User?.isBanned)}
                        className={`p-1 rounded ${
                          character.User?.isBanned 
                            ? 'text-green-400 hover:text-green-300' 
                            : 'text-red-400 hover:text-red-300'
                        }`}
                        title={character.User?.isBanned ? 'إلغاء حظر المستخدم' : 'حظر المستخدم'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewIpHistory(character.User?.id)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded"
                        title="عرض سجل IP"
                      >
                        <Globe className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleLoginAsUser(character.User?.id, character.User?.username)}
                        className="text-purple-400 hover:text-purple-300 p-1 rounded"
                        title="تسجيل الدخول كالمستخدم"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onMouseEnter={(e) => handleShowInventory(e, character.User?.id)}
                        onMouseLeave={handleHideInventory}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded relative"
                        title="عرض المخزون"
                      >
                        <Package className="w-4 h-4" />
                        {inventoryCounts[character.User?.id] > 0 && (
                          <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {inventoryCounts[character.User?.id]}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleResetCharacter(character.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                        title="إعادة تعيين الشخصية"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {charactersData?.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: charactersData.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-lg ${
                  page === charactersData.page
                    ? 'bg-accent-red text-white'
                    : 'bg-hitman-800 text-hitman-300 hover:bg-hitman-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Tooltip */}
      <InventoryTooltip
        inventory={inventoryData}
        isVisible={inventoryTooltip.isVisible}
        position={inventoryTooltip.position}
      />
    </div>
  );
} 