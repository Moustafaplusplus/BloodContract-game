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
  DollarSign,
  Heart
} from 'lucide-react';

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
        <p className="text-white">جاري تحميل الدروع...</p>
      </div>
    );
  }

  return (
    <div>
      {armorViewMode === 'list' ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة الدروع</h2>
            <button
              onClick={handleArmorCreateNew}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء درع جديد
            </button>
          </div>

          {/* Armors Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {armors.map((armor) => (
              <div key={armor.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{armor.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleArmorEdit(armor)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArmorDelete(armor.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-hitman-400">الدفاع:</span>
                    <span className="text-blue-400 font-bold">{armor.def}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">مكافأة الصحة:</span>
                    <span className="text-green-400 font-bold">+{armor.hpBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">السعر:</span>
                    <span className="text-green-400 font-bold">
                      {armor.currency === 'blackcoin' ? (
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-4 h-4 rounded-full bg-black border border-accent-red flex items-center justify-center">
                            <span className="text-xs text-accent-red font-bold">ع</span>
                          </span>
                          {armor.price}
                        </span>
                      ) : (
                        `$${armor.price}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">الندرة:</span>
                    <span className={`font-bold ${rarityColors[armor.rarity]}`}>
                      {rarityIcons[armor.rarity]} {armor.rarity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">العملة:</span>
                    <span className={`font-bold ${armor.currency === 'blackcoin' ? 'text-accent-red' : 'text-green-400'}`}>
                      {armor.currency === 'blackcoin' ? 'عملة سوداء' : 'مال'}
                    </span>
                  </div>
                </div>

                {armor.imageUrl && (
                  <img 
                    src={armor.imageUrl}
                    alt={armor.name} 
                    className="w-full h-32 object-cover rounded mt-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {armors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-hitman-400 text-lg">لا توجد دروع. قم بإنشاء أول درع!</p>
            </div>
          )}
        </>
      ) : (
        /* Armor Form */
        <div className="max-w-2xl mx-auto">
          <form
            className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8"
            onSubmit={handleArmorSubmit}
          >
            <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">
              {armorEditingId ? 'تعديل الدرع' : 'إنشاء درع جديد'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">صورة الدرع <span className="text-red-400">*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleArmorImageChange} 
                  required={!armorForm.imageUrl} 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
                {armorImageUploading && <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>}
                {armorImagePreview && (
                  <img src={armorImagePreview} alt="Preview" className="mt-2 rounded max-h-32 border border-hitman-600" />
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">اسم الدرع <span className="text-red-400">*</span></label>
                <input 
                  name="name" 
                  value={armorForm.name} 
                  onChange={handleArmorChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الدفاع <span className="text-red-400">*</span></label>
                <input 
                  name="def" 
                  type="number" 
                  min="1" 
                  value={armorForm.def} 
                  onChange={handleArmorChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">مكافأة الصحة</label>
                <input 
                  name="hpBonus" 
                  type="number" 
                  min="0" 
                  value={armorForm.hpBonus} 
                  onChange={handleArmorChange} 
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
                  value={armorForm.price} 
                  onChange={handleArmorChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الندرة <span className="text-red-400">*</span></label>
                <select 
                  name="rarity" 
                  value={armorForm.rarity} 
                  onChange={handleArmorChange} 
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
                  value={armorForm.currency} 
                  onChange={handleArmorChange} 
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
                disabled={createArmorMutation.isPending || updateArmorMutation.isPending || armorImageUploading}
                className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60"
              >
                {createArmorMutation.isPending || updateArmorMutation.isPending ? (armorEditingId ? 'جاري التحديث...' : 'جاري الإنشاء...') : (armorEditingId ? 'تحديث الدرع' : 'إنشاء الدرع')}
              </button>
              <button
                type="button"
                onClick={handleArmorCancel}
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