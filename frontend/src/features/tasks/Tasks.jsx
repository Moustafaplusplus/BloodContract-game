import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(null);
  const [promotionStatus, setPromotionStatus] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchPromotionStatus();
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

  async function collectReward(taskId) {
    setCollecting(taskId);
    try {
      const res = await axios.post('/api/tasks/collect', { taskId });
      // Update promotion status if it was included in response
      if (res.data.promotionStatus) {
        setPromotionStatus(res.data.promotionStatus);
      }
      fetchTasks(); // Refresh to update collected status
    } catch (error) {
      // TODO: Show error message
    } finally {
      setCollecting(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-accent-red text-xl">جاري تحميل المهام...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red">
            المهام
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
          <p className="text-hitman-300 mt-4">أكمل المهام واحصل على المكافآت</p>
        </div>

        {/* Promotion Status */}
        {promotionStatus && (
          <div className="bg-hitman-900/80 rounded-xl p-6 shadow-lg border border-accent-red mb-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-accent-red mb-2">نظام الرتب</h2>
              <div className="text-xl font-bold text-white">
                الرتبة الحالية: {promotionStatus.currentTitle}
              </div>
              <div className="text-sm text-hitman-300 mt-1">
                نقاط التقدم: {promotionStatus.totalProgressPoints.toLocaleString()}
              </div>
              {promotionStatus.powerBonus > 0 || promotionStatus.defenseBonus > 0 ? (
                <div className="flex justify-center gap-4 mt-2">
                  {promotionStatus.powerBonus > 0 && (
                    <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded text-sm">
                      ⚔️ قوة +{promotionStatus.powerBonus}
                    </span>
                  )}
                  {promotionStatus.defenseBonus > 0 && (
                    <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded text-sm">
                      🛡️ دفاع +{promotionStatus.defenseBonus}
                    </span>
                  )}
                </div>
              ) : null}
            </div>

            {promotionStatus.nextTitle ? (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-hitman-300">التقدم للرتبة التالية</span>
                  <span className="text-white font-bold">
                    {promotionStatus.pointsForNextRank} نقطة متبقية
                  </span>
                </div>
                <div className="w-full bg-hitman-800 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-accent-red to-red-400 transition-all duration-300"
                    style={{ width: `${promotionStatus.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-hitman-300">الرتبة التالية: </span>
                  <span className="text-sm font-bold text-accent-red">{promotionStatus.nextTitle}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-green-400 font-bold">
                🏆 وصلت لأعلى رتبة! مبروك!
              </div>
            )}
          </div>
        )}

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="text-center text-hitman-400 text-xl">
            لا توجد مهام متاحة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task.id} className="bg-hitman-900/80 rounded-xl p-6 shadow-lg border border-hitman-700 hover:border-accent-red transition-all">
                {/* Task Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-accent-red mb-2">{task.title}</h3>
                  <p className="text-hitman-300 text-sm">{task.description}</p>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-hitman-300">التقدم</span>
                    <span className="text-white font-bold">
                      {task.progress} / {task.goal}
                    </span>
                  </div>
                  <div className="w-full bg-hitman-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        task.isCompleted ? 'bg-green-500' : 'bg-accent-red'
                      }`}
                      style={{ width: `${getProgressPercentage(task.progress, task.goal)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metric */}
                <div className="mb-4">
                  <span className="text-xs text-hitman-400">المعيار:</span>
                  <div className="text-sm text-white font-medium">
                    {getMetricDisplayName(task.metric)}
                  </div>
                </div>

                {/* Rewards */}
                <div className="mb-4">
                  <span className="text-xs text-hitman-400">المكافآت:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {task.rewardMoney > 0 && (
                      <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-xs">
                        💰 {task.rewardMoney.toLocaleString()}
                      </span>
                    )}
                    {task.rewardExp > 0 && (
                      <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs">
                        ⭐ {task.rewardExp.toLocaleString()} خبرة
                      </span>
                    )}
                    {task.rewardBlackcoins > 0 && (
                      <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <img src="/images/blackcoins-icon.png" alt="Blackcoin" className="w-4 h-4 object-contain" />
                        {task.rewardBlackcoins.toLocaleString()} بلاك كوين
                      </span>
                    )}
                    {task.progressPoints > 0 && (
                      <span className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded text-xs">
                        📊 {task.progressPoints} نقطة تقدم
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  {task.isCompleted ? (
                    task.rewardCollected ? (
                      <div className="text-green-400 text-sm font-bold">✅ تم جمع المكافأة</div>
                    ) : (
                      <button
                        onClick={() => collectReward(task.id)}
                        disabled={collecting === task.id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-2 rounded font-bold transition w-full"
                      >
                        {collecting === task.id ? 'جاري الجمع...' : 'جمع المكافأة'}
                      </button>
                    )
                  ) : (
                    <div className="text-hitman-400 text-sm">
                      {task.progress < task.goal ? 'أكمل المهمة لجمع المكافأة' : 'قريباً...'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 