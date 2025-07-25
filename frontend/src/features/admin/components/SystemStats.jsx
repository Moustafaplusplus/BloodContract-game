import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  TrendingUp,
  AlertTriangle,
  Ban,
  Shield
} from 'lucide-react';

export default function SystemStats() {
  // Fetch system stats
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: () => {
      const token = localStorage.getItem('jwt');
      return axios.get('/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(res => res.data);
    },
    staleTime: 60 * 1000,
  });

  if (statsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل إحصائيات النظام...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent-green" />
          إحصائيات النظام
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-hitman-300">إجمالي المستخدمين:</span>
            <span className="font-bold">{systemStats?.totalUsers || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hitman-300">إجمالي الشخصيات:</span>
            <span className="font-bold">{systemStats?.totalCharacters || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hitman-300">المستخدمين النشطين (24 ساعة):</span>
            <span className="font-bold">{systemStats?.activeUsers || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hitman-300">متوسط المستوى:</span>
            <span className="font-bold">{systemStats?.averageLevel || 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hitman-300">إجمالي المال في النظام:</span>
            <span className="font-bold">${(systemStats?.totalMoney || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hitman-300">إجمالي البلاك كوينز:</span>
            <span className="font-bold">{(systemStats?.totalBlackcoins || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hitman-300">المستخدمين المحظورين:</span>
            <span className="font-bold text-red-400">{systemStats?.bannedUsers || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hitman-300">عناوين IP المحظورة:</span>
            <span className="font-bold text-red-400">{systemStats?.blockedIps || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-accent-yellow" />
          إجراءات خطيرة
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h4 className="font-bold text-red-400 mb-2">تحذير</h4>
            <p className="text-sm text-hitman-300">
              الإجراءات في هذه اللوحة تؤثر مباشرة على بيانات اللاعبين. 
              تأكد من صحة الإجراءات قبل تنفيذها.
            </p>
          </div>
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <h4 className="font-bold text-yellow-400 mb-2">نصائح</h4>
            <ul className="text-sm text-hitman-300 space-y-1">
              <li>• استخدم البحث للعثور على شخصيات محددة</li>
              <li>• يمكن تعديل المال والبلاك كوينز بسهولة</li>
              <li>• إعادة تعيين الشخصية لا يمكن التراجع عنها</li>
              <li>• راقب إحصائيات النظام بانتظام</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 