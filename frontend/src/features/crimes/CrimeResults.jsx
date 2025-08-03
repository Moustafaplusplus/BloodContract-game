import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Clock, DollarSign, Star, AlertTriangle, Zap, Trophy, Shield, Crown, Building2, Heart, ImageIcon } from 'lucide-react';
import VipName from '../profile/VipName.jsx';

export default function CrimeResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const crimeResult = location.state?.crimeResult;
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (!crimeResult) {
      navigate('/dashboard/crimes', { replace: true });
      return;
    }
    
    // Animate through steps: narrative -> rewards -> confinement status
    if (currentStep < 3) {
      const timer = setTimeout(() => setCurrentStep(s => s + 1), 1500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowFinal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, crimeResult, navigate]);

  if (!crimeResult) return null;

  const { 
    success, 
    payout, 
    expGain, 
    crimeName, 
    crimeDescription,
    narrative, 
    redirect, 
    confinementDetails,
    currentLevel,
    currentExp,
    nextLevelExp,
    levelUpRewards
  } = crimeResult;
  
  const isInJail = redirect && redirect.includes("jail");
  const isInHospital = redirect && redirect.includes("hospital");

  // Enhanced confinement message
  const confinementMsg = (isInJail || isInHospital) ? (
    <div className="card-3d p-6 bg-gradient-to-r from-red-950/30 to-orange-950/20 border-red-500/50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {isInJail ? (
            <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
          ) : (
            <Heart className="w-8 h-8 text-blue-400 animate-pulse" />
          )}
          <h3 className="text-2xl font-bold text-blood-400">
            {isInJail ? "تم القبض عليك!" : "تم نقلك إلى المستشفى!"}
          </h3>
        </div>
        <div className="text-white/80 text-base mb-4">
          {isInJail 
            ? "فشل في المهمة أدى إلى القبض عليك ووضعك في السجن" 
            : "أصبت بجروح خطيرة أثناء المهمة وتم نقلك للعلاج"
          }
        </div>
        {confinementDetails && (
          <div className={`card-3d ${isInJail ? 'bg-red-950/30 border-red-500/40' : 'bg-blue-950/30 border-blue-500/40'} p-4 text-center`}>
            <div className={`${isInJail ? 'text-red-300' : 'text-blue-300'} font-bold text-xl mb-2`}>
              {isInJail 
                ? `مدة السجن: ${confinementDetails.minutes} دقيقة`
                : `مدة العلاج: ${confinementDetails.minutes} دقيقة`
              }
            </div>
            <div className={`${isInJail ? 'text-red-400' : 'text-blue-400'} text-sm`}>
              {isInJail 
                ? `تكلفة الكفالة: ${(confinementDetails.minutes * 100).toLocaleString()} دولار`
                : `تكلفة العلاج: ${(confinementDetails.minutes * 100).toLocaleString()} دولار`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  // Enhanced rewards breakdown
  const rewardsBreakdown = (
    <div className="card-3d p-6">
      <h3 className="text-xl font-bold text-blood-400 mb-4 text-center flex items-center justify-center gap-2">
        <Trophy className="w-6 h-6" />
        المكافآت المكتسبة
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-3d bg-gradient-to-br from-green-950/30 to-emerald-950/20 border-green-500/30 p-4 text-center group hover:border-green-500/50 transition-colors duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold text-green-300">المال المكتسب</span>
          </div>
          <div className="text-2xl font-bouya text-green-400 mb-1">{payout?.toLocaleString() || '0'}</div>
          <div className="text-sm text-green-300">
            {success ? "مكافأة النجاح" : "لا توجد مكافأة للفشل"}
          </div>
        </div>
        <div className="card-3d bg-gradient-to-br from-yellow-950/30 to-amber-950/20 border-yellow-500/30 p-4 text-center group hover:border-yellow-500/50 transition-colors duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold text-yellow-300">الخبرة المكتسبة</span>
          </div>
          <div className="text-2xl font-bouya text-yellow-400 mb-1">+{expGain || 0}</div>
          <div className="text-sm text-yellow-300">
            {success ? "خبرة كاملة" : "خبرة جزئية للفشل"}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="card-3d bg-black/40 border-white/20 p-3">
          <div className="text-lg font-bold text-yellow-400 mb-1">
            المستوى الحالي: {currentLevel} | الخبرة: {currentExp}/{nextLevelExp}
          </div>
          {levelUpRewards && levelUpRewards.length > 0 && (
            <div className="text-green-400 text-sm flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              🎉 تم ترقية المستوى! +{levelUpRewards.length} مستوى جديد
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Enhanced narrative section
  const narrativeSection = narrative ? (
    <div className="card-3d p-6 bg-gradient-to-br from-purple-950/20 to-indigo-950/10 border-purple-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-purple-400">تحليل المهمة</h3>
      </div>
      <div className="text-white/90 text-lg leading-relaxed text-center">
        {narrative}
      </div>
    </div>
  ) : null;

  // Crime details section
  const crimeDetails = (
    <div className="card-3d p-6">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-6 h-6 text-blood-400" />
        <h3 className="text-xl font-bold text-blood-400">تفاصيل المهمة</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-3d bg-black/40 border-white/20 p-4 text-center">
          <div className="text-lg font-bold text-white mb-1">{crimeName}</div>
          <div className="text-sm text-white/60">{crimeDescription}</div>
        </div>
        <div className="card-3d bg-black/40 border-white/20 p-4 text-center">
          <div className={`text-2xl font-bold ${success ? 'text-green-400' : 'text-red-400'} mb-1`}>
            {success ? "✅ نجح" : "❌ فشل"}
          </div>
          <div className="text-sm text-white/60">
            {success ? "تم إكمال المهمة بنجاح" : "فشلت في إكمال المهمة"}
          </div>
        </div>
      </div>
    </div>
  );

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
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">نتيجة المهمة</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Crime Results</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Target className="w-4 h-4 text-red-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{success ? "نجح" : "فشل"}</div>
                <div className="text-xs text-white/80 drop-shadow">Result</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated content based on current step */}
        <div className="space-y-6">
          {/* Step 1: Crime Details */}
          {currentStep >= 1 && (
            <div className="animate-slide-up">
              {crimeDetails}
            </div>
          )}

          {/* Step 2: Narrative */}
          {currentStep >= 2 && narrativeSection && (
            <div className="animate-slide-up">
              {narrativeSection}
            </div>
          )}

          {/* Step 3: Rewards */}
          {currentStep >= 3 && (
            <div className="animate-slide-up">
              {rewardsBreakdown}
            </div>
          )}

          {/* Final step: Confinement Status */}
          {showFinal && (
            <div className="animate-slide-up space-y-6">
              {/* Confinement Status */}
              {confinementMsg}

              {/* Action Buttons */}
              <div className="card-3d p-4">
                <h3 className="text-lg font-bold text-blood-400 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  الإجراءات التالية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {isInJail && (
                    <button
                      onClick={() => navigate('/dashboard/jail')}
                      className="btn-3d py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                    >
                      <Building2 className="w-4 h-4" />
                      الذهاب إلى السجن
                    </button>
                  )}
                  
                  {isInHospital && (
                    <button
                      onClick={() => navigate('/dashboard/hospital')}
                      className="btn-3d py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                    >
                      <Heart className="w-4 h-4" />
                      الذهاب إلى المستشفى
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/dashboard/crimes')}
                    className="btn-3d py-3 flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    العودة للجرائم
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-3d-secondary py-3 flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    لوحة التحكم
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
