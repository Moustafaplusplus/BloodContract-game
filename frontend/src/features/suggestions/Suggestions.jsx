import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Suggestions() {
  const [type, setType] = useState('suggestion');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/suggestions', {
        type,
        title,
        message
      });
      
      setSubmitted(true);
      setTitle('');
      setMessage('');
      setType('suggestion');
      toast.success('تم إرسال اقتراحك بنجاح! شكراً لمساهمتك.');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'فشل في إرسال الاقتراح';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-gradient-to-br from-hitman-900 to-black border border-accent-red/30 rounded-2xl shadow-2xl p-8 text-white animate-fade-in">
      <h2 className="text-3xl font-bouya mb-6 text-accent-red text-center">صفحة الاقتراحات / الإبلاغ عن مشكلة</h2>
      {submitted && (
        <div className="bg-green-800/60 border border-green-500/30 rounded-lg p-4 mb-6 text-center text-green-300 font-bold">
          تم إرسال اقتراحك بنجاح! شكراً لمساهمتك.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-bold">نوع الرسالة</label>
          <select
            className="form-input w-full bg-hitman-800 border border-accent-red/30 rounded-lg p-2 text-white"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="suggestion">اقتراح</option>
            <option value="bug">إبلاغ عن مشكلة</option>
            <option value="other">أخرى</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-bold">العنوان</label>
          <input
            className="form-input w-full bg-hitman-800 border border-accent-red/30 rounded-lg p-2 text-white"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="أدخل عنوانًا موجزًا"
          />
        </div>
        <div>
          <label className="block mb-2 font-bold">الرسالة</label>
          <textarea
            className="form-input w-full bg-hitman-800 border border-accent-red/30 rounded-lg p-2 text-white min-h-[120px]"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            placeholder="اكتب اقتراحك أو وصف المشكلة هنا..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent-red hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </form>
    </div>
  );
} 