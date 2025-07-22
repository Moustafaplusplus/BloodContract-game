import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Users, 
  User, 
  DollarSign, 
  Coins
} from 'lucide-react';

export default function Overview() {
  // Fetch system stats
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: () => axios.get('/api/admin/system/stats').then(res => res.data),
    staleTime: 60 * 1000,
  });

  if (statsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل النظرة العامة...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <Users className="w-8 h-8 text-accent-blue" />
          <span className="text-2xl font-bold text-accent-blue">
            {systemStats?.totalUsers || 0}
          </span>
        </div>
        <h3 className="text-hitman-300 mt-2">إجمالي المستخدمين</h3>
      </div>

      <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <User className="w-8 h-8 text-accent-green" />
          <span className="text-2xl font-bold text-accent-green">
            {systemStats?.activeUsers || 0}
          </span>
        </div>
        <h3 className="text-hitman-300 mt-2">المستخدمين النشطين</h3>
      </div>

      <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <DollarSign className="w-8 h-8 text-accent-green" />
          <span className="text-2xl font-bold text-accent-green">
            ${(systemStats?.totalMoney || 0).toLocaleString()}
          </span>
        </div>
        <h3 className="text-hitman-300 mt-2">إجمالي المال</h3>
      </div>

      <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <Coins className="w-8 h-8 text-accent-yellow" />
          <span className="text-2xl font-bold text-accent-yellow">
            {(systemStats?.totalBlackcoins || 0).toLocaleString()}
          </span>
        </div>
        <h3 className="text-hitman-300 mt-2">إجمالي البلاك كوينز</h3>
      </div>
    </div>
  );
} 