import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { Gift, Calendar, Settings, Save, X, Plus, Trash2, Zap } from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';
import BlackcoinIcon from '@/components/BlackcoinIcon';

const LoginGiftManagement = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch admin configuration
  const { data: configData, isLoading } = useQuery({
    queryKey: ['loginGiftAdminConfig'],
    queryFn: async () => {
      const response = await fetch('/api/login-gift/admin/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch configuration');
      return response.json();
    },
    enabled: !!token
  });

  // Fetch available items
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['loginGiftAvailableItems'],
    queryFn: async () => {
      const response = await fetch('/api/login-gift/admin/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      return data;
    },
    enabled: !!token
  });

  // Update configuration mutation
  const updateMutation = useMutation({
    mutationFn: async ({ dayNumber, config }) => {
      const response = await fetch(`/api/login-gift/admin/config/${dayNumber}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update configuration');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('تم تحديث الإعدادات بنجاح');
      queryClient.invalidateQueries(['loginGiftAdminConfig']);
      setEditingConfig(null);
      setSelectedItems([]);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleEditDay = (day) => {
    setSelectedDay(day);
    setEditingConfig({
      expReward: day.expReward,
      moneyReward: day.moneyReward,
      blackcoinReward: day.blackcoinReward,
      isActive: day.isActive,
      items: day.items || []
    });
    setSelectedItems(day.items || []);
  };

  const handleSave = () => {
    if (!selectedDay) return;
    
    updateMutation.mutate({
      dayNumber: selectedDay.dayNumber,
      config: {
        ...editingConfig,
        items: selectedItems
      }
    });
  };

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { itemType: 'weapon', itemId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  const handleClearRewards = () => {
    setEditingConfig({
      expReward: 0,
      moneyReward: 0,
      blackcoinReward: 0,
      isActive: editingConfig.isActive,
      items: []
    });
    setSelectedItems([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <p className="text-white">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const { data: config } = configData || {};
  const { data: items } = itemsData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-red rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">إدارة مكافآت الدخول اليومية</h1>
          <p className="text-gray-300">تكوين المكافآت لكل يوم من الـ 15 يوم</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-hitman-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-center">التقويم</h2>
              <div className="grid grid-cols-5 gap-4">
                {config?.map((day) => (
                  <div
                    key={day.dayNumber}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedDay?.dayNumber === day.dayNumber
                        ? 'bg-accent-red border-accent-red'
                        : day.isActive
                        ? 'bg-hitman-700 border-hitman-600 hover:border-accent-red'
                        : 'bg-hitman-700 border-gray-600 opacity-50'
                    }`}
                    onClick={() => handleEditDay(day)}
                  >
                    <div className="text-center mb-3">
                      <div className={`text-lg font-bold ${
                        selectedDay?.dayNumber === day.dayNumber ? 'text-white' : 'text-gray-300'
                      }`}>
                        {day.dayNumber}
                      </div>
                    </div>

                    {/* Rewards Preview */}
                    <div className="space-y-1 text-xs">
                      {day.expReward > 0 && (
                        <div className="flex items-center justify-center">
                          <Zap className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-yellow-400">{day.expReward}</span>
                        </div>
                      )}
                      {day.moneyReward > 0 && (
                        <div className="flex items-center justify-center">
                          <MoneyIcon className="w-3 h-3" />
                          <span className="text-green-400 ml-1">{day.moneyReward}</span>
                        </div>
                      )}
                      {day.blackcoinReward > 0 && (
                        <div className="flex items-center justify-center">
                          <BlackcoinIcon />
                          <span className="text-purple-400 ml-1">{day.blackcoinReward}</span>
                        </div>
                      )}
                      {day.items && day.items.length > 0 && (
                        <div className="flex items-center justify-center">
                          <Gift className="w-3 h-3 text-blue-400 mr-1" />
                          <span className="text-blue-400">{day.items.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Indicators */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1">
                      {!day.isActive && (
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      )}
                      {day.isActive && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Total Rewards Count */}
                    {(day.expReward > 0 || day.moneyReward > 0 || day.blackcoinReward > 0 || (day.items && day.items.length > 0)) && (
                      <div className="absolute bottom-1 left-1">
                        <div className="w-2 h-2 bg-accent-red rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-1">
            <div className="bg-hitman-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-center">تعديل اليوم {selectedDay?.dayNumber}</h2>
              
              {selectedDay && editingConfig ? (
                <div className="space-y-6">
                  {/* Basic Rewards */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                        الخبرة
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingConfig.expReward}
                        onChange={(e) => setEditingConfig({...editingConfig, expReward: parseInt(e.target.value) || 0})}
                        className="w-full bg-hitman-700 border border-hitman-600 rounded-lg px-3 py-2 text-white"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <MoneyIcon className="w-4 h-4" />
                        <span className="ml-2">المال</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingConfig.moneyReward}
                        onChange={(e) => setEditingConfig({...editingConfig, moneyReward: parseInt(e.target.value) || 0})}
                        className="w-full bg-hitman-700 border border-hitman-600 rounded-lg px-3 py-2 text-white"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center">
                        <BlackcoinIcon />
                        <span className="ml-2">العملة السوداء</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingConfig.blackcoinReward}
                        onChange={(e) => setEditingConfig({...editingConfig, blackcoinReward: parseInt(e.target.value) || 0})}
                        className="w-full bg-hitman-700 border border-hitman-600 rounded-lg px-3 py-2 text-white"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingConfig.isActive}
                        onChange={(e) => setEditingConfig({...editingConfig, isActive: e.target.checked})}
                        className="mr-2"
                      />
                      <label className="text-sm">نشط</label>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Gift className="w-4 h-4 mr-2" />
                        العناصر
                      </h3>
                      <button
                        onClick={handleAddItem}
                        className="bg-accent-red hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        إضافة
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedItems.map((item, index) => {
                        const selectedItemData = (() => {
                          if (!item.itemId || !items) return null;
                          const itemType = item.itemType === 'special_item' ? 'specialItems' : `${item.itemType}s`;
                          return items[itemType]?.find(i => i.id === item.itemId);
                        })();
                        
                        return (
                          <div key={index} className="bg-hitman-700 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">العنصر {index + 1}</span>
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <select
                                value={item.itemType}
                                onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                                className="w-full bg-hitman-600 border border-hitman-500 rounded px-2 py-1 text-sm"
                              >
                                <option value="weapon">سلاح</option>
                                <option value="armor">درع</option>
                                <option value="special_item">عنصر خاص</option>
                              </select>
                              
                              <select
                                value={item.itemId}
                                onChange={(e) => handleItemChange(index, 'itemId', parseInt(e.target.value))}
                                className="w-full bg-hitman-600 border border-hitman-500 rounded px-2 py-1 text-sm"
                                disabled={itemsLoading}
                              >
                                <option value="">
                                  {itemsLoading ? 'جاري التحميل...' : 'اختر العنصر'}
                                </option>
                                {items && (() => {
                                  const itemType = item.itemType === 'special_item' ? 'specialItems' : `${item.itemType}s`;
                                  const availableItems = items[itemType] || [];
                                  if (availableItems.length === 0) {
                                    return <option value="" disabled>لا توجد عناصر متاحة</option>;
                                  }
                                  return availableItems.map((itemOption) => (
                                    <option key={itemOption.id} value={itemOption.id}>
                                      {itemOption.name}
                                    </option>
                                  ));
                                })()}
                              </select>
                              
                              {selectedItemData && (
                                <div className="bg-hitman-800 p-2 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    {selectedItemData.imageUrl && (
                                      <img 
                                        src={selectedItemData.imageUrl} 
                                        alt={selectedItemData.name}
                                        className="w-8 h-8 object-cover rounded"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-white">{selectedItemData.name}</div>
                                      <div className="text-xs text-gray-400">
                                        {item.itemType === 'weapon' && `الضرر: ${selectedItemData.damage}`}
                                        {item.itemType === 'armor' && `الدفاع: ${selectedItemData.def}`}
                                        {item.itemType === 'special_item' && selectedItemData.type}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                placeholder="الكمية"
                                className="w-full bg-hitman-600 border border-hitman-500 rounded px-2 py-1 text-sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-hitman-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3 text-center">ملخص المكافآت</h4>
                    <div className="space-y-2 text-sm">
                      {editingConfig.expReward > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                            الخبرة
                          </span>
                          <span className="text-yellow-400 font-bold">+{editingConfig.expReward}</span>
                        </div>
                      )}
                      {editingConfig.moneyReward > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <MoneyIcon className="w-4 h-4" />
                            <span className="ml-2">المال</span>
                          </span>
                          <span className="text-green-400 font-bold">+{editingConfig.moneyReward}</span>
                        </div>
                      )}
                      {editingConfig.blackcoinReward > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <BlackcoinIcon />
                            <span className="ml-2">العملة السوداء</span>
                          </span>
                          <span className="text-purple-400 font-bold">+{editingConfig.blackcoinReward}</span>
                        </div>
                      )}
                      {selectedItems.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Gift className="w-4 h-4 text-blue-400 mr-2" />
                            العناصر
                          </span>
                          <span className="text-blue-400 font-bold">{selectedItems.length} عنصر</span>
                        </div>
                      )}
                      {editingConfig.expReward === 0 && editingConfig.moneyReward === 0 && 
                       editingConfig.blackcoinReward === 0 && selectedItems.length === 0 && (
                        <div className="text-center text-gray-400 text-xs">
                          لا توجد مكافآت محددة لهذا اليوم
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isLoading}
                      className="flex-1 bg-accent-red hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      {updateMutation.isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          حفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          حفظ
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleClearRewards}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm"
                      title="مسح جميع المكافآت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedDay(null);
                        setEditingConfig(null);
                        setSelectedItems([]);
                      }}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>اختر يوم من التقويم للتعديل</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginGiftManagement; 