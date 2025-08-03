import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Send, 
  MessageSquare, 
  Bug, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  ImageIcon,
  Lightbulb,
  Star,
  Target,
  Users
} from 'lucide-react';

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
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'فشل في إرسال الاقتراح';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const messageTypes = [
    { 
      value: 'suggestion', 
      label: 'اقتراح', 
      icon: Lightbulb, 
      color: 'yellow',
      description: 'اقترح ميزة جديدة أو تحسين'
    },
    { 
      value: 'bug', 
      label: 'إبلاغ عن مشكلة', 
      icon: Bug, 
      color: 'red',
      description: 'أبلغ عن خطأ أو مشكلة في اللعبة'
    },
    { 
      value: 'other', 
      label: 'أخرى', 
      icon: HelpCircle, 
      color: 'blue',
      description: 'رسالة عامة أو استفسار'
    }
  ];

  const selectedType = messageTypes.find(t => t.value === type);

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-4xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-gray-800 to-blue-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2316a34a\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 10l5 10h-10z\"/%3E%3Ccircle cx=\"30\" cy=\"40\" r=\"8\"/%3E%3Cpath d=\"M15 25h30v5H15z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الاقتراحات والإبلاغ</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Suggestions & Reports</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Target className="w-4 h-4 text-green-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-400" />
                  Help
                </div>
                <div className="text-xs text-white/80 drop-shadow">المساعدة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="card-3d bg-green-950/40 border-green-500/50 p-4 text-center animate-fade-in">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-400 mb-2">تم إرسال رسالتك بنجاح!</h3>
            <p className="text-green-300 text-sm">شكراً لمساهمتك في تطوير اللعبة</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="card-3d p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Message Type Selection */}
            <div>
              <label className="block text-white font-bold mb-3">نوع الرسالة</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {messageTypes.map((msgType) => {
                  const IconComponent = msgType.icon;
                  return (
                    <label
                      key={msgType.value}
                      className={`card-3d p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        type === msgType.value 
                          ? `border-${msgType.color}-500/50 bg-${msgType.color}-950/30` 
                          : 'hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={msgType.value}
                        checked={type === msgType.value}
                        onChange={(e) => setType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                          type === msgType.value 
                            ? `bg-${msgType.color}-500/20 border border-${msgType.color}-500/40`
                            : 'bg-white/10 border border-white/20'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            type === msgType.value 
                              ? `text-${msgType.color}-400` 
                              : 'text-white/60'
                          }`} />
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${
                          type === msgType.value 
                            ? `text-${msgType.color}-400` 
                            : 'text-white/80'
                        }`}>
                          {msgType.label}
                        </h3>
                        <p className="text-xs text-white/60">{msgType.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-white font-bold mb-2">العنوان</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="أدخل عنوانًا موجزًا ووصفيًا"
                className="input-3d w-full"
                maxLength={100}
              />
              <div className="text-xs text-white/50 mt-1">{title.length}/100 حرف</div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-white font-bold mb-2">الرسالة</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder={
                  type === 'bug' 
                    ? 'اشرح المشكلة بالتفصيل: ما الذي حدث؟ متى حدث؟ ما الخطوات التي اتبعتها؟'
                    : type === 'suggestion'
                    ? 'اشرح اقتراحك بالتفصيل: ما هي الميزة المطلوبة؟ كيف ستحسن اللعبة؟'
                    : 'اكتب رسالتك هنا...'
                }
                className="input-3d w-full min-h-[120px] resize-y"
                maxLength={1000}
              />
              <div className="text-xs text-white/50 mt-1">{message.length}/1000 حرف</div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !title.trim() || !message.trim()}
              className={`w-full btn-3d py-4 text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
                selectedType ? `bg-${selectedType.color}-600/80 hover:bg-${selectedType.color}-700/80` : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border border-white/50 border-t-white rounded-full animate-spin"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  إرسال {selectedType?.label}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blue-950/20 to-purple-950/20 border-blue-500/30">
          <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            نصائح للحصول على أفضل استجابة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">كن محددًا ووصفيًا في رسالتك</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">اذكر الخطوات التي اتبعتها (للمشاكل)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">اقترح حلول أو بدائل (للاقتراحات)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">استخدم لغة مهذبة ومحترمة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="card-3d p-4 bg-gradient-to-r from-yellow-950/20 to-orange-950/20 border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-yellow-400 mb-1">تنويه مهم</h3>
              <p className="text-yellow-200 text-sm">
                سيتم مراجعة جميع الرسائل من قبل فريق التطوير. الرسائل المسيئة أو غير المناسبة قد تؤدي إلى منع الحساب.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
