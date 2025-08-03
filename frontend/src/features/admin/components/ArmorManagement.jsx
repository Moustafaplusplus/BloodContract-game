import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Heart,
  Activity,
  Trophy,
  Zap,
  Search,
  Ban,
  CheckCircle
} from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';
import BlackcoinIcon from '@/components/BlackcoinIcon';

export default function ArmorManagement() {
  const queryClient = useQueryClient();
  
  // Armor management state
  const [armorViewMode, setArmorViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [armorForm, setArmorForm] = useState({
    name: '',
    def: 1,
    hpBonus: 0,
    price: 100,
    rarity: 'common',
    imageUrl: '',
    currency: 'money',
  });
  const [armorEditingId, setArmorEditingId] = useState(null);
  const [armorImageUploading, setArmorImageUploading] = useState(false);
  const [armorImagePreview, setArmorImagePreview] = useState('');

  // Fetch all armors for admin
  const { data: armors = [], isLoading: armorsLoading } = useQuery({
    queryKey: ['admin-armors'],
    queryFn: () => axios.get('/api/shop/admin/armors').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Armor mutations
  const createArmorMutation = useMutation({
    mutationFn: (data) => axios.post('/api/shop/admin/armors', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-armors']);
      toast.success('تم إنشاء الدرع بنجاح!');
      resetArmorForm();
      setArmorViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في إنشاء الدرع');
    },
  });

  const updateArmorMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/shop/admin/armors/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-armors']);
      toast.success('تم تحديث الدرع بنجاح!');
      resetArmorForm();
      setArmorViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في تحديث الدرع');
    },
  });

  const deleteArmorMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/shop/admin/armors/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-armors']);
      toast.success('تم حذف الدرع بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في حذف الدرع');
    },
  });

  // Armor management helper functions
  const resetArmorForm = () => {
    setArmorForm({
      name: '',
      def: 1,
      hpBonus: 0,
      price: 100,
      rarity: 'common',
      imageUrl: '',
      currency: 'money',
    });
    setArmorImagePreview('');
    setArmorEditingId(null);
  };

  const handleArmorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setArmorForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleArmorImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArmorImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post('/api/shop/upload-armor-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setArmorForm((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
      setArmorImagePreview(URL.createObjectURL(file));
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في رفع الصورة');
    } finally {
      setArmorImageUploading(false);
    }
  };

  const handleArmorSubmit = async (e) => {
    e.preventDefault();
    if (!armorForm.imageUrl) {
      toast.error('يرجى رفع صورة للدرع.');
      return;
    }

    try {
      if (armorEditingId) {
        await updateArmorMutation.mutateAsync({ id: armorEditingId, data: armorForm });
      } else {
        await createArmorMutation.mutateAsync(armorForm);
      }
    } catch {
      // Error is handled by mutation
    }
  };

  const handleArmorEdit = (armor) => {
    setArmorForm({
      name: armor.name,
      def: armor.def,
      hpBonus: armor.hpBonus,
      price: armor.price,
      rarity: armor.rarity,
      imageUrl: armor.imageUrl,
      currency: armor.currency,
    });
    setArmorImagePreview(armor.imageUrl ? armor.imageUrl : '');
    setArmorEditingId(armor.id);
    setArmorViewMode('edit');
  };

  const handleArmorDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدرع؟')) {
      await deleteArmorMutation.mutateAsync(id);
    }
  };

  const handleArmorCreateNew = () => {
    resetArmorForm();
    setArmorViewMode('create');
  };

  const handleArmorCancel = () => {
    resetArmorForm();
    setArmorViewMode('list');
  };

  // Rarity colors
  const rarityColors = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legend: 'text-yellow-400'
  };

  // Rarity icons
  const rarityIcons = {
    common: '⭐',
    uncommon: '⭐⭐',
    rare: '⭐⭐⭐',
    epic: '⭐⭐⭐⭐',
    legend: '⭐⭐⭐⭐⭐'
  };

  if (armorsLoading) {
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
          إدارة الدروع
        </h2>
        <p className="text-white">إدارة وتخصيص الدروع في اللعبة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Shield className="w-8 h-8 text-accent-blue mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{totalArmors}</h3>
          <p className="text-white text-sm">إجمالي الدروع</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Activity className="w-8 h-8 text-accent-green mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{activeArmors}</h3>
          <p className="text-white text-sm">الدرع النشطة</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{averageDefense}</h3>
          <p className="text-white text-sm">متوسط الدفاع</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Zap className="w-8 h-8 text-accent-purple mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{averagePrice}</h3>
          <p className="text-white text-sm">متوسط السعر</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hitman-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في الدروع..."
              className="w-full bg-hitman-800/50 border border-hitman-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-hitman-400 focus:border-accent-red focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-hitman-800/50 border border-hitman-700 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
          >
            <option value="">جميع الأنواع</option>
            <option value="light">خفيف</option>
            <option value="medium">متوسط</option>
            <option value="heavy">ثقيل</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-hitman-800/50 border border-hitman-700 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
      </div>

      {/* Armors Table */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-white font-bold">الدرع</th>
                <th className="px-6 py-4 text-right text-white font-bold">النوع</th>
                <th className="px-6 py-4 text-right text-white font-bold">الدفاع</th>
                <th className="px-6 py-4 text-right text-white font-bold">السعر</th>
                <th className="px-6 py-4 text-right text-white font-bold">الحالة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {filteredArmors?.map((armor) => (
                <tr key={armor.id} className="hover:bg-hitman-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-blue-600 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{armor.name}</div>
                        <div className="text-sm text-hitman-400">{armor.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      armor.type === 'light' ? 'bg-green-500/20 text-green-400' :
                      armor.type === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {armor.type === 'light' ? 'خفيف' :
                       armor.type === 'medium' ? 'متوسط' : 'ثقيل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{armor.defense}</td>
                  <td className="px-6 py-4 text-white">{armor.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      armor.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {armor.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(armor)}
                        className="p-2 bg-hitman-700/50 hover:bg-hitman-600/50 text-hitman-400 hover:text-white rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(armor.id, armor.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          armor.isActive
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        title={armor.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {armor.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Armor Button */}
      <div className="text-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-accent-red to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
        >
          إضافة درع جديد
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-hitman-800 to-hitman-900 border border-hitman-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">
              {editingArmor ? 'تعديل الدرع' : 'إضافة درع جديد'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">اسم الدرع</label>
                <input
                  type="text"
                  value={armorForm.name}
                  onChange={(e) => setArmorForm({...armorForm, name: e.target.value})}
                  className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الوصف</label>
                <textarea
                  value={armorForm.description}
                  onChange={(e) => setArmorForm({...armorForm, description: e.target.value})}
                  rows={3}
                  className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">الدفاع</label>
                  <input
                    type="number"
                    value={armorForm.defense}
                    onChange={(e) => setArmorForm({...armorForm, defense: parseInt(e.target.value)})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">السعر</label>
                  <input
                    type="number"
                    value={armorForm.price}
                    onChange={(e) => setArmorForm({...armorForm, price: parseInt(e.target.value)})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">النوع</label>
                  <select
                    value={armorForm.type}
                    onChange={(e) => setArmorForm({...armorForm, type: e.target.value})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  >
                    <option value="light">خفيف</option>
                    <option value="medium">متوسط</option>
                    <option value="heavy">ثقيل</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                  <select
                    value={armorForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setArmorForm({...armorForm, isActive: e.target.value === 'active'})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-red to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                {editingArmor ? 'تحديث' : 'إضافة'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingArmor(null);
                  setArmorForm(initialArmorForm);
                }}
                className="flex-1 px-4 py-2 bg-hitman-700/50 text-white font-bold rounded-lg hover:bg-hitman-600/50 transition-all duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 