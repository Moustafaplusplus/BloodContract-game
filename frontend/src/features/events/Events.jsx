import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Events() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch active events
  const {
    data: activeEvents = [],
    isLoading: activeEventsLoading,
    error: activeEventsError
  } = useQuery({
    queryKey: ['active-events'],
    queryFn: () => axios.get('/api/events').then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch user's event participations
  const {
    data: participations = [],
    isLoading: participationsLoading,
    error: participationsError
  } = useQuery({
    queryKey: ['event-participations'],
    queryFn: () => axios.get('/api/events/user/participations').then(res => res.data),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: (eventId) => axios.post(`/api/events/${eventId}/join`).then(res => res.data),
    onSuccess: (data) => {
      toast.success('تم الانضمام للفعالية بنجاح!');
      queryClient.invalidateQueries(['event-participations']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في الانضمام للفعالية';
      toast.error(message);
    }
  });

  // Leave event mutation
  const leaveEventMutation = useMutation({
    mutationFn: (eventId) => axios.delete(`/api/events/${eventId}/leave`).then(res => res.data),
    onSuccess: (data) => {
      toast.success('تم مغادرة الفعالية بنجاح!');
      queryClient.invalidateQueries(['event-participations']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في مغادرة الفعالية';
      toast.error(message);
    }
  });

  // Complete event mutation
  const completeEventMutation = useMutation({
    mutationFn: (eventId) => axios.post(`/api/events/${eventId}/complete`).then(res => res.data),
    onSuccess: (data) => {
      toast.success('تم إكمال الفعالية بنجاح!');
      queryClient.invalidateQueries(['event-participations']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في إكمال الفعالية';
      toast.error(message);
    }
  });

  // Claim rewards mutation
  const claimRewardsMutation = useMutation({
    mutationFn: (eventId) => axios.post(`/api/events/${eventId}/claim-rewards`).then(res => res.data),
    onSuccess: (data) => {
      toast.success(`تم استلام المكافآت بنجاح! ${data.rewards ? `حصلت على ${data.rewards.money} نقود و ${data.rewards.xp} خبرة` : ''}`);
      queryClient.invalidateQueries(['event-participations']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'فشل في استلام المكافآت';
      toast.error(message);
    }
  });

  if (activeEventsLoading || participationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الفعاليات...</p>
        </div>
      </div>
    );
  }

  if (activeEventsError || participationsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل الفعاليات</p>
      </div>
    );
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'CRIME': return '🔪';
      case 'FIGHT': return '🥊';
      case 'SPECIAL': return '⭐';
      case 'HOLIDAY': return '🎉';
      default: return '📅';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'CRIME': return 'text-accent-red';
      case 'FIGHT': return 'text-accent-orange';
      case 'SPECIAL': return 'text-accent-purple';
      case 'HOLIDAY': return 'text-accent-yellow';
      default: return 'text-accent-blue';
    }
  };

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">📅 الأحداث</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {activeEvents.map((event) => (
          <div key={event.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-white">
            <h3 className="font-bold text-lg text-red-500 mb-2">{event.title}</h3>
            <p className="text-gray-300 mb-2">{event.description}</p>
            <div className="flex justify-between text-sm mb-2">
              <span>التاريخ:</span>
              <span className="text-red-400 font-mono">{event.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 