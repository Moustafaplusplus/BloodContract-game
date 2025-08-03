import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Home, Plus, Edit, Trash2, Shield, Heart, Zap, Activity, Trophy, Search, Ban, CheckCircle } from 'lucide-react';

export default function HouseManagement() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState({
    name: '',
    description: '',
    cost: 1000,
    defenseBonus: 0,
    hpBonus: 0,
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
        <p className="text-white">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bouya mb-4 text-white">
          إدارة المنازل
        </h2>
        <p className="text-white">إدارة وتخصيص المنازل في اللعبة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Home className="w-8 h-8 text-accent-green mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{totalHouses}</h3>
          <p className="text-white text-sm">إجمالي المنازل</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Activity className="w-8 h-8 text-accent-blue mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{activeHouses}</h3>
          <p className="text-white text-sm">المنازل النشطة</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{averagePrice}</h3>
          <p className="text-white text-sm">متوسط السعر</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Zap className="w-8 h-8 text-accent-purple mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{averageCapacity}</h3>
          <p className="text-white text-sm">متوسط السعة</p>
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
              placeholder="البحث في المنازل..."
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
            <option value="apartment">شقة</option>
            <option value="house">منزل</option>
            <option value="mansion">قصر</option>
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

      {/* Houses Table */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-white font-bold">المنزل</th>
                <th className="px-6 py-4 text-right text-white font-bold">النوع</th>
                <th className="px-6 py-4 text-right text-white font-bold">السعر</th>
                <th className="px-6 py-4 text-right text-white font-bold">السعة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الحالة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {filteredHouses?.map((house) => (
                <tr key={house.id} className="hover:bg-hitman-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-green-600 rounded-full flex items-center justify-center">
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{house.name}</div>
                        <div className="text-sm text-hitman-400">{house.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      house.type === 'apartment' ? 'bg-blue-500/20 text-blue-400' :
                      house.type === 'house' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {house.type === 'apartment' ? 'شقة' :
                       house.type === 'house' ? 'منزل' : 'قصر'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{house.price?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white">{house.capacity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      house.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {house.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(house)}
                        className="p-2 bg-hitman-700/50 hover:bg-hitman-600/50 text-hitman-400 hover:text-white rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(house.id, house.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          house.isActive
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        title={house.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {house.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New House Button */}
      <div className="text-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-accent-red to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
        >
          إضافة منزل جديد
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-hitman-800 to-hitman-900 border border-hitman-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">
              {editingHouse ? 'تعديل المنزل' : 'إضافة منزل جديد'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">اسم المنزل</label>
                <input
                  type="text"
                  value={houseForm.name}
                  onChange={(e) => setHouseForm({...houseForm, name: e.target.value})}
                  className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الوصف</label>
                <textarea
                  value={houseForm.description}
                  onChange={(e) => setHouseForm({...houseForm, description: e.target.value})}
                  rows={3}
                  className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">السعر</label>
                  <input
                    type="number"
                    value={houseForm.price}
                    onChange={(e) => setHouseForm({...houseForm, price: parseInt(e.target.value)})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">السعة</label>
                  <input
                    type="number"
                    value={houseForm.capacity}
                    onChange={(e) => setHouseForm({...houseForm, capacity: parseInt(e.target.value)})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">النوع</label>
                  <select
                    value={houseForm.type}
                    onChange={(e) => setHouseForm({...houseForm, type: e.target.value})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  >
                    <option value="apartment">شقة</option>
                    <option value="house">منزل</option>
                    <option value="mansion">قصر</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                  <select
                    value={houseForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setHouseForm({...houseForm, isActive: e.target.value === 'active'})}
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
                {editingHouse ? 'تحديث' : 'إضافة'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingHouse(null);
                  setHouseForm(initialHouseForm);
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