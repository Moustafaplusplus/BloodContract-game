import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useHud } from '@/hooks/useHud';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Target, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Calendar,
  Award,
  LogOut,
  UserCheck,
  Users,
  Building,
  GraduationCap,
  Crown
} from 'lucide-react';

export default function Jobs() {
  const { stats, invalidateHud } = useHud();
  const [hiringJobId, setHiringJobId] = useState(null);
  const [quittingJob, setQuittingJob] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available jobs
  const {
    data: availableJobs = [],
    isLoading: jobsLoading,
    error: jobsError
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch current job
  const {
    data: currentJobData,
    isLoading: currentJobLoading,
    error: currentJobError
  } = useQuery({
    queryKey: ['currentJob'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch current job');
      return response.json();
    },
    staleTime: 1 * 60 * 1000,
  });



  // Hire mutation
  const hireMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await fetch('/api/jobs/hire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({ jobId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to hire');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setHiringJobId(null);
      invalidateHud?.();
      queryClient.invalidateQueries(['currentJob']);
      toast.success(data.message || 'تم التوظيف بنجاح!');
    },
    onError: (error) => {
      setHiringJobId(null);
      toast.error(error.message || 'فشل في التوظيف');
    }
  });

  // Quit mutation
  const quitMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/jobs/quit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to quit job');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setQuittingJob(false);
      invalidateHud?.();
      queryClient.invalidateQueries(['currentJob']);
      queryClient.invalidateQueries(['jobHistory']);
      
      if (data.unpaidSalary > 0) {
        toast.success(`${data.message} تم استلام ${data.unpaidSalary}$ كراتب متأخر`);
      } else {
        toast.success(data.message || 'تم الاستقالة بنجاح');
      }
    },
    onError: (error) => {
      setQuittingJob(false);
      toast.error(error.message || 'فشل في الاستقالة');
    }
  });

  const handleHire = (jobId) => {
    if (currentJobData?.currentJob) {
      toast.error('يجب الاستقالة من وظيفتك الحالية أولاً');
      return;
    }
    setHiringJobId(jobId);
    hireMutation.mutate(jobId);
  };

  const handleQuit = () => {
    setQuittingJob(true);
    quitMutation.mutate();
  };

  if (jobsLoading || currentJobLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <Briefcase className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل الوظائف...
          </p>
        </div>
      </div>
    );
  }

  if (jobsError || currentJobError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-accent-red/30 rounded-xl p-8">
          <AlertCircle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-hitman-300">فشل في تحميل بيانات الوظائف</p>
        </div>
      </div>
    );
  }

  const currentJob = currentJobData?.currentJob;

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="hitman-background opacity-30"></div>
        <div className="background-grid"></div>
      </div>

      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <img src="/placeholder-jobs-banner.png" alt="Jobs Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center">
          <Briefcase className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">الوظائف</h1>
          <p className="text-hitman-300 text-lg">ابحث عن وظيفة مناسبة وابدأ حياتك المهنية</p>
        </div>
      </div>

      {/* Current Job Status */}
      {currentJob && currentJob.jobInfo && (
        <div className="max-w-4xl mx-auto mb-8 animate-slide-up">
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-green-700 rounded-lg flex items-center justify-center mr-4">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentJob.jobInfo.name}</h2>
                  <p className="text-hitman-300">{currentJob.jobInfo.description}</p>
                </div>
              </div>
              <button
                onClick={handleQuit}
                disabled={quittingJob}
                className="bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center disabled:opacity-60"
              >
                {quittingJob ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الاستقالة...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    استقالة
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-hitman-800/30 rounded-lg p-4 text-center">
                <DollarSign className="w-6 h-6 text-accent-green mx-auto mb-2" />
                <div className="text-xl font-bold text-accent-green">{currentJob.jobInfo.salary}$</div>
                <div className="text-sm text-hitman-400">الراتب اليومي</div>
              </div>
              <div className="bg-hitman-800/30 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 text-accent-blue mx-auto mb-2" />
                <div className="text-xl font-bold text-accent-blue">+{currentJob.jobInfo.expPerDay}</div>
                <div className="text-sm text-hitman-400">الخبرة اليومية</div>
              </div>
              <div className="bg-hitman-800/30 rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 text-accent-yellow mx-auto mb-2" />
                <div className="text-xl font-bold text-accent-yellow">{currentJob.daysWorked}</div>
                <div className="text-sm text-hitman-400">أيام العمل</div>
              </div>
              <div className="bg-hitman-800/30 rounded-lg p-4 text-center">
                <DollarSign className="w-6 h-6 text-accent-green mx-auto mb-2" />
                <div className="text-xl font-bold text-accent-green">{currentJob.totalEarned}$</div>
                <div className="text-sm text-hitman-400">إجمالي الأرباح</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Statistics */}
      {stats && (
        <div className="max-w-4xl mx-auto mb-8 animate-slide-up">
          <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-accent-red mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              إحصائيات الوظائف
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">{stats.totalJobs}</div>
                <div className="text-sm text-hitman-400">الوظائف السابقة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-green">{stats.totalEarned}$</div>
                <div className="text-sm text-hitman-400">إجمالي الأرباح</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-blue">{stats.totalExpEarned}</div>
                <div className="text-sm text-hitman-400">إجمالي الخبرة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-yellow">{stats.totalDaysWorked}</div>
                <div className="text-sm text-hitman-400">أيام العمل</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Jobs */}
      {!currentJob && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-accent-red mb-6 text-center">الوظائف المتاحة</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {availableJobs.map((job) => {
              const isHiring = hiringJobId === job.id;
              const canHire = stats && stats.level >= job.minLevel;
              
              return (
                <div 
                  key={job.id} 
                  className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up hover:scale-105"
                >
                  {/* Job Header */}
                  <div className="text-center mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      job.tier === 1 ? 'bg-gradient-to-br from-accent-green to-green-700' :
                      job.tier === 2 ? 'bg-gradient-to-br from-accent-blue to-blue-700' :
                      job.tier === 3 ? 'bg-gradient-to-br from-accent-yellow to-yellow-700' :
                      job.tier === 4 ? 'bg-gradient-to-br from-accent-orange to-orange-700' :
                      'bg-gradient-to-br from-accent-red to-red-700'
                    }`}>
                      {job.tier === 1 ? <Users className="w-6 h-6 text-white" /> :
                       job.tier === 2 ? <Building className="w-6 h-6 text-white" /> :
                       job.tier === 3 ? <GraduationCap className="w-6 h-6 text-white" /> :
                       job.tier === 4 ? <Crown className="w-6 h-6 text-white" /> :
                       <Crown className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{job.name}</h3>
                    <p className="text-hitman-300 text-sm mb-2">{job.description}</p>
                    <div className="flex items-center justify-center text-xs text-hitman-400">
                      <Target className="w-3 h-3 mr-1" />
                      <span>المستوى المطلوب: {job.minLevel}</span>
                    </div>
                  </div>

                  {/* Job Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-hitman-300 text-sm">الراتب اليومي:</span>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-accent-green mr-1" />
                        <span className="font-bold text-accent-green">{job.salary}$</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-hitman-300 text-sm">الخبرة اليومية:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-accent-blue mr-1" />
                        <span className="font-bold text-accent-blue">+{job.expPerDay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hire Button */}
                  <button
                    onClick={() => handleHire(job.id)}
                    disabled={!canHire || isHiring}
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center ${
                      canHire && !isHiring
                        ? 'bg-gradient-to-r from-accent-green to-green-700 hover:from-green-600 hover:to-green-800 text-white transform hover:scale-105 hover:shadow-lg'
                        : 'bg-hitman-700 text-hitman-400 cursor-not-allowed'
                    }`}
                  >
                    {isHiring ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري التوظيف...
                      </>
                    ) : canHire ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        توظف الآن
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        المستوى {job.minLevel} مطلوب
                      </>
                    )}
                  </button>

                  {/* Tier Badge */}
                  <div className="mt-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      job.tier === 1 ? 'bg-green-600 text-white' :
                      job.tier === 2 ? 'bg-blue-600 text-white' :
                      job.tier === 3 ? 'bg-yellow-600 text-black' :
                      job.tier === 4 ? 'bg-orange-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      المستوى {job.tier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="max-w-2xl mx-auto mt-12 animate-fade-in">
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-accent-red mb-3">معلومات مهمة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-hitman-300">
            <div className="flex items-center justify-center">
              <Clock className="w-4 h-4 text-accent-yellow mr-2" />
              <span>الراتب يدفع يومياً</span>
            </div>
            <div className="flex items-center justify-center">
              <Target className="w-4 h-4 text-accent-red mr-2" />
              <span>لا يمكن العمل في وظيفتين</span>
            </div>
            <div className="flex items-center justify-center">
              <Star className="w-4 h-4 text-accent-blue mr-2" />
              <span>الخبرة تساعدك على التطور</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 