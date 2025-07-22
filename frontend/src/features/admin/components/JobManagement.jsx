import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Briefcase, 
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Star,
  Target,
  Users,
  Building,
  GraduationCap,
  Crown
} from 'lucide-react';

export default function JobManagement() {
  const queryClient = useQueryClient();
  
  // Job management state
  const [jobViewMode, setJobViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [jobForm, setJobForm] = useState({
    name: '',
    description: '',
    tier: 1,
    minLevel: 1,
    salary: 50,
    expPerDay: 10,
    isEnabled: true,
  });
  const [jobEditingId, setJobEditingId] = useState(null);

  // Fetch all jobs for admin
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => axios.get('/api/jobs/admin').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Job mutations
  const createJobMutation = useMutation({
    mutationFn: (data) => axios.post('/api/jobs/admin', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-jobs']);
      toast.success('تم إنشاء الوظيفة بنجاح!');
      resetJobForm();
      setJobViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في إنشاء الوظيفة');
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/jobs/admin/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-jobs']);
      toast.success('تم تحديث الوظيفة بنجاح!');
      resetJobForm();
      setJobViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في تحديث الوظيفة');
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/jobs/admin/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-jobs']);
      toast.success('تم حذف الوظيفة بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في حذف الوظيفة');
    },
  });

  // Job management helper functions
  const resetJobForm = () => {
    setJobForm({
      name: '',
      description: '',
      tier: 1,
      minLevel: 1,
      salary: 50,
      expPerDay: 10,
      isEnabled: true,
    });
    setJobEditingId(null);
  };

  const handleJobChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      if (jobEditingId) {
        await updateJobMutation.mutateAsync({ id: jobEditingId, data: jobForm });
      } else {
        await createJobMutation.mutateAsync(jobForm);
      }
    } catch {
      // Error is handled by mutation
    }
  };

  const handleJobEdit = (job) => {
    setJobForm({
      name: job.name,
      description: job.description,
      tier: job.tier,
      minLevel: job.minLevel,
      salary: job.salary,
      expPerDay: job.expPerDay,
      isEnabled: job.isEnabled,
    });
    setJobEditingId(job.id);
    setJobViewMode('edit');
  };

  const handleJobDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
      await deleteJobMutation.mutateAsync(id);
    }
  };

  const handleJobCreateNew = () => {
    resetJobForm();
    setJobViewMode('create');
  };

  const handleJobCancel = () => {
    resetJobForm();
    setJobViewMode('list');
  };

  // Tier colors and icons
  const tierColors = {
    1: 'text-green-400',
    2: 'text-blue-400',
    3: 'text-yellow-400',
    4: 'text-orange-400',
    5: 'text-red-400'
  };

  const tierIcons = {
    1: Users,
    2: Building,
    3: GraduationCap,
    4: Crown,
    5: Crown
  };

  const tierNames = {
    1: 'مبتدئ',
    2: 'متوسط',
    3: 'متقدم',
    4: 'خبير',
    5: 'أسطوري'
  };

  if (jobsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل الوظائف...</p>
      </div>
    );
  }

  return (
    <div>
      {jobViewMode === 'list' ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة الوظائف</h2>
            <button
              onClick={handleJobCreateNew}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء وظيفة جديدة
            </button>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const TierIcon = tierIcons[job.tier];
              return (
                <div key={job.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        job.tier === 1 ? 'bg-gradient-to-br from-green-600 to-green-700' :
                        job.tier === 2 ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                        job.tier === 3 ? 'bg-gradient-to-br from-yellow-600 to-yellow-700' :
                        job.tier === 4 ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                        'bg-gradient-to-br from-red-600 to-red-700'
                      }`}>
                        <TierIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{job.name}</h3>
                        <span className={`text-sm font-bold ${tierColors[job.tier]}`}>
                          {tierNames[job.tier]}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJobEdit(job)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleJobDelete(job.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-hitman-300 text-sm mb-4">{job.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-hitman-400">الراتب اليومي:</span>
                      <span className="text-green-400 font-bold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}$
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hitman-400">الخبرة اليومية:</span>
                      <span className="text-blue-400 font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        +{job.expPerDay}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hitman-400">المستوى المطلوب:</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {job.minLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hitman-400">الحالة:</span>
                      <span className={`font-bold flex items-center gap-1 ${job.isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                        {job.isEnabled ? 'مفعلة' : 'معطلة'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-hitman-400 text-lg">لا توجد وظائف. قم بإنشاء أول وظيفة!</p>
            </div>
          )}
        </>
      ) : (
        /* Job Form */
        <div className="max-w-2xl mx-auto">
          <form
            className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8"
            onSubmit={handleJobSubmit}
          >
            <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">
              {jobEditingId ? 'تعديل الوظيفة' : 'إنشاء وظيفة جديدة'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">اسم الوظيفة <span className="text-red-400">*</span></label>
                <input 
                  name="name" 
                  value={jobForm.name} 
                  onChange={handleJobChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">وصف الوظيفة <span className="text-red-400">*</span></label>
                <textarea 
                  name="description" 
                  value={jobForm.description} 
                  onChange={handleJobChange} 
                  required 
                  rows="3"
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">المستوى <span className="text-red-400">*</span></label>
                <select 
                  name="tier" 
                  value={jobForm.tier} 
                  onChange={handleJobChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value={1}>مبتدئ (1)</option>
                  <option value={2}>متوسط (2)</option>
                  <option value={3}>متقدم (3)</option>
                  <option value={4}>خبير (4)</option>
                  <option value={5}>أسطوري (5)</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">المستوى المطلوب <span className="text-red-400">*</span></label>
                <input 
                  name="minLevel" 
                  type="number" 
                  min="1" 
                  value={jobForm.minLevel} 
                  onChange={handleJobChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الراتب اليومي <span className="text-red-400">*</span></label>
                <input 
                  name="salary" 
                  type="number" 
                  min="1" 
                  value={jobForm.salary} 
                  onChange={handleJobChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">الخبرة اليومية <span className="text-red-400">*</span></label>
                <input 
                  name="expPerDay" 
                  type="number" 
                  min="1" 
                  value={jobForm.expPerDay} 
                  onChange={handleJobChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-hitman-300">
                  <input 
                    name="isEnabled" 
                    type="checkbox" 
                    checked={jobForm.isEnabled} 
                    onChange={handleJobChange} 
                    className="w-4 h-4 text-accent-red bg-hitman-700 border-hitman-600 rounded focus:ring-accent-red focus:ring-2"
                  />
                  تفعيل الوظيفة
                </label>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={createJobMutation.isPending || updateJobMutation.isPending}
                className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60"
              >
                {createJobMutation.isPending || updateJobMutation.isPending ? (jobEditingId ? 'جاري التحديث...' : 'جاري الإنشاء...') : (jobEditingId ? 'تحديث الوظيفة' : 'إنشاء الوظيفة')}
              </button>
              <button
                type="button"
                onClick={handleJobCancel}
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