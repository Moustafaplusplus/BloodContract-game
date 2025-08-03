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
  EyeOff,
  Activity,
  Trophy,
  Zap,
  Search,
  Ban,
  CheckCircle
} from 'lucide-react';

export default function CrimeManagement() {
  const queryClient = useQueryClient();
  
  const [crimeViewMode, setCrimeViewMode] = useState('list');
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

  const { data: crimes = [], isLoading: crimesLoading } = useQuery({
    queryKey: ['admin-crimes'],
    queryFn: () => axios.get('/api/crimes/admin').then(res => res.data),
    staleTime: 30 * 1000,
  });

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
        <p className="text-white">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bouya mb-4 text-white">
          إدارة الجرائم
        </h2>
        <p className="text-white">إدارة وتخصيص الجرائم في اللعبة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Target className="w-8 h-8 text-accent-red mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{totalCrimes}</h3>
          <p className="text-white text-sm">إجمالي الجرائم</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Activity className="w-8 h-8 text-accent-green mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{activeCrimes}</h3>
          <p className="text-white text-sm">الجرائم النشطة</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{averageReward}</h3>
          <p className="text-white text-sm">متوسط المكافأة</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
          <Zap className="w-8 h-8 text-accent-blue mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">{averageEnergy}</h3>
          <p className="text-white text-sm">متوسط الطاقة المطلوبة</p>
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
              placeholder="البحث في الجرائم..."
              className="w-full bg-hitman-800/50 border border-hitman-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-hitman-400 focus:border-accent-red focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-hitman-800/50 border border-hitman-700 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
          >
            <option value="">جميع المستويات</option>
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
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

      {/* Crimes Table */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-white font-bold">الجرائم</th>
                <th className="px-6 py-4 text-right text-white font-bold">المستوى</th>
                <th className="px-6 py-4 text-right text-white font-bold">المكافأة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الطاقة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الحالة</th>
                <th className="px-6 py-4 text-right text-white font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {filteredCrimes?.map((crime) => (
                <tr key={crime.id} className="hover:bg-hitman-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-red to-red-600 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{crime.name}</div>
                        <div className="text-sm text-hitman-400">{crime.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      crime.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      crime.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {crime.difficulty === 'easy' ? 'سهل' :
                       crime.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{crime.reward?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white">{crime.energy}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      crime.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {crime.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(crime)}
                        className="p-2 bg-hitman-700/50 hover:bg-hitman-600/50 text-hitman-400 hover:text-white rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(crime.id, crime.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          crime.isActive
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        title={crime.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        {crime.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Crime Button */}
      <div className="text-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-accent-red to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
        >
          إضافة جريمة جديدة
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-hitman-800 to-hitman-900 border border-hitman-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">
              {editingCrime ? 'تعديل الجريمة' : 'إضافة جريمة جديدة'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">اسم الجريمة</label>
                <input
                  type="text"
                  value={crimeForm.name}
                  onChange={(e) => setCrimeForm({...crimeForm, name: e.target.value})}
                  className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الوصف</label>
                <textarea
                  value={crimeForm.description}
                  onChange={(e) => setCrimeForm({...crimeForm, description: e.target.value})}
                  rows={3}
                  className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">المكافأة</label>
                  <input
                    type="number"
                    value={crimeForm.reward}
                    onChange={(e) => setCrimeForm({...crimeForm, reward: parseInt(e.target.value)})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">الطاقة المطلوبة</label>
                  <input
                    type="number"
                    value={crimeForm.energy}
                    onChange={(e) => setCrimeForm({...crimeForm, energy: parseInt(e.target.value)})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">المستوى</label>
                  <select
                    value={crimeForm.difficulty}
                    onChange={(e) => setCrimeForm({...crimeForm, difficulty: e.target.value})}
                    className="w-full bg-hitman-700/50 border border-hitman-600 rounded-lg px-4 py-3 text-white focus:border-accent-red focus:outline-none"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                  <select
                    value={crimeForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setCrimeForm({...crimeForm, isActive: e.target.value === 'active'})}
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
                {editingCrime ? 'تحديث' : 'إضافة'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCrime(null);
                  setCrimeForm(initialCrimeForm);
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