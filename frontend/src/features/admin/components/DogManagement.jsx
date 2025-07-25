import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Dog, Plus, Edit, Trash2 } from 'lucide-react';

export default function DogManagement() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState({
    name: '',
    description: '',
    cost: 1000,
    powerBonus: 0,
    rarity: 'common',
    imageUrl: '',
    currency: 'money',
  });
  const [editingId, setEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const { data: dogs = [], isLoading: dogsLoading } = useQuery({
    queryKey: ['admin-dogs'],
    queryFn: () => axios.get('/api/admin/dogs').then(res => res.data),
    staleTime: 30 * 1000,
  });

  const createDogMutation = useMutation({
    mutationFn: (data) => axios.post('/api/admin/dogs', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-dogs']);
      toast.success('تم إنشاء الكلب بنجاح!');
      resetForm();
      setViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في إنشاء الكلب');
    },
  });

  const updateDogMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/admin/dogs/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-dogs']);
      toast.success('تم تحديث الكلب بنجاح!');
      resetForm();
      setViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في تحديث الكلب');
    },
  });

  const deleteDogMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/admin/dogs/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-dogs']);
      toast.success('تم حذف الكلب بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في حذف الكلب');
    },
  });

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      cost: 1000,
      powerBonus: 0,
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
      const response = await axios.post('/api/admin/dogs/upload-image', formData, {
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
      toast.error('يرجى رفع صورة للكلب.');
      return;
    }
    try {
      if (editingId) {
        await updateDogMutation.mutateAsync({ id: editingId, data: form });
      } else {
        await createDogMutation.mutateAsync(form);
      }
    } catch {}
  };

  const handleEdit = (dog) => {
    setForm({
      name: dog.name,
      description: dog.description,
      cost: dog.cost,
      powerBonus: dog.powerBonus,
      rarity: dog.rarity,
      imageUrl: dog.imageUrl,
      currency: dog.currency,
    });
    setImagePreview(dog.imageUrl ? dog.imageUrl : '');
    setEditingId(dog.id);
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكلب؟')) {
      await deleteDogMutation.mutateAsync(id);
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

  if (dogsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل الكلاب...</p>
      </div>
    );
  }

  return (
    <div>
      {viewMode === 'list' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة الكلاب</h2>
            <button
              onClick={handleCreateNew}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء كلب جديد
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dogs.map((dog) => (
              <div key={dog.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{dog.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dog)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dog.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-hitman-400">قوة الهجوم:</span><span className="text-red-400 font-bold">{dog.powerBonus}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">السعر:</span><span className="text-green-400 font-bold">{dog.currency === 'blackcoin' ? (<span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-full bg-black border border-accent-red flex items-center justify-center"><span className="text-xs text-accent-red font-bold">ع</span></span>{dog.cost}</span>) : (`$${dog.cost}`)}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">الندرة:</span><span className={`font-bold ${rarityColors[dog.rarity]}`}>{rarityIcons[dog.rarity]} {dog.rarity}</span></div>
                  <div className="flex justify-between"><span className="text-hitman-400">العملة:</span><span className={`font-bold ${dog.currency === 'blackcoin' ? 'text-accent-red' : 'text-green-400'}`}>{dog.currency === 'blackcoin' ? 'عملة سوداء' : 'مال'}</span></div>
                </div>
                {dog.imageUrl && (
                  <img src={dog.imageUrl} alt={dog.name} className="w-full h-32 object-cover rounded mt-4" onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
            ))}
          </div>
          {dogs.length === 0 && (
            <div className="text-center py-12"><p className="text-hitman-400 text-lg">لا توجد كلاب. قم بإنشاء أول كلب!</p></div>
          )}
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <form className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">{editingId ? 'تعديل الكلب' : 'إنشاء كلب جديد'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">صورة الكلب <span className="text-red-400">*</span></label>
                <input type="file" accept="image/*" onChange={handleImageChange} required={!form.imageUrl} className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
                {imageUploading && <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>}
                {imagePreview && (<img src={imagePreview} alt="Preview" className="mt-2 rounded max-h-32 border border-hitman-600" />)}
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">اسم الكلب <span className="text-red-400">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">الوصف <span className="text-red-400">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-hitman-300">قوة الهجوم</label>
                <input name="powerBonus" type="number" min="0" value={form.powerBonus} onChange={handleChange} required className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" />
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
              <button type="submit" disabled={createDogMutation.isPending || updateDogMutation.isPending || imageUploading} className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60">
                {createDogMutation.isPending || updateDogMutation.isPending ? (editingId ? 'جاري التحديث...' : 'جاري الإنشاء...') : (editingId ? 'تحديث الكلب' : 'إنشاء الكلب')}
              </button>
              <button type="button" onClick={handleCancel} className="px-6 py-2 rounded bg-hitman-700 hover:bg-hitman-600 text-white font-bold transition-colors duration-200">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 