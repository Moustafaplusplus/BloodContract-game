import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import MoneyIcon from '@/components/MoneyIcon';
import { Plus, Edit, Trash2, Coins, DollarSign, Gift } from 'lucide-react';

export default function MoneyPackageManagement() {
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    blackcoinCost: '',
    moneyAmount: '',
    bonus: '0',
    description: '',
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch money packages
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['moneyPackages'],
    queryFn: () => axios.get('/api/admin/money-packages').then(res => res.data)
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: (data) => axios.post('/api/admin/money-packages', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['moneyPackages']);
      toast.success('تم إنشاء الباقة بنجاح!');
      handleCancel();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في إنشاء الباقة');
    }
  });

  // Update package mutation
  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/admin/money-packages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['moneyPackages']);
      toast.success('تم تحديث الباقة بنجاح!');
      handleCancel();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث الباقة');
    }
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/admin/money-packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['moneyPackages']);
      toast.success('تم حذف الباقة بنجاح!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'فشل في حذف الباقة');
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
      blackcoinCost: parseInt(form.blackcoinCost),
      moneyAmount: parseInt(form.moneyAmount),
      bonus: parseInt(form.bonus)
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
      blackcoinCost: pkg.blackcoinCost.toString(),
      moneyAmount: pkg.moneyAmount.toString(),
      bonus: pkg.bonus.toString(),
      description: pkg.description || '',
      isActive: pkg.isActive
    });
    setViewMode('form');
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
      deletePackageMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      name: '',
      blackcoinCost: '',
      moneyAmount: '',
      bonus: '0',
      description: '',
      isActive: true
    });
    setViewMode('list');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل باقات المال...</p>
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
          <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">
            {editingId ? 'تعديل باقة المال' : 'إنشاء باقة مال جديدة'}
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
                placeholder="مثال: باقة المبتدئ"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-hitman-300">تكلفة العملة السوداء <span className="text-red-400">*</span></label>
              <input
                name="blackcoinCost"
                type="number"
                min="1"
                value={form.blackcoinCost}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-hitman-300">كمية المال <span className="text-red-400">*</span></label>
              <input
                name="moneyAmount"
                type="number"
                min="1"
                value={form.moneyAmount}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-hitman-300">المكافأة الإضافية</label>
              <input
                name="bonus"
                type="number"
                min="0"
                value={form.bonus}
                onChange={handleChange}
                className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm text-hitman-300">الوصف</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                placeholder="وصف الباقة (اختياري)"
                rows="3"
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
              className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60"
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
        <h2 className="text-2xl font-bold text-white">إدارة باقات المال</h2>
        <button
          onClick={() => setViewMode('form')}
          className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إنشاء باقة جديدة
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
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

            {pkg.description && (
              <p className="text-sm text-hitman-400 mb-3">{pkg.description}</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-hitman-400">التكلفة:</span>
                <span className="text-accent-red font-bold flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {pkg.blackcoinCost}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-hitman-400">المال:</span>
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <MoneyIcon className="w-3 h-3" />
                  {pkg.moneyAmount.toLocaleString()}
                </span>
              </div>
              {pkg.bonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-hitman-400">المكافأة:</span>
                  <span className="text-yellow-400 font-bold flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    +{pkg.bonus.toLocaleString()}
                  </span>
                </div>
              )}
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
          <p className="text-hitman-400 text-lg">لا توجد باقات مال. قم بإنشاء أول باقة!</p>
        </div>
      )}
    </div>
  );
} 