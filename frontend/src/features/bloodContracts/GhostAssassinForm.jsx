import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { toast } from 'react-hot-toast';
import VipName from '../profile/VipName.jsx';
import MoneyIcon from '@/components/MoneyIcon';
import { Skull, Target, ImageIcon, Crosshair, User, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

const GHOST_ASSASSIN_PRICE = 5;

const GhostAssassinForm = () => {
  const [targetId, setTargetId] = useState('');
  const [targetInfo, setTargetInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTarget, setFetchingTarget] = useState(false);
  const [error, setError] = useState('');
  const [targetError, setTargetError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!targetId) {
      setTargetInfo(null);
      setTargetError('');
      return;
    }
    setFetchingTarget(true);
    setTargetError('');
    const token = localStorage.getItem('jwt');
    fetch(`/api/profile/${targetId}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          setTargetInfo(null);
          setTargetError('لا يوجد لاعب بهذا الرقم.');
          return;
        }
        const data = await res.json();
        setTargetInfo(data);
        setTargetError('');
      })
      .catch(() => {
        setTargetInfo(null);
        setTargetError('فشل في جلب بيانات اللاعب.');
      })
      .finally(() => setFetchingTarget(false));
  }, [targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('/api/bloodcontracts/ghost-assassin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message === 'Insufficient black coins.' ? 'لا تملك عملة سوداء كافية.' : data.message || 'حدث خطأ ما.');
      } else {
        setResult('تم تنفيذ الاغتيال بنجاح! تم نقل الهدف إلى المستشفى لمدة 30 دقيقة.');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">القاتل الشبح</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Ghost Assassin</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Skull className="w-4 h-4 text-red-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">الاغتيال</div>
                <div className="text-xs text-white/80 drop-shadow">Assassination</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ghost Assassin Image Card */}
        <div className="card-3d p-6 text-center">
          <div className="relative mb-6">
            <div className="w-full h-48 md:h-64 rounded-xl border-2 border-blood-500/50 bg-gradient-to-br from-blood-950/30 to-black/40 p-2 shadow-2xl overflow-hidden">
              <img
                src="/images/ghostassasin.jpeg"
                alt="Ghost Assassin"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-blood-800/60 to-blood-600/40 flex items-center justify-center text-blood-200 font-bold text-6xl hidden">
                👻
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-blood-400 mb-2 flex items-center justify-center gap-2">
            <Skull className="w-8 h-8" />
            القاتل الشبح
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blood-500 to-transparent mx-auto"></div>
        </div>

        {/* Description Card */}
        <div className="card-3d p-6 bg-gradient-to-br from-purple-950/20 to-indigo-950/10 border-purple-500/30">
          <div className="text-center">
            <div className="text-purple-400 font-bold text-lg mb-4 flex items-center justify-center gap-2">
              <Crosshair className="w-5 h-5" />
              ما هو القاتل الشبح؟
            </div>
            <div className="text-white/90 leading-relaxed">
              القاتل الشبح هو قاتل محترف يمكنك استئجاره مقابل{' '}
              <span className="text-blood-400 font-bold text-lg">{GHOST_ASSASSIN_PRICE} عملة سوداء</span>{' '}
              لتنفيذ عملية اغتيال فورية لأي لاعب تختاره. سيتم نقل الهدف مباشرة إلى المستشفى لمدة 30 دقيقة دون قتال أو مقاومة.
            </div>
          </div>
        </div>

        {/* Form Section */}
        {!result && (
          <div className="card-3d p-6">
            <h3 className="text-lg font-bold text-blood-400 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              تحديد الهدف
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Input */}
              <div>
                <label htmlFor="targetId" className="block text-white/90 font-bold mb-3">
                  🎯 أدخل رقم اللاعب المستهدف:
                </label>
                <input
                  id="targetId"
                  type="number"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  required
                  min="1"
                  className="input-3d text-center text-lg"
                  placeholder="مثال: 123"
                  dir="ltr"
                />
              </div>

              {/* Loading State */}
              {fetchingTarget && (
                <div className="card-3d bg-yellow-950/20 border-yellow-500/40 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-yellow-400">
                    <Loader className="w-4 h-4 animate-spin" />
                    جاري البحث عن اللاعب...
                  </div>
                </div>
              )}

              {/* Target Info Display */}
              {targetInfo && !targetError && (
                <div className="card-3d bg-gradient-to-br from-green-950/30 to-emerald-950/20 border-green-500/50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-lg mb-2">
                    <Target className="w-5 h-5" />
                    الهدف المحدد:
                  </div>
                  <div className="text-white text-xl font-bold">
                    <VipName user={targetInfo} />
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    ID: {targetInfo.userId || targetInfo.id}
                  </div>
                </div>
              )}

              {/* Target Error */}
              {targetError && (
                <div className="card-3d bg-gradient-to-br from-red-950/30 to-red-800/20 border-red-500/50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    {targetError}
                  </div>
                </div>
              )}

              {/* Price Display */}
              <div className="text-center">
                <div className="card-3d bg-gradient-to-br from-yellow-950/20 to-amber-950/10 border-yellow-500/40 p-4 inline-block">
                  <div className="flex items-center gap-3">
                    <MoneyIcon className="w-6 h-6" />
                    <span className="text-yellow-400 font-bold text-xl">السعر: {GHOST_ASSASSIN_PRICE} عملة سوداء</span>
                    <MoneyIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !targetId || !!targetError || !targetInfo}
                className={`btn-3d w-full py-4 text-xl font-bold flex items-center justify-center gap-2 ${
                  loading || !targetId || !!targetError || !targetInfo
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    جاري التنفيذ...
                  </>
                ) : (
                  <>
                    <Skull className="w-5 h-5" />
                    استدعاء القاتل الشبح
                    <Crosshair className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="card-3d bg-gradient-to-br from-red-950/30 to-red-800/20 border-red-500/50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="card-3d p-6 bg-gradient-to-br from-green-950/30 to-emerald-950/20 border-green-500/50 text-center">
            <div className="flex items-center justify-center gap-3 text-green-400 font-bold text-2xl mb-4">
              <CheckCircle className="w-8 h-8" />
              تم التنفيذ بنجاح!
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-4"></div>
            <div className="text-white text-lg leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GhostAssassinForm;
