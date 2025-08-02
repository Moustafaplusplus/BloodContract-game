import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MoneyIcon from '@/components/MoneyIcon';
import { useUnclaimedTasks } from '@/hooks/useUnclaimedTasks';
import { toast } from 'react-toastify';
import { Target, Trophy, Gift, Star, TrendingUp, CheckCircle, Clock, ImageIcon, Award, Loader, Crown } from 'lucide-react';

const TaskCard = ({ task, collecting, onCollectReward, getProgressPercentage, getMetricDisplayName }) => {
  const progressPercentage = getProgressPercentage(task.progress, task.goal);
  const isCompleted = task.isCompleted;
  const isCollected = task.rewardCollected;

  return (
    <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm hover:border-blood-500/40 transition-all duration-300">
      {/* Task Header with Progress Banner */}
      <div className="relative h-12 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg mb-4 overflow-hidden">
        {/* Background Pattern */}
        <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"10\" cy=\"10\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"}></div>
        
        {/* Progress Bar Background */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div 
            className={`h-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-blood-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              isCompleted ? 'bg-green-600/80' : 'bg-blood-600/80'
            } backdrop-blur-sm`}>
              {isCompleted ? (
                <CheckCircle className="w-3 h-3 text-white" />
              ) : (
                <Target className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-xs font-medium text-white drop-shadow">
              {task.progress} / {task.goal}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <ImageIcon className="w-3 h-3 text-white/60" />
            {isCompleted && <Trophy className="w-3 h-3 text-yellow-400" />}
          </div>
        </div>
      </div>

      {/* Task Info */}
      <div className="mb-4">
        <h3 className="font-bold text-white mb-1 text-sm">{task.title}</h3>
        <p className="text-blood-200 text-xs leading-relaxed line-clamp-2">{task.description}</p>
      </div>

      {/* Metric */}
      <div className="mb-3">
        <div className="flex items-center space-x-1 mb-1">
          <Target className="w-3 h-3 text-blood-400" />
          <span className="text-xs text-blood-300">المعيار</span>
        </div>
        <div className="text-sm text-white font-medium bg-blood-900/20 border border-blood-500/10 rounded p-1 text-center">
          {getMetricDisplayName(task.metric)}
        </div>
      </div>

      {/* Rewards */}
      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          <Gift className="w-3 h-3 text-blood-400" />
          <span className="text-xs text-blood-300">المكافآت</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {task.rewardMoney > 0 && (
            <div className="bg-green-900/20 border border-green-500/20 rounded p-1 text-center">
              <div className="flex items-center justify-center space-x-1">
                <MoneyIcon className="w-3 h-3" />
                <span className="text-xs text-green-400 font-medium">{task.rewardMoney.toLocaleString()}</span>
              </div>
            </div>
          )}
          {task.rewardExp > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/20 rounded p-1 text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">{task.rewardExp.toLocaleString()}</span>
              </div>
            </div>
          )}
          {task.rewardBlackcoins > 0 && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded p-1 text-center">
              <div className="flex items-center justify-center space-x-1">
                <img src="/images/blackcoins-icon.png" alt="Blackcoin" className="w-3 h-3 object-contain" />
                <span className="text-xs text-purple-400 font-medium">{task.rewardBlackcoins.toLocaleString()}</span>
              </div>
            </div>
          )}
          {task.progressPoints > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded p-1 text-center">
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">{task.progressPoints}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div>
        {isCompleted ? (
          isCollected ? (
            <div className="bg-green-900/20 border border-green-500/20 text-green-400 py-2 px-3 rounded-lg text-center text-sm font-medium flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>تم جمع المكافأة</span>
            </div>
          ) : (
            <button
              onClick={() => onCollectReward(task.id)}
              disabled={collecting === task.id}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none text-sm flex items-center justify-center space-x-2"
            >
              {collecting === task.id ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>جاري الجمع...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>جمع المكافأة</span>
                </>
              )}
            </button>
          )
        ) : (
          <div className="bg-blood-900/20 border border-blood-500/20 text-blood-300 py-2 px-3 rounded-lg text-center text-sm flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>أكمل المهمة لجمع المكافأة</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(null);
  const [promotionStatus, setPromotionStatus] = useState(null);
  const [dailyTask, setDailyTask] = useState(null);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const { refetch: refetchUnclaimedCount } = useUnclaimedTasks();

  useEffect(() => {
    fetchTasks();
    fetchPromotionStatus();
    fetchDailyTaskStatus();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPromotionStatus() {
    try {
      const res = await axios.get('/api/tasks/promotion/status');
      setPromotionStatus(res.data);
    } catch {
      setPromotionStatus(null);
    }
  }

  async function fetchDailyTaskStatus() {
    try {
      const res = await axios.get('/api/tasks/daily/status');
      setDailyTask(res.data);
    } catch {
      setDailyTask(null);
    }
  }

  async function collectReward(taskId) {
    setCollecting(taskId);
    try {
      const res = await axios.post(`/api/tasks/${taskId}/collect`);
      toast.success('تم جمع المكافأة بن��اح!');
      if (res.data.promotionStatus) {
        setPromotionStatus(res.data.promotionStatus);
      }
      fetchTasks();
      refetchUnclaimedCount();
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في جمع المكافأة');
    } finally {
      setCollecting(null);
    }
  }

  async function claimDailyTask() {
    setClaimingDaily(true);
    try {
      const res = await axios.post('/api/tasks/daily/claim');
      toast.success('تم المطالبة بالمهمة اليومية بنجاح!');
      fetchDailyTaskStatus();
      refetchUnclaimedCount();
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل في المطالبة بالمهمة اليومية');
    } finally {
      setClaimingDaily(false);
    }
  }

  function getProgressPercentage(progress, goal) {
    return Math.min((progress / goal) * 100, 100);
  }

  function getMetricDisplayName(metric) {
    const metricNames = {
      'level': 'المستوى',
      'money': 'المال',
      'blackcoins': 'البلاك كوين',
      'days_in_game': 'أيام في اللعبة',
      'fame': 'الشهرة',
      'fights_won': 'المعارك المربوحة',
      'fights_lost': 'المعارك المفقودة',
      'total_fights': 'إجمالي المعارك',
      'kill_count': 'عدد القتلى',
      'damage_dealt': 'الضرر المُلحق',
      'crimes_committed': 'الجرائم المرتكبة',
      'jobs_completed': 'الوظائف المكتملة',
      'ministry_missions_completed': 'مهام الوزارة المكتملة',
      'money_deposited': 'المال المودع',
      'money_withdrawn': 'المال المسحوب',
      'bank_balance': 'رصيد البنك',
      'blackmarket_items_bought': 'العناصر المشتراة من السوق السوداء',
      'blackmarket_items_sold': 'العناصر المباعة في السوق السوداء',
      'gang_joined': 'الانضمام للعصابات',
      'gang_created': 'إنشاء العصابات',
      'gang_money_contributed': 'المساهمة المالية في العصابات',
      'houses_owned': 'المنازل المملوكة',
      'dogs_owned': 'الكلاب المملوكة',
      'suggestions_submitted': 'الاقتراحات المقدمة'
    };
    return metricNames[metric] || metric;
  }

  const completedTasks = tasks.filter(task => task.isCompleted && !task.rewardCollected).length;
  const totalTasks = tasks.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 flex items-center justify-center p-4">
        <div className="text-center bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 p-8">
          <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل المهام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 p-2 sm:p-4 space-y-4">
      
      {/* Tasks Header Banner with Background Image */}
      <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900 via-gray-800 to-purple-900">
          <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23eab308\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M25 5l7 14h14l-11 8 4 14-14-10-14 10 4-14-11-8h14z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"}></div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">المهام</h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">أكمل المهام واحصل على المكافآت</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <Award className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{completedTasks}</div>
              <div className="text-xs text-white/80 drop-shadow">Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Task */}
      {dailyTask && (
        <div className="bg-black/80 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-yellow-400">المهمة اليومية</h2>
              <p className="text-xs text-white/80">سجل دخولك اليومي واحصل على مكافآت مجانية!</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded p-2 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <MoneyIcon className="w-3 h-3" />
                <span className="text-xs text-yellow-300">بلاك كوين</span>
              </div>
              <div className="text-sm font-bold text-yellow-400">1</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/20 rounded p-2 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Star className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-300">خبرة</span>
              </div>
              <div className="text-sm font-bold text-blue-400">{dailyTask.expReward?.toLocaleString() || 0}</div>
            </div>
          </div>

          {dailyTask.isAvailable ? (
            <button
              onClick={claimDailyTask}
              disabled={claimingDaily}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
            >
              {claimingDaily ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>جاري المطالبة...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>احصل على المكافأة اليومية</span>
                </>
              )}
            </button>
          ) : (
            <div className="bg-green-900/20 border border-green-500/20 text-green-400 py-3 px-4 rounded-lg text-center font-bold flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>تم المطالبة اليوم</span>
            </div>
          )}
        </div>
      )}

      {/* Promotion Status */}
      {promotionStatus && (
        <div className="bg-black/80 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-purple-400">نظام الرتب</h2>
              <p className="text-sm text-white">{promotionStatus.currentTitle}</p>
            </div>
          </div>

          {promotionStatus.nextTitle ? (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blood-300">التقدم للرتبة التالية</span>
                <span className="text-white font-bold">{promotionStatus.pointsForNextRank} نقطة متبقية</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${promotionStatus.progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-purple-300">
                الرتبة التالية: <span className="font-bold">{promotionStatus.nextTitle}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-green-400 font-bold flex items-center justify-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>وصلت لأعلى رتبة! مبروك!</span>
            </div>
          )}
        </div>
      )}

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blood-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-blood-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">لا توجد مهام متاحة حالياً</h3>
          <p className="text-blood-300">ستظهر المهام الجديدة قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              collecting={collecting}
              onCollectReward={collectReward}
              getProgressPercentage={getProgressPercentage}
              getMetricDisplayName={getMetricDisplayName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
