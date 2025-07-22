import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  Search,
  Ban,
  Unlock,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Helper to format IP addresses
function formatIp(ip) {
  if (ip === '::1' || ip === '127.0.0.1') return 'localhost';
  return ip;
}

export default function IpManagement() {
  const queryClient = useQueryClient();
  const [blockIp, setBlockIp] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Fetch blocked IPs
  const { data: blockedIps, isLoading: blockedIpsLoading } = useQuery({
    queryKey: ['admin-blocked-ips'],
    queryFn: () => axios.get('/api/admin/system/ips/blocked').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Fetch IP statistics
  const { data: ipStats, isLoading: ipStatsLoading } = useQuery({
    queryKey: ['admin-ip-stats'],
    queryFn: () => axios.get('/api/admin/system/ips/stats').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Fetch flagged IPs (IPs used by more than one user)
  const { data: flaggedIps, isLoading: flaggedIpsLoading } = useQuery({
    queryKey: ['admin-flagged-ips'],
    queryFn: () => axios.get('/api/admin/system/ips/flagged').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Block IP mutation
  const blockIpMutation = useMutation({
    mutationFn: ({ ipAddress, reason }) => axios.post('/api/admin/system/ips/block', { ipAddress, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blocked-ips']);
      queryClient.invalidateQueries(['admin-ip-stats']);
      toast.success('تم حظر عنوان IP بنجاح');
      setBlockIp('');
      setBlockReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في حظر عنوان IP');
    },
  });

  // Unblock IP mutation
  const unblockIpMutation = useMutation({
    mutationFn: ({ ipAddress }) => axios.delete(`/api/admin/system/ips/${ipAddress}/unblock`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blocked-ips']);
      queryClient.invalidateQueries(['admin-ip-stats']);
      toast.success('تم إلغاء حظر عنوان IP بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في إلغاء حظر عنوان IP');
    },
  });

  const handleBlockIp = () => {
    if (!blockIp.trim()) {
      toast.error('يرجى إدخال عنوان IP');
      return;
    }
    blockIpMutation.mutate({ ipAddress: blockIp.trim(), reason: blockReason });
  };

  const handleUnblockIp = (ipAddress) => {
    if (confirm(`هل أنت متأكد من إلغاء حظر عنوان IP: ${ipAddress}؟`)) {
      unblockIpMutation.mutate({ ipAddress });
    }
  };

  if (blockedIpsLoading || ipStatsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل بيانات IP...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* IP Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-accent-blue" />
            <div>
              <p className="text-hitman-400 text-sm">إجمالي عناوين IP</p>
              <p className="text-2xl font-bold text-white">{ipStats?.totalIps || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-accent-red" />
            <div>
              <p className="text-hitman-400 text-sm">عناوين IP المحظورة</p>
              <p className="text-2xl font-bold text-white">{ipStats?.blockedIps || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent-green" />
            <div>
              <p className="text-hitman-400 text-sm">المستخدمين الفريدين</p>
              <p className="text-2xl font-bold text-white">{ipStats?.uniqueUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged IPs Section */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-hitman-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-accent-red" />
            عناوين IP التي تستخدم أكثر من مستخدم
          </h3>
        </div>
        <div className="overflow-x-auto">
          {flaggedIpsLoading ? (
            <div className="text-center py-8 text-hitman-400">جاري تحميل عناوين IP...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-hitman-800/50">
                <tr>
                  <th className="px-6 py-4 text-right text-hitman-300 font-medium">عنوان IP</th>
                  <th className="px-6 py-4 text-right text-hitman-300 font-medium">عدد المستخدمين</th>
                  <th className="px-6 py-4 text-right text-hitman-300 font-medium">المستخدمون والشخصيات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hitman-700">
                {(!flaggedIps || flaggedIps.length === 0) ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-hitman-400">
                      لا توجد عناوين IP مشبوهة حالياً
                    </td>
                  </tr>
                ) : (
                  flaggedIps.map(ip => (
                    <tr key={ip.ipAddress} className="hover:bg-hitman-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">{formatIp(ip.ipAddress)}</td>
                      <td className="px-6 py-4 text-hitman-300">{ip.userCount}</td>
                      <td className="px-6 py-4">
                        <ul className="space-y-2">
                          {ip.users.map(user => (
                            <li key={user.id} className="mb-2">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-accent-blue" />
                                <span className="text-white font-bold">{user.username}</span>
                                <span className="text-hitman-400 text-xs">({user.email})</span>
                                {user.isBanned && (
                                  <span className="ml-2 text-accent-red text-xs">محظور</span>
                                )}
                              </div>
                              {user.characters && user.characters.length > 0 && (
                                <ul className="ml-6 mt-1 space-y-1">
                                  {user.characters.map(char => (
                                    <li key={char.id} className="flex items-center gap-2">
                                      <span className="text-hitman-300">{char.name}</span>
                                      <span className="text-hitman-400 text-xs">مستوى {char.level}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Block IP Form */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Ban className="w-6 h-6 text-accent-red" />
          حظر عنوان IP
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-hitman-300 text-sm mb-2">عنوان IP</label>
            <input
              type="text"
              placeholder="مثال: 192.168.1.1"
              value={blockIp}
              onChange={(e) => setBlockIp(e.target.value)}
              className="w-full bg-hitman-800/50 border border-hitman-700 rounded-lg px-4 py-3 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-red"
            />
          </div>
          
          <div>
            <label className="block text-hitman-300 text-sm mb-2">سبب الحظر (اختياري)</label>
            <input
              type="text"
              placeholder="سبب الحظر..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full bg-hitman-800/50 border border-hitman-700 rounded-lg px-4 py-3 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-red"
            />
          </div>
        </div>
        
        <button
          onClick={handleBlockIp}
          disabled={blockIpMutation.isPending}
          className="mt-4 bg-accent-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {blockIpMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الحظر...
            </>
          ) : (
            <>
              <Ban className="w-4 h-4" />
              حظر عنوان IP
            </>
          )}
        </button>
      </div>

      {/* Blocked IPs List */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-hitman-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-accent-red" />
            عناوين IP المحظورة
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">عنوان IP</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">سبب الحظر</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">تاريخ الحظر</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {blockedIps?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-hitman-400">
                    لا توجد عناوين IP محظورة
                  </td>
                </tr>
              ) : (
                blockedIps?.map((ip) => (
                  <tr key={ip.id} className="hover:bg-hitman-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-accent-blue" />
                        <span className="font-mono text-white">{formatIp(ip.ipAddress)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-hitman-300">
                        {ip.blockReason || 'لا يوجد سبب محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-hitman-400" />
                        <span className="text-hitman-300">
                          {new Date(ip.blockedAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUnblockIp(ip.ipAddress)}
                        disabled={unblockIpMutation.isPending}
                        className="text-accent-green hover:text-green-300 p-2 rounded transition-colors disabled:opacity-50"
                        title="إلغاء الحظر"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 