import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Modal from '@/components/Modal';

const GameNewsManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', color: 'yellow' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all news for admin
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['admin-game-news'],
    queryFn: () => axios.get('/api/game-news/admin/news').then(res => res.data),
    staleTime: 30000
  });

  const handleCreateNews = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/game-news/admin/news', formData);
      queryClient.invalidateQueries(['admin-game-news']);
      setShowCreateModal(false);
      setFormData({ title: '', content: '', color: 'yellow' });
    } catch (error) {
      console.error('Error creating news:', error);
      alert('حدث خطأ أثناء إنشاء الخبر');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNews = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put(`/api/game-news/admin/news/${selectedNews.id}`, formData);
      queryClient.invalidateQueries(['admin-game-news']);
      setShowEditModal(false);
      setSelectedNews(null);
      setFormData({ title: '', content: '', color: 'yellow' });
    } catch (error) {
      console.error('Error updating news:', error);
      alert('حدث خطأ أثناء تحديث الخبر');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`/api/game-news/admin/news/${selectedNews.id}`);
      queryClient.invalidateQueries(['admin-game-news']);
      setShowDeleteModal(false);
      setSelectedNews(null);
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('حدث خطأ أثناء حذف الخبر');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (news) => {
    setSelectedNews(news);
    setFormData({ title: news.title, content: news.content, color: news.color || 'yellow' });
    setShowEditModal(true);
  };

  const openDeleteModal = (news) => {
    setSelectedNews(news);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400">حدث خطأ أثناء تحميل الأخبار</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">إدارة أخبار اللعبة</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة خبر جديد
        </button>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {news?.map((item) => (
          <div
            key={item.id}
            className="bg-gradient-to-br from-zinc-950 to-black border border-zinc-800/50 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    item.isActive 
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                      : 'bg-red-600/20 text-red-400 border border-red-600/30'
                  }`}>
                    {item.isActive ? 'نشط' : 'غير نشط'}
                  </div>
                </div>
                <p className="text-zinc-400 text-sm line-clamp-3">{item.content}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(item)}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{item.admin?.username || 'غير معروف'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}

        {news?.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">لا توجد أخبار حالياً</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="إضافة خبر جديد"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              عنوان الخبر
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
              placeholder="أدخل عنوان الخبر"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              محتوى الخبر
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none resize-none"
              placeholder="أدخل محتوى الخبر"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              لون العنوان
            </label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            >
              <option value="yellow">أصفر</option>
              <option value="green">أخضر</option>
              <option value="red">أحمر</option>
              <option value="blue">أزرق</option>
              <option value="purple">بنفسجي</option>
              <option value="orange">برتقالي</option>
              <option value="pink">وردي</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreateNews}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-2 rounded-lg transition-colors"
            >
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة الخبر'}
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل الخبر"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              عنوان الخبر
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
              placeholder="أدخل عنوان الخبر"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              محتوى الخبر
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none resize-none"
              placeholder="أدخل محتوى الخبر"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              لون العنوان
            </label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
            >
              <option value="yellow">أصفر</option>
              <option value="green">أخضر</option>
              <option value="red">أحمر</option>
              <option value="blue">أزرق</option>
              <option value="purple">بنفسجي</option>
              <option value="orange">برتقالي</option>
              <option value="pink">وردي</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleEditNews}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-2 rounded-lg transition-colors"
            >
              {isSubmitting ? 'جاري التحديث...' : 'تحديث الخبر'}
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد الحذف"
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-zinc-300 mb-6">
            هل أنت متأكد من حذف الخبر "{selectedNews?.title}"؟
            <br />
            <span className="text-red-400">هذا الإجراء لا يمكن التراجع عنه.</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteNews}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-2 rounded-lg transition-colors"
            >
              {isSubmitting ? 'جاري الحذف...' : 'حذف'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GameNewsManagement; 