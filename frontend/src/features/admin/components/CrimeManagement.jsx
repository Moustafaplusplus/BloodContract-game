import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Target, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CrimeManagement() {
  const queryClient = useQueryClient();
  
  // Crime management state
  const [crimeViewMode, setCrimeViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [crimeForm, setCrimeForm] = useState({
    name: '',
    description: '',
    req_level: 1,
    energyCost: 5,
    successRate: 0.5,
    minReward: 50,
    maxReward: 150,
    cooldown: 60,
    expReward: 50,
    imageUrl: '',
    failOutcome: 'both',
    jailMinutes: 3,
    hospitalMinutes: 2,
    isEnabled: true,
  });
  const [crimeEditingId, setCrimeEditingId] = useState(null);
  const [crimeImageUploading, setCrimeImageUploading] = useState(false);
  const [crimeImagePreview, setCrimeImagePreview] = useState('');

  // Fetch all crimes for admin
  const { data: crimes = [], isLoading: crimesLoading } = useQuery({
    queryKey: ['admin-crimes'],
    queryFn: () => axios.get('/api/crimes/admin').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Crime mutations
  const createCrimeMutation = useMutation({
    mutationFn: (data) => axios.post('/api/crimes', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-crimes']);
      toast.success('تم إنشاء الجريمة بنجاح!');
      resetCrimeForm();
      setCrimeViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في إنشاء الجريمة');
    },
  });

  const updateCrimeMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/crimes/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-crimes']);
      toast.success('تم تحديث الجريمة بنجاح!');
      resetCrimeForm();
      setCrimeViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في تحديث الجريمة');
    },
  });

  const deleteCrimeMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/crimes/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-crimes']);
      toast.success('تم حذف الجريمة بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في حذف الجريمة');
    },
  });

  // Crime management helper functions
  const resetCrimeForm = () => {
    setCrimeForm({
      name: '',
      description: '',
      req_level: 1,
      energyCost: 5,
      successRate: 0.5,
      minReward: 50,
      maxReward: 150,
      cooldown: 60,
      expReward: 50,
      imageUrl: '',
      failOutcome: 'both',
      jailMinutes: 3,
      hospitalMinutes: 2,
      isEnabled: true,
    });
    setCrimeImagePreview('');
    setCrimeEditingId(null);
  };

  const handleCrimeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCrimeForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleCrimeImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCrimeImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post('/api/crimes/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setCrimeForm((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
      setCrimeImagePreview(URL.createObjectURL(file));
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في رفع الصورة');
    } finally {
      setCrimeImageUploading(false);
    }
  };

  const handleCrimeSubmit = async (e) => {
    e.preventDefault();
    if (!crimeForm.imageUrl) {
      toast.error('يرجى رفع صورة للجريمة.');
      return;
    }

    try {
      if (crimeEditingId) {
        await updateCrimeMutation.mutateAsync({ id: crimeEditingId, data: crimeForm });
      } else {
        await createCrimeMutation.mutateAsync(crimeForm);
      }
    } catch {
      // Error is handled by mutation
    }
  };

  const handleCrimeEdit = (crime) => {
    setCrimeForm({
      name: crime.name,
      description: crime.description,
      req_level: crime.req_level,
      energyCost: crime.energyCost,
      successRate: crime.successRate,
      minReward: crime.minReward,
      maxReward: crime.maxReward,
      cooldown: crime.cooldown,
      expReward: crime.expReward,
      imageUrl: crime.imageUrl,
      failOutcome: crime.failOutcome,
      jailMinutes: crime.jailMinutes,
      hospitalMinutes: crime.hospitalMinutes,
      isEnabled: crime.isEnabled,
    });
    setCrimeImagePreview(crime.imageUrl ? crime.imageUrl : '');
    setCrimeEditingId(crime.id);
    setCrimeViewMode('edit');
  };

  const handleCrimeDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الجريمة؟')) {
      await deleteCrimeMutation.mutateAsync(id);
    }
  };

  const handleCrimeCreateNew = () => {
    resetCrimeForm();
    setCrimeViewMode('create');
  };

  const handleCrimeCancel = () => {
    resetCrimeForm();
    setCrimeViewMode('list');
  };

  if (crimesLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل الجرائم...</p>
      </div>
    );
  }

  return (
    <div>
      {crimeViewMode === 'list' ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة الجرائم</h2>
            <button
              onClick={handleCrimeCreateNew}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء جريمة جديدة
            </button>
          </div>

          {/* Crimes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {crimes.map((crime) => (
              <div key={crime.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{crime.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCrimeEdit(crime)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCrimeDelete(crime.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-hitman-300">{crime.description}</p>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">المستوى المطلوب:</span>
                    <span className="text-white">{crime.req_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">معدل النجاح:</span>
                    <span className="text-white">{(crime.successRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">المكافأة:</span>
                    <span className="text-green-400">${crime.minReward}-${crime.maxReward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">الحالة:</span>
                    <span className={`flex items-center gap-1 ${crime.isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                      {crime.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {crime.isEnabled ? 'مفعلة' : 'معطلة'}
                    </span>
                  </div>
                </div>

                {crime.imageUrl && (
                  <img 
                    src={crime.imageUrl}
                    alt={crime.name} 
                    className="w-full h-32 object-cover rounded mt-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {crimes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-hitman-400 text-lg">لا توجد جرائم. قم بإنشاء أول جريمة!</p>
            </div>
          )}
        </>
      ) : (
        /* Crime Form */
        <div className="max-w-2xl mx-auto">
          <form
            className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8"
            onSubmit={handleCrimeSubmit}
          >
            <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">
              {crimeEditingId ? 'تعديل الجريمة' : 'إنشاء جريمة جديدة'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">صورة الجريمة <span className="text-red-400">*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCrimeImageChange} 
                  required={!crimeForm.imageUrl} 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
                {crimeImageUploading && <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>}
                {crimeImagePreview && (
                  <img src={crimeImagePreview} alt="Preview" className="mt-2 rounded max-h-32 border border-hitman-600" />
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">الوصف <span className="text-red-400">*</span></label>
                <textarea 
                  name="description" 
                  value={crimeForm.description} 
                  onChange={handleCrimeChange} 
                  required 
                  rows={2} 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الاسم</label>
                <input 
                  name="name" 
                  value={crimeForm.name} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">المستوى المطلوب</label>
                <input 
                  name="req_level" 
                  type="number" 
                  min="1" 
                  value={crimeForm.req_level} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">تكلفة الطاقة</label>
                <input 
                  name="energyCost" 
                  type="number" 
                  min="1" 
                  value={crimeForm.energyCost} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">معدل النجاح (0.01 - 0.99)</label>
                <input 
                  name="successRate" 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  max="0.99" 
                  value={crimeForm.successRate} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الحد الأدنى للمكافأة</label>
                <input 
                  name="minReward" 
                  type="number" 
                  min="0" 
                  value={crimeForm.minReward} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الحد الأقصى للمكافأة</label>
                <input 
                  name="maxReward" 
                  type="number" 
                  min="0" 
                  value={crimeForm.maxReward} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">وقت الانتظار (ثواني)</label>
                <input 
                  name="cooldown" 
                  type="number" 
                  min="0" 
                  value={crimeForm.cooldown} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">مكافأة الخبرة</label>
                <input 
                  name="expReward" 
                  type="number" 
                  min="1" 
                  value={crimeForm.expReward} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">نتيجة الفشل</label>
                <select 
                  name="failOutcome" 
                  value={crimeForm.failOutcome} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value="jail">السجن</option>
                  <option value="hospital">المستشفى</option>
                  <option value="both">كلاهما</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">دقائق السجن</label>
                <input 
                  name="jailMinutes" 
                  type="number" 
                  min="0" 
                  value={crimeForm.jailMinutes} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">دقائق المستشفى</label>
                <input 
                  name="hospitalMinutes" 
                  type="number" 
                  min="0" 
                  value={crimeForm.hospitalMinutes} 
                  onChange={handleCrimeChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input 
                    name="isEnabled" 
                    type="checkbox" 
                    checked={crimeForm.isEnabled} 
                    onChange={handleCrimeChange} 
                    className="rounded border-hitman-600 bg-hitman-700" 
                  />
                  <span className="text-sm text-hitman-300">مفعلة</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={createCrimeMutation.isPending || updateCrimeMutation.isPending || crimeImageUploading}
                className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60"
              >
                {createCrimeMutation.isPending || updateCrimeMutation.isPending ? (crimeEditingId ? 'جاري التحديث...' : 'جاري الإنشاء...') : (crimeEditingId ? 'تحديث الجريمة' : 'إنشاء الجريمة')}
              </button>
              <button
                type="button"
                onClick={handleCrimeCancel}
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