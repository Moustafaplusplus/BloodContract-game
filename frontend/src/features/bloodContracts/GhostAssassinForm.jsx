import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import VipName from '../profile/VipName.jsx';
import MoneyIcon from '@/components/MoneyIcon';

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
        setError(data.message === 'Insufficient black coins.' ? 'لا تملك عملة سودا كافية.' : data.message || 'حدث خطأ ما.');
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
    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-red-600 rounded-2xl p-8 max-w-2xl mx-auto my-8 shadow-2xl shadow-red-900/30 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-red-900/10"></div>
      
      {/* Header with Ghost Assassin Avatar */}
      <div className="relative z-10 text-center mb-8">
        <div className="mb-6">
          <div className="relative">
            {/* Ghost Assassin Avatar - Full Width */}
            <div className="w-full h-48 md:h-64 rounded-2xl border-4 md:border-0 border-red-600 bg-gradient-to-br from-red-900 to-red-700 md:bg-transparent p-2 md:p-0 shadow-2xl md:shadow-none shadow-red-500/50 overflow-hidden">
              <img
                src="/images/ghostassasin.png"
                alt="Ghost Assassin"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center text-red-200 font-bold text-6xl hidden">
                👻
              </div>
            </div>
            {/* Glow effect around image */}
            <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl animate-pulse md:hidden"></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-red-500 mb-2 drop-shadow-lg">
          القاتل الشبح
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
      </div>

      {/* Description Card */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-red-600/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-red-400 font-bold text-lg mb-3 flex items-center justify-center gap-2">
            <span className="text-2xl">⚔️</span>
            ما هو القاتل الشبح؟
            <span className="text-2xl">⚔️</span>
          </div>
          <div className="text-gray-300 leading-relaxed">
            القاتل الشبح هو قاتل محترف يمكنك استئجاره مقابل{' '}
            <span className="text-red-400 font-bold text-lg">{GHOST_ASSASSIN_PRICE} عملة سودا</span>{' '}
            لتنفيذ عملية اغتيال فورية لأي لاعب تختاره. سيتم نقل الهدف مباشرة إلى المستشفى لمدة 30 دقيقة دون قتال أو مقاومة.
          </div>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className={`relative z-10 ${result ? 'hidden' : 'block'}`}>
        <div className="space-y-6">
          {/* Target Input */}
          <div>
            <label htmlFor="targetId" className="block text-red-400 font-bold mb-3 text-lg">
              🎯 أدخل رقم اللاعب المستهدف:
            </label>
            <input
              id="targetId"
              type="number"
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
              required
              min="1"
              className="w-full px-4 py-3 bg-gray-800 border-2 border-red-600/50 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 text-center text-lg"
              placeholder="مثال: 123"
              dir="ltr"
            />
          </div>

          {/* Loading State */}
          {fetchingTarget && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-yellow-400">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                جاري البحث عن اللاعب...
              </div>
            </div>
          )}

          {/* Target Info Display */}
          {targetInfo && !targetError && (
            <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-500/50 rounded-xl p-4 text-center">
              <div className="text-green-400 font-bold text-lg mb-2">🎯 الهدف المحدد:</div>
              <div className="text-white text-xl font-bold">
                <VipName user={targetInfo} />
              </div>
              <div className="text-gray-400 text-sm mt-1">
                ID: {targetInfo.userId || targetInfo.id}
              </div>
            </div>
          )}

          {/* Target Error */}
          {targetError && (
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border-2 border-red-500/50 rounded-xl p-4 text-center">
              <div className="text-red-400 font-bold">❌ {targetError}</div>
            </div>
          )}

          {/* Price Display */}
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-600/50 rounded-xl px-6 py-3">
              <MoneyIcon className="w-6 h-6" />
              <span className="text-red-400 font-bold text-xl">السعر: {GHOST_ASSASSIN_PRICE} عملة سودا</span>
              <MoneyIcon className="w-6 h-6" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !targetId || !!targetError || !targetInfo}
            className={`w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-300 transform ${
              loading || !targetId || !!targetError || !targetInfo
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white hover:scale-105 shadow-lg shadow-red-500/30'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التنفيذ...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">👻</span>
                استدعاء القاتل الشبح
                <span className="text-2xl">⚔️</span>
              </div>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border-2 border-red-500/50 rounded-xl p-4 text-center">
              <div className="text-red-400 font-bold">❌ {error}</div>
            </div>
          )}
        </div>
      </form>

      {/* Success Result */}
      {result && (
        <div className="relative z-10 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-500/50 rounded-xl p-8 text-center">
          <div className="text-green-400 font-bold text-2xl mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl">✅</span>
            تم التنفيذ بنجاح!
            <span className="text-3xl">✅</span>
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto mb-4"></div>
          <div className="text-white text-lg leading-relaxed whitespace-pre-line">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default GhostAssassinForm;
