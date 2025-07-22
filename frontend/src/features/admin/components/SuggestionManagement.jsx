import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  MessageSquare, 
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Calendar,
  User
} from 'lucide-react';

const STATUS_COLORS = {
  unread: 'text-red-400',
  pending: 'text-yellow-400',
  done: 'text-green-400'
};

const STATUS_LABELS = {
  unread: 'غير مقروء',
  pending: 'قيد المعالجة',
  done: 'مكتمل'
};

const TYPE_LABELS = {
  suggestion: 'اقتراح',
  bug: 'مشكلة',
  other: 'أخرى'
};

export default function SuggestionManagement() {
  const queryClient = useQueryClient();
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch suggestions
  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['admin-suggestions', debouncedSearchTerm, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter) params.append('status', statusFilter);
      return axios.get(`/api/suggestions?${params.toString()}`).then(res => res.data);
    },
    staleTime: 30 * 1000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-suggestions-stats'],
    queryFn: () => axios.get('/api/suggestions/stats').then(res => res.data),
    staleTime: 60 * 1000,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }) => 
      axios.put(`/api/suggestions/${id}/status`, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-suggestions']);
      queryClient.invalidateQueries(['admin-suggestions-stats']);
      toast.success('تم تحديث حالة الاقتراح بنجاح');
      setEditingNotes(false);
      setNotesValue('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في تحديث حالة الاقتراح');
    },
  });

  // Delete suggestion mutation
  const deleteSuggestionMutation = useMutation({
    mutationFn: ({ id }) => axios.delete(`/api/suggestions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-suggestions']);
      queryClient.invalidateQueries(['admin-suggestions-stats']);
      toast.success('تم حذف الاقتراح بنجاح');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'فشل في حذف الاقتراح');
    },
  });

  const handleStatusUpdate = (suggestionId, newStatus) => {
    const currentSuggestion = suggestionsData?.suggestions?.find(s => s.id === suggestionId);
    const currentNotes = currentSuggestion?.adminNotes || '';
    
    if (newStatus === 'done' && !currentNotes) {
      setSelectedSuggestion(currentSuggestion);
      setNotesValue('');
      setEditingNotes(true);
    } else {
      updateStatusMutation.mutate({ 
        id: suggestionId, 
        status: newStatus, 
        adminNotes: currentNotes 
      });
    }
  };

  const handleSaveNotes = () => {
    if (!selectedSuggestion) return;
    
    updateStatusMutation.mutate({ 
      id: selectedSuggestion.id, 
      status: 'done', 
      adminNotes: notesValue 
    });
  };

  const handleDeleteSuggestion = (suggestionId) => {
    if (confirm('هل أنت متأكد من حذف هذا الاقتراح؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      deleteSuggestionMutation.mutate({ id: suggestionId });
    }
  };

  if (suggestionsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل الاقتراحات...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hitman-400 text-sm">إجمالي الاقتراحات</p>
              <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-accent-blue" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm">غير مقروء</p>
              <p className="text-2xl font-bold text-red-300">{stats?.unread || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm">قيد المعالجة</p>
              <p className="text-2xl font-bold text-yellow-300">{stats?.pending || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">مكتمل</p>
              <p className="text-2xl font-bold text-green-300">{stats?.done || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hitman-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في الاقتراحات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-hitman-800/50 border border-hitman-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-hitman-400 focus:outline-none focus:ring-2 focus:ring-accent-red"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-hitman-800/50 border border-hitman-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"
          >
            <option value="">جميع الحالات</option>
            <option value="unread">غير مقروء</option>
            <option value="pending">قيد المعالجة</option>
            <option value="done">مكتمل</option>
          </select>
        </div>
      </div>

      {/* Suggestions Table */}
      <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-hitman-800/50">
              <tr>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">المستخدم</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">النوع</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">العنوان</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">الحالة</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">التاريخ</th>
                <th className="px-6 py-4 text-right text-hitman-300 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hitman-700">
              {suggestionsData?.suggestions?.map((suggestion) => (
                <tr key={suggestion.id} className="hover:bg-hitman-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-hitman-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-hitman-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{suggestion.User?.Character?.name || suggestion.User?.username}</div>
                        <div className="text-sm text-hitman-400">{suggestion.User?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-hitman-700 text-hitman-300">
                      {TYPE_LABELS[suggestion.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="font-medium text-white truncate">{suggestion.title}</div>
                      <div className="text-sm text-hitman-400 truncate">{suggestion.message}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[suggestion.status]}`}>
                      {STATUS_LABELS[suggestion.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-hitman-400" />
                      <span className="text-sm text-hitman-300">
                        {new Date(suggestion.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSuggestion(suggestion)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {suggestion.status !== 'done' && (
                        <button
                          onClick={() => handleStatusUpdate(suggestion.id, 'done')}
                          className="text-green-400 hover:text-green-300 p-1 rounded"
                          title="تحديد كمكتمل"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {suggestion.status === 'unread' && (
                        <button
                          onClick={() => handleStatusUpdate(suggestion.id, 'pending')}
                          className="text-yellow-400 hover:text-yellow-300 p-1 rounded"
                          title="تحديد كقيد المعالجة"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                        title="حذف الاقتراح"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggestion Details Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-hitman-800 to-hitman-900 border border-hitman-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">تفاصيل الاقتراح</h3>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="text-hitman-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-hitman-300 mb-1">المستخدم</label>
                <p className="text-white">{selectedSuggestion.User?.Character?.name || selectedSuggestion.User?.username}</p>
                <p className="text-sm text-hitman-400">{selectedSuggestion.User?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hitman-300 mb-1">النوع</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-hitman-700 text-hitman-300">
                  {TYPE_LABELS[selectedSuggestion.type]}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hitman-300 mb-1">العنوان</label>
                <p className="text-white">{selectedSuggestion.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hitman-300 mb-1">الرسالة</label>
                <p className="text-white whitespace-pre-wrap">{selectedSuggestion.message}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hitman-300 mb-1">الحالة</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedSuggestion.status]}`}>
                  {STATUS_LABELS[selectedSuggestion.status]}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-hitman-300 mb-1">تاريخ الإرسال</label>
                <p className="text-white">{new Date(selectedSuggestion.createdAt).toLocaleString('ar-SA')}</p>
              </div>
              
              {selectedSuggestion.adminNotes && (
                <div>
                  <label className="block text-sm font-medium text-hitman-300 mb-1">ملاحظات الإدارة</label>
                  <p className="text-white whitespace-pre-wrap">{selectedSuggestion.adminNotes}</p>
                </div>
              )}
              
              {selectedSuggestion.resolvedAt && (
                <div>
                  <label className="block text-sm font-medium text-hitman-300 mb-1">تاريخ الحل</label>
                  <p className="text-white">{new Date(selectedSuggestion.resolvedAt).toLocaleString('ar-SA')}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              {selectedSuggestion.status !== 'done' && (
                <button
                  onClick={() => handleStatusUpdate(selectedSuggestion.id, 'done')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  تحديد كمكتمل
                </button>
              )}
              {selectedSuggestion.status === 'unread' && (
                <button
                  onClick={() => handleStatusUpdate(selectedSuggestion.id, 'pending')}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  تحديد كقيد المعالجة
                </button>
              )}
              <button
                onClick={() => handleDeleteSuggestion(selectedSuggestion.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {editingNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-hitman-800 to-hitman-900 border border-hitman-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">إضافة ملاحظات الإدارة</h3>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="اكتب ملاحظات الإدارة هنا..."
              className="w-full bg-hitman-700 border border-hitman-600 rounded-lg p-3 text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent-red"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveNotes}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNotesValue('');
                }}
                className="flex-1 bg-hitman-600 hover:bg-hitman-700 text-white py-2 px-4 rounded-lg transition-colors"
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