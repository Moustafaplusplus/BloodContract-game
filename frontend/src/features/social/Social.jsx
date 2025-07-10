import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Social() {
  const {
    data: friends = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['friends'],
    queryFn: () => axios.get('/api/social/friends').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الأصدقاء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">خطأ في تحميل الأصدقاء</p>
      </div>
    );
  }

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">💬 التواصل</h1>
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-white max-w-lg mx-auto">
        <div className="mb-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded border border-zinc-700 p-2 bg-zinc-900 text-white"
            placeholder="اكتب رسالة..."
          />
          <button
            onClick={sendMessage}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
            disabled={sending}
          >
            {sending ? 'جاري الإرسال...' : 'إرسال'}
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="bg-zinc-800 rounded p-2 text-sm">
              <span className="text-red-500 font-bold">{msg.user}:</span> {msg.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 