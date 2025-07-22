import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Clock, DollarSign, Star, AlertTriangle, Zap, Trophy, Shield, Crown } from 'lucide-react';
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
    <div className="mb-8">
      <div className="text-center mb-3">
        <h3 className="text-2xl font-bold text-accent-red mb-2">
          {isInJail ? "🚔 تم القبض عليك!" : "🏥 تم نقلك إلى المستشفى!"}
        </h3>
        <div className="text-hitman-300 text-base">
          {isInJail 
            ? "فشل في المهمة أدى إلى القبض عليك ووضعك في السجن" 
            : "أصبت بجروح خطيرة أثناء المهمة وتم نقلك للعلاج"
          }
        </div>
      </div>
      {confinementDetails && (
        <div className={`${isInJail ? 'bg-red-900/40 border-red-500/50' : 'bg-blue-900/40 border-blue-500/50'} border rounded-xl p-4 mb-3 text-center`}>
          <div className={`${isInJail ? 'text-red-300' : 'text-blue-300'} font-bold text-xl mb-1`}>
            {isInJail 
              ? `مدة السجن: ${confinementDetails.minutes} دقيقة`
              : `مدة العلاج: ${confinementDetails.minutes} دقيقة`
            }
          </div>
          <div className={`${isInJail ? 'text-red-400' : 'text-blue-400'} text-sm`}>
            {isInJail 
              ? `تكلفة الكفالة: ${confinementDetails.bailRate.toLocaleString()} دولار`
              : `تكلفة العلاج: ${confinementDetails.healRate.toLocaleString()} دولار`
            }
          </div>
          <div className="text-hitman-300 text-xs mt-2">
            {new Date(confinementDetails.releaseAt).toLocaleString('ar-SA')}
          </div>
        </div>
      )}
    </div>
  ) : null;

  // Enhanced rewards breakdown
  const rewardsBreakdown = (
    <div className="bg-hitman-800/40 border border-hitman-700 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-accent-red mb-4 text-center">المكافآت المكتسبة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="font-bold text-green-300">المال المكتسب</span>
          </div>
          <div className="text-2xl font-bouya text-green-400">{payout?.toLocaleString() || '0'}</div>
          <div className="text-sm text-green-300">
            {success ? "مكافأة النجاح" : "لا توجد مكافأة للفشل"}
          </div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-yellow-300">الخبرة المكتسبة</span>
          </div>
          <div className="text-2xl font-bouya text-yellow-400">+{expGain || 0}</div>
          <div className="text-sm text-yellow-300">
            {success ? "خبرة كاملة" : "خبرة جزئية للفشل"}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-bold text-accent-yellow">
          المستوى الحالي: {currentLevel} | الخبرة: {currentExp}/{nextLevelExp}
        </div>
        {levelUpRewards && levelUpRewards.length > 0 && (
          <div className="text-accent-green text-sm mt-2">
            🎉 تم ترقية المستوى! +{levelUpRewards.length} مستوى جديد
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced narrative section
  const narrativeSection = narrative ? (
    <div className="bg-gradient-to-r from-hitman-800/60 to-hitman-900/60 border border-accent-red/30 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-accent-yellow" />
        <h3 className="text-xl font-bold text-accent-yellow">تحليل المهمة</h3>
      </div>
      <div className="text-hitman-200 text-lg leading-relaxed text-center">
        {narrative}
      </div>
    </div>
  ) : null;

  // Crime details section
  const crimeDetails = (
    <div className="bg-gradient-to-r from-hitman-800/40 to-hitman-900/40 border border-hitman-700 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-6 h-6 text-accent-red" />
        <h3 className="text-xl font-bold text-accent-red">تفاصيل المهمة</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white mb-1">{crimeName}</div>
          <div className="text-sm text-hitman-300">{crimeDescription}</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${success ? 'text-accent-green' : 'text-accent-red'} mb-1`}>
            {success ? "✅ نجح" : "❌ فشل"}
          </div>
          <div className="text-sm text-hitman-300">
            {success ? "تم إكمال المهمة بنجاح" : "فشلت في إكمال المهمة"}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white flex flex-col items-center justify-start p-0">
      <div className="w-full flex flex-col items-center justify-start py-12 px-2 sm:px-8 lg:px-32 animate-fade-in">
        <div className="text-center mb-8">
          <Target className="w-16 h-16 mx-auto text-accent-red animate-bounce mb-4" />
          <h2 className="text-4xl font-bouya mb-2 text-accent-red">نتيجة المهمة</h2>
          <div className="w-40 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-4" />
        </div>
        
        {/* Animated content based on current step */}
        <div className="w-full animate-fade-in space-y-6">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isInJail ? (
                  <button
                    onClick={() => navigate('/dashboard/jail')}
                    className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xl font-bold rounded-2xl transition-all duration-300"
                  >
                    الذهاب إلى السجن
                  </button>
                ) : isInHospital ? (
                  <button
                    onClick={() => navigate('/dashboard/hospital')}
                    className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xl font-bold rounded-2xl transition-all duration-300"
                  >
                    الذهاب إلى المستشفى
                  </button>
                ) : null}
                
                <button
                  onClick={() => navigate('/dashboard/crimes')}
                  className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xl font-bold rounded-2xl transition-all duration-300"
                >
                  العودة للجرائم
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-hitman-700 to-hitman-800 hover:from-hitman-600 hover:to-hitman-700 text-white text-xl font-bold rounded-2xl transition-all duration-300"
                >
                  لوحة التحكم
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 