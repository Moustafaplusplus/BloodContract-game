import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Star, Calendar, Coins } from 'lucide-react';

export default function VIPPackageManagement() {
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    durationDays: '',
    price: '',
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch VIP packages
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['vipPackages'],
    queryFn: () => axios.get('/api/admin/vip-packages').then(res => res.data)
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: (data) => axios.post('/api/admin/vip-packages', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vipPackages']);
      toast.success('تم إنشاء باقة VIP بنجاح!');
      handleCancel();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في إنشاء باقة VIP');
    }
  });

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/admin/vip-packages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vipPackages']);
      toast.success('تم تحديث باقة VIP بنجاح!');
      handleCancel();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث باقة VIP');
    }
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/admin/vip-packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['vipPackages']);
      toast.success('تم حذف باقة VIP بنجاح!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في حذف باقة VIP');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...form,
      durationDays: parseInt(form.durationDays),
      price: parseInt(form.price)
    };

    if (editingId) {
      updatePackageMutation.mutate({ id: editingId, data: formData });
    } else {
      createPackageMutation.mutate(formData);
    }
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      durationDays: pkg.durationDays.toString(),
      price: pkg.price.toString(),
      isActive: pkg.isActive
    });
    setViewMode('form');
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه باقة VIP؟')) {
      deletePackageMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      name: '',
      durationDays: '',
      price: '',
      isActive: true
    });
    setViewMode('list');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل باقات VIP...</p>
      </div>
    );
  }

  if (viewMode === 'form') {
    return (
      <div className="max-w-2xl mx-auto">
        <form 
          className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold mb-6 text-accent-yellow text-center">
            {editingId ? 'تعديل باقة VIP' : 'إنشاء باقة VIP جديدة'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm text-hitman-300">اسم الباقة <span className="text-red-400">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                placeholder="مثال: باقة VIP الشهرية"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-hitman-300">مدة العضوية (أيام) <span className="text-red-400">*</span></label>
              <input
                name="durationDays"
                type="number"
                min="1"
                value={form.durationDays}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-hitman-300">السعر (عملة سوداء) <span className="text-red-400">*</span></label>
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                placeholder="100"
              />
            </div>

            <div className="flex items-center">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm text-hitman-300">الباقة نشطة</label>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
              className="flex-1 py-2 rounded bg-accent-yellow hover:bg-yellow-600 text-black font-bold text-lg transition-colors duration-200 disabled:opacity-60"
            >
              {editingId ? 'تحديث الباقة' : 'إنشاء الباقة'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 rounded bg-hitman-700 hover:bg-hitman-600 text-white font-bold transition-colors duration-200"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">إدارة باقات VIP</h2>
        <button
          onClick={() => setViewMode('form')}
          className="bg-accent-yellow hover:bg-yellow-600 text-black px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إنشاء باقة VIP جديدة
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                {pkg.name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-hitman-400">المدة:</span>
                <span className="text-blue-400 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {pkg.durationDays} يوم
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-hitman-400">السعر:</span>
                <span className="text-accent-red font-bold flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {pkg.price} عملة سوداء
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-hitman-400">الحالة:</span>
                <span className={`font-bold ${pkg.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {pkg.isActive ? 'نشطة' : 'غير نشطة'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-hitman-400 text-lg">لا توجد باقات VIP. قم بإنشاء أول باقة VIP!</p>
        </div>
      )}
    </div>
  );
} 