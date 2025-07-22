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
  DollarSign,
  Zap
} from 'lucide-react';

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
        <p className="text-white">جاري تحميل الأسلحة...</p>
      </div>
    );
  }

  return (
    <div>
      {weaponViewMode === 'list' ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة الأسلحة</h2>
            <button
              onClick={handleWeaponCreateNew}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء سلاح جديد
            </button>
          </div>

          {/* Weapons Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weapons.map((weapon) => (
              <div key={weapon.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{weapon.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWeaponEdit(weapon)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleWeaponDelete(weapon.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-hitman-400">الضرر:</span>
                    <span className="text-red-400 font-bold">{weapon.damage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">مكافأة الطاقة:</span>
                    <span className="text-yellow-400 font-bold">+{weapon.energyBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">السعر:</span>
                    <span className="text-green-400 font-bold">
                      {weapon.currency === 'blackcoin' ? (
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-4 h-4 rounded-full bg-black border border-accent-red flex items-center justify-center">
                            <span className="text-xs text-accent-red font-bold">ع</span>
                          </span>
                          {weapon.price}
                        </span>
                      ) : (
                        `$${weapon.price}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">الندرة:</span>
                    <span className={`font-bold ${rarityColors[weapon.rarity]}`}>
                      {rarityIcons[weapon.rarity]} {weapon.rarity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">العملة:</span>
                    <span className={`font-bold ${weapon.currency === 'blackcoin' ? 'text-accent-red' : 'text-green-400'}`}>
                      {weapon.currency === 'blackcoin' ? 'عملة سوداء' : 'مال'}
                    </span>
                  </div>
                </div>

                {weapon.imageUrl && (
                  <img 
                    src={weapon.imageUrl}
                    alt={weapon.name} 
                    className="w-full h-32 object-cover rounded mt-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {weapons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-hitman-400 text-lg">لا توجد أسلحة. قم بإنشاء أول سلاح!</p>
            </div>
          )}
        </>
      ) : (
        /* Weapon Form */
        <div className="max-w-2xl mx-auto">
          <form
            className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8"
            onSubmit={handleWeaponSubmit}
          >
            <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">
              {weaponEditingId ? 'تعديل السلاح' : 'إنشاء سلاح جديد'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">صورة السلاح <span className="text-red-400">*</span></label>
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
              
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">اسم السلاح <span className="text-red-400">*</span></label>
                <input 
                  name="name" 
                  value={weaponForm.name} 
                  onChange={handleWeaponChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الضرر <span className="text-red-400">*</span></label>
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
                <label className="block mb-1 text-sm text-hitman-300">مكافأة الطاقة</label>
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
                <label className="block mb-1 text-sm text-hitman-300">السعر <span className="text-red-400">*</span></label>
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
                <label className="block mb-1 text-sm text-hitman-300">الندرة <span className="text-red-400">*</span></label>
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
                <label className="block mb-1 text-sm text-hitman-300">العملة <span className="text-red-400">*</span></label>
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
          </form>
        </div>
      )}
    </div>
  );
} 