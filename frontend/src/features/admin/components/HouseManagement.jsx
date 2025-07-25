import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Home, Plus, Edit, Trash2, Shield, Heart, Zap } from 'lucide-react';

export default function HouseManagement() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState({
    name: '',
    description: '',
    cost: 1000,
    defenseBonus: 0,
    hpBonus: 0,
    energyRegen: 0,
    rarity: 'common',
    imageUrl: '',
    currency: 'money',
  });
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const { data: houses = [], isLoading: housesLoading } = useQuery({
    queryKey: ['admin-houses'],
    queryFn: () => axios.get('/api/admin/houses').then(res => res.data),
    staleTime: 30 * 1000,
  });

  const createHouseMutation = useMutation({
    mutationFn: (data) => axios.post('/api/admin/houses', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-houses']);
      toast.success('تم إنشاء المنزل بنجاح!');
      resetForm();
      setViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في إنشاء المنزل');
    },
  });

  const updateHouseMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/admin/houses/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-houses']);
      toast.success('تم تحديث المنزل بنجاح!');
      resetForm();
      setViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في تحديث المنزل');
    },
  });

  const deleteHouseMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/admin/houses/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-houses']);
      toast.success('تم حذف المنزل بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في حذف المنزل');
    },
  });

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      cost: 1000,
      defenseBonus: 0,
      hpBonus: 0,
      energyRegen: 0,
      rarity: 'common',
      imageUrl: '',
      currency: 'money',
    });
    setImagePreview('');
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post('/api/admin/houses/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
      setImagePreview(URL.createObjectURL(file));
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في رفع الصورة');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) {
      toast.error('يرجى رفع صورة للمنزل.');
      return;
    }
    try {
      if (editingId) {
        await updateHouseMutation.mutateAsync({ id: editingId, data: form });
      } else {
        await createHouseMutation.mutateAsync(form);
      }
    } catch {}
  };

  const handleEdit = (house) => {
    setForm({
      name: house.name,
      description: house.description,
      cost: house.cost,
      defenseBonus: house.defenseBonus,
      hpBonus: house.hpBonus,
      energyRegen: house.energyRegen,
      rarity: house.rarity,
      imageUrl: house.imageUrl,
      currency: house.currency,
    });
    setImagePreview(house.imageUrl ? house.imageUrl : '');
    setEditingId(house.id);
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنزل؟')) {
      await deleteHouseMutation.mutateAsync(id);
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setViewMode('create');
  };

  const handleCancel = () => {
    resetForm();
    setViewMode('list');
  };

  const rarityColors = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legend: 'text-yellow-400'
  };
  const rarityIcons = {
    common: '⭐',
    uncommon: '⭐⭐',
    rare: '⭐⭐⭐',
    epic: '⭐⭐⭐⭐',
    legend: '⭐⭐⭐⭐⭐'
  };

  if (housesLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل المنازل...</p>
      </div>
    );
  }

  return (
    <div>
      {viewMode === 'list' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة المنازل</h2>
            <button
              onClick={handleCreateNew}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء منزل جديد
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <div key={house.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{house.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(house)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(house.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-hitman-400">الدفاع:</span><span className="text-blue-400 font-bold">{house.defenseBonus}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">الصحة:</span><span className="text-green-400 font-bold">+{house.hpBonus}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">تجديد الطاقة:</span><span className="text-yellow-400 font-bold">{house.energyRegen}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">السعر:</span><span className="text-green-400 font-bold">{house.currency === 'blackcoin' ? (<span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-full bg-black border border-accent-red flex items-center justify-center"><span className="text-xs text-accent-red font-bold">ع</span></span>{house.cost}</span>) : (`$${house.cost}`)}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">الندرة:</span><span className={`font-bold ${rarityColors[house.rarity]}`}>{rarityIcons[house.rarity]} {house.rarity}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">العملة:</span><span className={`font-bold ${house.currency === 'blackcoin' ? 'text-accent-red' : 'text-green-400'}`}>{house.currency === 'blackcoin' ? 'عملة سوداء' : 'مال'}</span></div>
                </div>
                {house.imageUrl && (
                  <img src={house.imageUrl} alt={house.name} className="w-full h-32 object-cover rounded mt-4" onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
            ))}
          </div>
          {houses.length === 0 && (
            <div className="text-center py-12"><p className="text-hitman-400 text-lg">لا توجد منازل. قم بإنشاء أول منزل!</p></div>
          )}
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <form className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">{editingId ? 'تعديل المنزل' : 'إنشاء منزل جديد'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">صورة المنزل <span className="text-red-400">*</span></label>
                <input type="file" accept="image/*" onChange={handleImageChange} required={!form.imageUrl} className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
                {imageUploading && <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>}
                {imagePreview && (<img src={imagePreview} alt="Preview" className="mt-2 rounded max-h-32 border border-hitman-600" />)}
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">اسم المنزل <span className="text-red-400">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">الوصف <span className="text-red-400">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الدفاع</label>
                <input name="defenseBonus" type="number" min="0" value={form.defenseBonus} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الصحة</label>
                <input name="hpBonus" type="number" min="0" value={form.hpBonus} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-hitman-300">تجديد الطاقة</label>
                <input name="energyRegen" type="number" min="0" value={form.energyRegen} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-hitman-300">السعر <span className="text-red-400">*</span></label>
                <input name="cost" type="number" min="1" value={form.cost} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الندرة <span className="text-red-400">*</span></label>
                <select name="rarity" value={form.rarity} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white">
                  <option value="common">شائع ⭐</option>
                  <option value="uncommon">غير شائع ⭐⭐</option>
                  <option value="rare">نادر ⭐⭐⭐</option>
                  <option value="epic">ملحمي ⭐⭐⭐⭐</option>
                  <option value="legend">أسطوري ⭐⭐⭐⭐⭐</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm text-hitman-300">العملة <span className="text-red-400">*</span></label>
                <select name="currency" value={form.currency} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white">
                  <option value="money">مال عادي</option>
                  <option value="blackcoin">عملة سوداء</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="submit" disabled={createHouseMutation.isPending || updateHouseMutation.isPending || imageUploading} className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60">
                {createHouseMutation.isPending || updateHouseMutation.isPending ? (editingId ? 'جاري التحديث...' : 'جاري الإنشاء...') : (editingId ? 'تحديث المنزل' : 'إنشاء المنزل')}
              </button>
              <button type="button" onClick={handleCancel} className="px-6 py-2 rounded bg-hitman-700 hover:bg-hitman-600 text-white font-bold transition-colors duration-200">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 