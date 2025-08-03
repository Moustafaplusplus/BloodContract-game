import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Sword, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Trophy,
  Search,
  Ban,
  CheckCircle
} from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';
import BlackcoinIcon from '@/components/BlackcoinIcon';

export default function WeaponManagement() {
  const queryClient = useQueryClient();
  
  // Weapon management state
  const [weaponViewMode, setWeaponViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [weaponForm, setWeaponForm] = useState({
    name: '',
    damage: 1,
    energyBonus: 0,
    price: 100,
    rarity: 'common',
    imageUrl: '',
    currency: 'money',
  });
  const [weaponEditingId, setWeaponEditingId] = useState(null);
  const [weaponImageUploading, setWeaponImageUploading] = useState(false);
  const [weaponImagePreview, setWeaponImagePreview] = useState('');

  // Fetch all weapons for admin
  const { data: weapons = [], isLoading: weaponsLoading } = useQuery({
    queryKey: ['admin-weapons'],
    queryFn: () => axios.get('/api/shop/admin/weapons').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Weapon mutations
  const createWeaponMutation = useMutation({
    mutationFn: (data) => axios.post('/api/shop/admin/weapons', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-weapons']);
      toast.success('تم إنشاء السلاح بنجاح!');
      resetWeaponForm();
      setWeaponViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في إنشاء السلاح');
    },
  });

  const updateWeaponMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/shop/admin/weapons/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-weapons']);
      toast.success('تم تحديث السلاح بنجاح!');
      resetWeaponForm();
      setWeaponViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في تحديث السلاح');
    },
  });

  const deleteWeaponMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/shop/admin/weapons/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-weapons']);
      toast.success('تم حذف السلاح بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في حذف السلاح');
    },
  });

  // Weapon management helper functions
  const resetWeaponForm = () => {
    setWeaponForm({
      name: '',
      damage: 1,
      energyBonus: 0,
      price: 100,
      rarity: 'common',
      imageUrl: '',
      currency: 'money',
    });
    setWeaponImagePreview('');
    setWeaponEditingId(null);
  };

  const handleWeaponChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWeaponForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleWeaponImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setWeaponImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post('/api/shop/upload-weapon-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setWeaponForm((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
      setWeaponImagePreview(URL.createObjectURL(file));
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في رفع الصورة');
    } finally {
      setWeaponImageUploading(false);
    }
  };

  const handleWeaponSubmit = async (e) => {
    e.preventDefault();
    if (!weaponForm.imageUrl) {
      toast.error('يرجى رفع صورة للسلاح.');
      return;
    }

    try {
      if (weaponEditingId) {
        await updateWeaponMutation.mutateAsync({ id: weaponEditingId, data: weaponForm });
      } else {
        await createWeaponMutation.mutateAsync(weaponForm);
      }
    } catch {
      // Error is handled by mutation
    }
  };

  const handleWeaponEdit = (weapon) => {
    setWeaponForm({
      name: weapon.name,
      damage: weapon.damage,
      energyBonus: weapon.energyBonus,
      price: weapon.price,
      rarity: weapon.rarity,
      imageUrl: weapon.imageUrl,
      currency: weapon.currency,
    });
    setWeaponImagePreview(weapon.imageUrl ? weapon.imageUrl : '');
    setWeaponEditingId(weapon.id);
    setWeaponViewMode('edit');
  };

  const handleWeaponDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السلاح؟')) {
      await deleteWeaponMutation.mutateAsync(id);
    }
  };

  const handleWeaponCreateNew = () => {
    resetWeaponForm();
    setWeaponViewMode('create');
  };

  const handleWeaponCancel = () => {
    resetWeaponForm();
    setWeaponViewMode('list');
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

  if (weaponsLoading) {
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
          إدارة الأسلحة
        </h2>
        <p className="text-white">إدارة وتخصيص الأسلحة في اللعبة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Sword className="w-8 h-8 text-accent-red mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{weapons.length}</h3>
          <p className="text-white text-sm">إجمالي الأسلحة</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Activity className="w-8 h-8 text-accent-green mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{weapons.filter(w => w.isActive).length}</h3>
          <p className="text-white text-sm">الأسلحة النشطة</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{weapons.reduce((sum, w) => sum + w.damage, 0) / weapons.length}</h3>
          <p className="text-white text-sm">متوسط الضرر</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Zap className="w-8 h-8 text-accent-blue mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{weapons.reduce((sum, w) => sum + w.price, 0) / weapons.length}</h3>
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
              placeholder="البحث في الأسلحة..."
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
            <option value="melee">قريب</option>
            <option value="ranged">بعيد</option>
            <option value="explosive">تفجيري</option>
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

      {/* Weapons Table */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-white font-bold">السلاح</th>
                <th className="px-6 py-4 text-right text-white font-bold">النوع</th>
                <th className="px-6 py-4 text-right text-white font-bold">الضرر</th>
                <th className="px-6 py-4 text-right text-white font-bold">السعر</th>
                <th className="px-6 py-4 text-right text-white font-bold">الحالة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {filteredWeapons?.map((weapon) => (
                <tr key={weapon.id} className="hover:bg-hitman-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-red to-red-600 rounded-full flex items-center justify-center">
                        <Sword className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{weapon.name}</div>
                        <div className="text-sm text-hitman-400">{weapon.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      weapon.type === 'melee' ? 'bg-green-500/20 text-green-400' :
                      weapon.type === 'ranged' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {weapon.type === 'melee' ? 'قريب' :
                       weapon.type === 'ranged' ? 'بعيد' : 'تفجيري'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{weapon.damage}</td>
                  <td className="px-6 py-4 text-white">{weapon.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      weapon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {weapon.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleWeaponEdit(weapon)}
                        className="p-2 bg-hitman-700/50 hover:bg-hitman-600/50 text-hitman-400 hover:text-white rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(weapon.id, weapon.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          weapon.isActive
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        title={weapon.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {weapon.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Weapon Button */}
      <div className="text-center">
        <button
          onClick={handleWeaponCreateNew}
          className="px-6 py-3 bg-gradient-to-r from-accent-red to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
        >
          إضافة سلاح جديد
        </button>
      </div>

      {/* Add/Edit Modal */}
      {weaponViewMode === 'create' || weaponViewMode === 'edit' ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-hitman-800 to-hitman-900 border border-hitman-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">
              {weaponEditingId ? 'تعديل السلاح' : 'إضافة سلاح جديد'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">صورة السلاح <span className="text-red-400">*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleWeaponImageChange} 
                  required={!weaponForm.imageUrl} 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
                {weaponImageUploading && <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>}
                {weaponImagePreview && (
                  <img src={weaponImagePreview} alt="Preview" className="mt-2 rounded max-h-32 border border-hitman-600" />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">اسم السلاح <span className="text-red-400">*</span></label>
                <input 
                  name="name" 
                  value={weaponForm.name} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الوصف</label>
                <textarea
                  name="description"
                  value={weaponForm.description}
                  onChange={(e) => setWeaponForm({...weaponForm, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الضرر <span className="text-red-400">*</span></label>
                <input 
                  name="damage" 
                  type="number" 
                  min="1" 
                  value={weaponForm.damage} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">مكافأة الطاقة</label>
                <input 
                  name="energyBonus" 
                  type="number" 
                  min="0" 
                  value={weaponForm.energyBonus} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">السعر <span className="text-red-400">*</span></label>
                <input 
                  name="price" 
                  type="number" 
                  min="1" 
                  value={weaponForm.price} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الندرة <span className="text-red-400">*</span></label>
                <select 
                  name="rarity" 
                  value={weaponForm.rarity} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value="common">شائع ⭐</option>
                  <option value="uncommon">غير شائع ⭐⭐</option>
                  <option value="rare">نادر ⭐⭐⭐</option>
                  <option value="epic">ملحمي ⭐⭐⭐⭐</option>
                  <option value="legend">أسطوري ⭐⭐⭐⭐⭐</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">النوع <span className="text-red-400">*</span></label>
                <select 
                  name="type" 
                  value={weaponForm.type} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value="melee">قريب</option>
                  <option value="ranged">بعيد</option>
                  <option value="explosive">تفجيري</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة <span className="text-red-400">*</span></label>
                <select 
                  name="isActive" 
                  value={weaponForm.isActive ? 'active' : 'inactive'} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">العملة <span className="text-red-400">*</span></label>
                <select 
                  name="currency" 
                  value={weaponForm.currency} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value="money">مال عادي</option>
                  <option value="blackcoin">عملة سوداء</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={createWeaponMutation.isPending || updateWeaponMutation.isPending || weaponImageUploading}
                className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60"
              >
                {createWeaponMutation.isPending || updateWeaponMutation.isPending ? (weaponEditingId ? 'جاري التحديث...' : 'جاري الإنشاء...') : (weaponEditingId ? 'تحديث السلاح' : 'إنشاء السلاح')}
              </button>
              <button
                type="button"
                onClick={handleWeaponCancel}
                className="px-6 py-2 rounded bg-hitman-700 hover:bg-hitman-600 text-white font-bold transition-colors duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-hitman-400 text-lg">لا توجد أسلحة. قم بإنشاء أول سلاح!</p>
        </div>
      )}
    </div>
  );
} 