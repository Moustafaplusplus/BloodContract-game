import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
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
  Crown,
  ImageIcon,
  Loader,
  User,
  Coins
} from 'lucide-react';

const JobCard = ({ job, onHire, isHiring, canHire, currentJob }) => {
  const tierColors = {
    1: { bg: 'from-green-600 to-green-700', text: 'text-green-400', icon: Users },
    2: { bg: 'from-blue-600 to-blue-700', text: 'text-blue-400', icon: Building },
    3: { bg: 'from-yellow-600 to-yellow-700', text: 'text-yellow-400', icon: GraduationCap },
    4: { bg: 'from-orange-600 to-orange-700', text: 'text-orange-400', icon: Crown },
    5: { bg: 'from-purple-600 to-purple-700', text: 'text-purple-400', icon: Crown }
  };
  
  const tierInfo = tierColors[job.tier] || tierColors[1];
  const TierIcon = tierInfo.icon;

  return (
    <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm hover:border-blood-500/40 transition-all duration-300 hover:scale-[1.02]">
      {/* Job Header */}
      <div className="text-center mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${tierInfo.bg} rounded-lg flex items-center justify-center mx-auto mb-3`}>
          <TierIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{job.name}</h3>
        <p className="text-blood-200 text-sm mb-2 line-clamp-2">{job.description}</p>
        <div className="flex items-center justify-center text-xs text-blood-300">
          <Target className="w-3 h-3 mr-1" />
          <span>المستوى المطلوب: {job.minLevel}</span>
        </div>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-900/20 border border-green-500/20 rounded p-2 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-300">راتب يومي</span>
          </div>
          <div className="text-sm font-bold text-green-400">${job.salary}</div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/20 rounded p-2 text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-300">خبرة يومية</span>
          </div>
          <div className="text-sm font-bold text-blue-400">+{job.expPerDay}</div>
        </div>
      </div>

      {/* Tier Badge */}
      <div className="text-center mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tierInfo.bg} text-white`}>
          المستوى {job.tier}
        </span>
      </div>

      {/* Hire Button */}
      <button
        onClick={() => onHire(job.id)}
        disabled={!canHire || isHiring || currentJob}
        className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm ${
          canHire && !isHiring && !currentJob
            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg hover:shadow-green-500/30'
            : 'bg-gray-600 text-gray-300 cursor-not-allowed transform-none'
        }`}
      >
        {isHiring ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>جاري التوظيف...</span>
          </>
        ) : currentJob ? (
          <>
            <XCircle className="w-4 h-4" />
            <span>لديك وظيفة بالفعل</span>
          </>
        ) : canHire ? (
          <>
            <UserCheck className="w-4 h-4" />
            <span>توظف الآن</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            <span>المستوى {job.minLevel} مطلوب</span>
          </>
        )}
      </button>
    </div>
  );
};

export default function Jobs() {
  const { 
    socket, 
    jobs, 
    hudData,
    requestJobsUpdate 
  } = useSocket();
  const [hiringJobId, setHiringJobId] = useState(null);
  const [quittingJob, setQuittingJob] = useState(false);
  const queryClient = useQueryClient();

  // Request initial jobs data when component mounts
  useEffect(() => {
    if (socket && socket.connected) {
      requestJobsUpdate();
    }
  }, [socket, requestJobsUpdate]);

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

  // Use real-time jobs data if available, otherwise fall back to query
  const currentJobData = jobs?.length > 0 ? jobs[0] : null;
  const currentJobLoading = false;
  const currentJobError = null;

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
      if (socket && socket.connected) {
        requestJobsUpdate();
      }
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
      if (socket && socket.connected) {
        requestJobsUpdate();
      }
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
      <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 flex items-center justify-center p-4">
        <div className="text-center bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 p-8">
          <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل الوظائف...</p>
        </div>
      </div>
    );
  }

  if (jobsError || currentJobError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 flex items-center justify-center p-4">
        <div className="text-center bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 p-8">
          <AlertCircle className="w-16 h-16 text-blood-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-blood-300">فشل في تحميل بيانات الوظائف</p>
        </div>
      </div>
    );
  }

  const currentJob = currentJobData?.currentJob;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 p-2 sm:p-4 space-y-4">
      
      {/* Jobs Header Banner with Background Image */}
      <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
        {/* Background Image Placeholder with 3 Circles Logo */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"20\" cy=\"30\" r=\"3\"/%3E%3Ccircle cx=\"40\" cy=\"30\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الوظائف</h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">ابحث عن وظيفة مناسبة وابدأ حياتك المهنية</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <Briefcase className="w-4 h-4 text-green-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{availableJobs.length}</div>
              <div className="text-xs text-white/80 drop-shadow">Jobs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Job Status */}
      {currentJob && currentJob.jobInfo && (
        <div className="bg-black/80 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentJob.jobInfo.name}</h2>
                <p className="text-blood-200 text-sm">{currentJob.jobInfo.description}</p>
              </div>
            </div>
            <button
              onClick={handleQuit}
              disabled={quittingJob}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center space-x-2 text-sm"
            >
              {quittingJob ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>جاري الاستقالة...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>استقالة</span>
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-900/20 border border-green-500/20 rounded p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <DollarSign className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-300">راتب يومي</span>
              </div>
              <div className="text-sm font-bold text-green-400">${currentJob.jobInfo.salary}</div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/20 rounded p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Star className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-300">خبرة يومية</span>
              </div>
              <div className="text-sm font-bold text-blue-400">+{currentJob.jobInfo.expPerDay}</div>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Calendar className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-300">أيام العمل</span>
              </div>
              <div className="text-sm font-bold text-yellow-400">{currentJob.daysWorked}</div>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-500/20 rounded p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Coins className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300">إجمالي الأرباح</span>
              </div>
              <div className="text-sm font-bold text-purple-400">${currentJob.totalEarned}</div>
            </div>
          </div>
        </div>
      )}

      {/* Job Statistics */}
      {hudData && (
        <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blood-600 rounded flex items-center justify-center">
              <Award className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-semibold text-blood-400">إحصائيات الوظائف</h3>
            <ImageIcon className="w-4 h-4 text-blood-300 ml-auto" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blood-900/20 border border-blood-500/10 rounded p-3 text-center">
              <div className="text-lg font-bold text-green-400">{hudData.totalJobs}</div>
              <div className="text-xs text-blood-300">الوظائف السابقة</div>
            </div>
            <div className="bg-blood-900/20 border border-blood-500/10 rounded p-3 text-center">
              <div className="text-lg font-bold text-green-400">${hudData.totalEarned}</div>
              <div className="text-xs text-blood-300">إجمالي الأرباح</div>
            </div>
            <div className="bg-blood-900/20 border border-blood-500/10 rounded p-3 text-center">
              <div className="text-lg font-bold text-blue-400">{hudData.totalExpEarned}</div>
              <div className="text-xs text-blood-300">إجمالي الخبرة</div>
            </div>
            <div className="bg-blood-900/20 border border-blood-500/10 rounded p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">{hudData.totalDaysWorked}</div>
              <div className="text-xs text-blood-300">أيام العمل</div>
            </div>
          </div>
        </div>
      )}

      {/* Available Jobs */}
      {!currentJob && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blood-400" />
            <h2 className="text-lg font-bold text-white">الوظائف المتاحة</h2>
            <span className="text-sm text-blood-300">({availableJobs.length})</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableJobs.map((job) => {
              const isHiring = hiringJobId === job.id;
              const canHire = hudData && hudData.level >= job.minLevel;
              
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  onHire={handleHire}
                  isHiring={isHiring}
                  canHire={canHire}
                  currentJob={currentJob}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-blood-600 rounded flex items-center justify-center">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
          <h3 className="font-semibold text-blood-400">معلومات مهمة</h3>
          <ImageIcon className="w-4 h-4 text-blood-300 ml-auto" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-blood-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-blood-400 flex-shrink-0" />
            <span>الراتب يدفع يومياً</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-3 h-3 text-blood-400 flex-shrink-0" />
            <span>لا يمكن العمل في وظيفتين</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-3 h-3 text-blood-400 flex-shrink-0" />
            <span>الخبرة تساعدك على التطور</span>
          </div>
        </div>
      </div>
    </div>
  );
}
