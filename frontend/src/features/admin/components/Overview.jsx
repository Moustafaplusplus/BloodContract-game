import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import MoneyIcon from '@/components/MoneyIcon';
import { 
  Users, 
  User, 
  DollarSign, 
  Coins,
  TrendingUp,
  AlertTriangle,
  Ban,
  Shield,
  Sword,
  Target,
  Home,
  Car,
  Dog,
  Package,
  Award,
  Activity,
  Clock,
  BarChart3,
  PieChart,
  Zap,
  Heart,
  Skull,
  Trophy,
  Briefcase,
  MessageSquare,
  BookOpen,
  Star,
  Eye,
  Users2,
  Building2,
  Scale,
  HardDrive
} from 'lucide-react';

export default function Overview() {
  // Fetch comprehensive system stats
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: async () => {
      const token = null;
      
      // First, let's check if the user is actually an admin
      try {
        const profileRes = await axios.get('/api/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        
        if (!profileRes.data?.isAdmin) {
          throw new Error('User is not an admin');
        }
      } catch (error) {

        throw new Error('Authentication or admin check failed');
      }
      
      return axios.get('/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(res => {
        return res.data;
      }).catch(error => {

        throw error;
      });
    },
    staleTime: 60 * 1000,
  });

  if (statsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  // Calculate additional metrics
  const activePercentage = systemStats?.totalUsers ? Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100) : 0;
  const averageMoney = systemStats?.totalCharacters ? Math.round(systemStats.totalMoney / systemStats.totalCharacters) : 0;
  const averageBlackcoins = systemStats?.totalCharacters ? Math.round(systemStats.totalBlackcoins / systemStats.totalCharacters) : 0;
  const averageExperience = systemStats?.totalCharacters ? Math.round(systemStats.totalExperience / systemStats.totalCharacters) : 0;

  return (
    <div className="space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 hover:border-accent-red/50 transition-all">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-accent-blue" />
            <span className="text-2xl font-bold text-white">
              {systemStats?.totalUsers || 0}
            </span>
          </div>
          <h3 className="text-white mt-2">إجمالي المستخدمين</h3>
          <div className="mt-2 text-sm text-white">
            {activePercentage}% نشط اليوم
          </div>
        </div>

        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 hover:border-accent-green/50 transition-all">
          <div className="flex items-center justify-between">
            <User className="w-8 h-8 text-accent-green" />
            <span className="text-2xl font-bold text-white">
              {systemStats?.activeUsers || 0}
            </span>
          </div>
          <h3 className="text-white mt-2">المستخدمين النشطين</h3>
          <div className="mt-2 text-sm text-white">
            آخر 24 ساعة
          </div>
        </div>

        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 hover:border-accent-green/50 transition-all">
          <div className="flex items-center justify-between">
            <MoneyIcon className="w-8 h-8" />
            <span className="text-2xl font-bold text-white">
              ${(systemStats?.totalMoney || 0).toLocaleString()}
            </span>
          </div>
          <h3 className="text-white mt-2">إجمالي المال</h3>
          <div className="mt-2 text-sm text-white">
            متوسط ${averageMoney.toLocaleString()} لكل شخصية
          </div>
        </div>

        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 hover:border-accent-yellow/50 transition-all">
          <div className="flex items-center justify-between">
            <Coins className="w-8 h-8 text-accent-yellow" />
            <span className="text-2xl font-bold text-white">
              {(systemStats?.totalBlackcoins || 0).toLocaleString()}
            </span>
          </div>
          <h3 className="text-white mt-2">إجمالي البلاك كوينز</h3>
          <div className="mt-2 text-sm text-white">
            متوسط {averageBlackcoins.toLocaleString()} لكل شخصية
          </div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Performance */}
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <BarChart3 className="w-6 h-6 text-accent-blue" />
            أداء اللعبة
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Award className="w-4 h-4" />
                متوسط المستوى
              </span>
              <span className="font-bold text-white">{systemStats?.averageLevel || 1}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Users2 className="w-4 h-4" />
                إجمالي الشخصيات
              </span>
              <span className="font-bold text-white">{(systemStats?.totalCharacters || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Activity className="w-4 h-4" />
                معدل النشاط
              </span>
              <span className="font-bold text-white">{activePercentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                أعلى مستوى
              </span>
              <span className="font-bold text-white">{systemStats?.maxLevel || 1}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Clock className="w-4 h-4" />
                آخر تحديث
              </span>
              <span className="font-bold text-white text-sm">{new Date().toLocaleTimeString('ar-SA')}</span>
            </div>
          </div>
        </div>

        {/* Security & Moderation */}
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Shield className="w-6 h-6 text-accent-yellow" />
            الأمان والمراقبة
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Ban className="w-4 h-4" />
                المستخدمين المحظورين
              </span>
              <span className="font-bold text-red-400">{systemStats?.bannedUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Shield className="w-4 h-4" />
                عناوين IP المحظورة
              </span>
              <span className="font-bold text-red-400">{systemStats?.blockedIps || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Eye className="w-4 h-4" />
                معدل الحظر
              </span>
              <span className="font-bold text-white">
                {systemStats?.totalUsers ? Math.round((systemStats.bannedUsers / systemStats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                حالة النظام
              </span>
              <span className="font-bold text-white">مستقر</span>
            </div>
          </div>
        </div>

        {/* Economy Overview */}
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <TrendingUp className="w-6 h-6 text-accent-green" />
            الاقتصاد
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                إجمالي المال
              </span>
              <span className="font-bold text-white">${(systemStats?.totalMoney || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Coins className="w-4 h-4" />
                إجمالي البلاك كوينز
              </span>
              <span className="font-bold text-white">{(systemStats?.totalBlackcoins || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Scale className="w-4 h-4" />
                متوسط المال/شخصية
              </span>
              <span className="font-bold text-white">${averageMoney.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Star className="w-4 h-4" />
                متوسط البلاك كوينز/شخصية
              </span>
              <span className="font-bold text-white">{averageBlackcoins.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Award className="w-4 h-4" />
                متوسط الخبرة/شخصية
              </span>
              <span className="font-bold text-white">{averageExperience.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Activity Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Activity className="w-6 h-6 text-accent-blue" />
            إحصائيات النشاط
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Sword className="w-4 h-4" />
                إجمالي المعارك
              </span>
              <span className="font-bold text-white">{(systemStats?.totalFights || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Target className="w-4 h-4" />
                إجمالي الجرائم
              </span>
              <span className="font-bold text-white">{(systemStats?.totalCrimes || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                إجمالي العقود
              </span>
              <span className="font-bold text-white">{(systemStats?.totalContracts || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                إجمالي المهام
              </span>
              <span className="font-bold text-white">{(systemStats?.totalMissions || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Package className="w-6 h-6 text-accent-green" />
            إحصائيات الممتلكات
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Home className="w-4 h-4" />
                إجمالي السيارات
              </span>
              <span className="font-bold text-white">{(systemStats?.totalCars || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Car className="w-4 h-4" />
                إجمالي الكلاب
              </span>
              <span className="font-bold text-white">{(systemStats?.totalDogs || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Dog className="w-4 h-4" />
                إجمالي العقود
              </span>
              <span className="font-bold text-white">{(systemStats?.totalContracts || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white flex items-center gap-2">
                <Skull className="w-4 h-4" />
                إجمالي المهام
              </span>
              <span className="font-bold text-white">{(systemStats?.totalMissions || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Features Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-blue/50 transition-all">
          <Sword className="w-8 h-8 text-accent-blue mx-auto mb-2" />
          <h4 className="font-bold text-white">المعارك</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-red/50 transition-all">
          <Target className="w-8 h-8 text-accent-red mx-auto mb-2" />
          <h4 className="font-bold text-white">الجرائم</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-green/50 transition-all">
          <Home className="w-8 h-8 text-accent-green mx-auto mb-2" />
          <h4 className="font-bold text-white">المنازل</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-yellow/50 transition-all">
          <Car className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <h4 className="font-bold text-white">السيارات</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-purple/50 transition-all">
          <Dog className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h4 className="font-bold text-white">الكلاب</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-orange/50 transition-all">
          <Package className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <h4 className="font-bold text-white">العناصر الخاصة</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-pink/50 transition-all">
          <Building2 className="w-8 h-8 text-pink-400 mx-auto mb-2" />
          <h4 className="font-bold text-white">العصابات</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/20 to-hitman-900/20 backdrop-blur-sm border border-hitman-700 rounded-lg p-4 text-center hover:border-accent-indigo/50 transition-all">
          <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <h4 className="font-bold text-white">المهام</h4>
          <p className="text-sm text-white">نشط</p>
        </div>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Zap className="w-6 h-6 text-accent-green" />
            صحة النظام
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <span className="text-green-400 flex items-center gap-2 text-white">
                <Heart className="w-4 h-4" />
                الخادم
              </span>
              <span className="text-green-400 font-bold text-white">مستقر</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <span className="text-blue-400 flex items-center gap-2 text-white">
                <HardDrive className="w-4 h-4" />
                قاعدة البيانات
              </span>
              <span className="text-blue-400 font-bold text-white">متصل</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <span className="text-yellow-400 flex items-center gap-2 text-white">
                <Activity className="w-4 h-4" />
                الأداء
              </span>
              <span className="text-yellow-400 font-bold text-white">جيد</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <AlertTriangle className="w-6 h-6 text-accent-yellow" />
            التنبيهات والإجراءات
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <h4 className="font-bold text-red-400 mb-2 text-white">تحذير</h4>
              <p className="text-sm text-white">
                الإجراءات في هذه اللوحة تؤثر مباشرة على بيانات اللاعبين. 
                تأكد من صحة الإجراءات قبل تنفيذها.
              </p>
            </div>
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <h4 className="font-bold text-yellow-400 mb-2 text-white">نصائح للمشرف</h4>
              <ul className="text-sm text-white space-y-1">
                <li>• راقب إحصائيات النظام بانتظام</li>
                <li>• تحقق من المستخدمين المحظورين</li>
                <li>• راقب نشاط اللعبة اليومي</li>
                <li>• تحقق من صحة الاقتصاد</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 