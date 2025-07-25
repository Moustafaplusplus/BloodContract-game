import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sword, Target, Zap, Trophy, AlertTriangle } from 'lucide-react';
import VipName from '../profile/VipName.jsx';

export default function FightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const fightResult = location.state?.fightResult;
  const [currentRound, setCurrentRound] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (!fightResult) {
      navigate('/dashboard/active-users', { replace: true });
      return;
    }
    if (currentRound < (fightResult.log?.length || 0)) {
      const timer = setTimeout(() => setCurrentRound(r => r + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowFinal(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [currentRound, fightResult, navigate]);

  if (!fightResult) return null;

  const { 
    winner, 
    rounds, 
    totalDamage, 
    attackerDamage, 
    defenderDamage,
    log, 
    xpGain, 
    attackerFinalHp, 
    defenderFinalHp, 
    attackerId, 
    amountStolen,
    narrative 
  } = fightResult;
  
  const attackerWentToHospital = attackerFinalHp <= 0;
  const defenderWentToHospital = defenderFinalHp <= 0;
  const isAttackerWinner = winner?.userId === attackerId;

  // Enhanced hospital message
  const hospitalMsg = (attackerWentToHospital || defenderWentToHospital) ? (
    <div className="mb-8">
      <div className="text-center mb-3">
        <h3 className="text-2xl font-bold text-accent-red mb-2">🏥 حالة المستشفى بعد القتال</h3>
        <div className="text-hitman-300 text-base">الخسارة في القتال قد تؤدي إلى دخول المستشفى وخسارة وقت ومال!</div>
      </div>
      {attackerWentToHospital && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-4 mb-3 text-center">
          <div className="text-red-300 font-bold text-xl mb-1">المهاجم تم نقله إلى المستشفى بسبب فقدان كل نقاط الصحة!</div>
        </div>
      )}
      {defenderWentToHospital && (
        <div className="bg-green-900/40 border border-green-500/50 rounded-xl p-4 text-center">
          <div className="text-green-300 font-bold text-xl mb-1">المدافع تم نقله إلى المستشفى بسبب فقدان كل نقاط الصحة!</div>
        </div>
      )}
    </div>
  ) : null;

  // Enhanced damage breakdown
  const damageBreakdown = (
    <div className="bg-hitman-800/40 border border-hitman-700 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-accent-red mb-4 text-center">تفاصيل الضرر</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-red-400" />
            <span className="font-bold text-red-300">ضرر المهاجم</span>
          </div>
          <div className="text-2xl font-bouya text-red-400">{attackerDamage?.toFixed(1) || '0'}</div>
          <div className="text-sm text-red-300">
            {attackerDamage && totalDamage ? `${((attackerDamage / totalDamage) * 100).toFixed(1)}% من مجموع الضرر` : ''}
          </div>
        </div>
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-blue-300">ضرر المدافع</span>
          </div>
          <div className="text-2xl font-bouya text-blue-400">{defenderDamage?.toFixed(1) || '0'}</div>
          <div className="text-sm text-blue-300">
            {defenderDamage && totalDamage ? `${((defenderDamage / totalDamage) * 100).toFixed(1)}% من مجموع الضرر` : ''}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-bold text-accent-yellow">مجموع الضرر: {totalDamage?.toFixed(1) || '0'}</div>
        <div className="text-sm text-hitman-300">(مجموع ضرر كلا اللاعبين)</div>
      </div>
    </div>
  );

  // Enhanced narrative section
  const narrativeSection = narrative ? (
    <div className="bg-gradient-to-r from-hitman-800/60 to-hitman-900/60 border border-accent-red/30 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-accent-yellow" />
        <h3 className="text-xl font-bold text-accent-yellow">تحليل المعركة</h3>
      </div>
      <div className="text-hitman-200 text-lg leading-relaxed text-center">
        {narrative}
      </div>
    </div>
  ) : null;

  // Enhanced reward message
  const rewardMsg = (
    <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-accent-green" />
        <h3 className="text-xl font-bold text-accent-green">المكافآت المكتسبة</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div className="bg-green-800/30 rounded-lg p-3">
          <div className="text-lg font-bold text-accent-green mb-1">الخبرة</div>
          <div className="text-2xl font-bouya text-green-400">+{xpGain || 0}</div>
          <div className="text-sm text-green-300">نقطة خبرة</div>
        </div>
        {amountStolen > 0 && (
          <div className="bg-yellow-800/30 rounded-lg p-3">
            <div className="text-lg font-bold text-accent-yellow mb-1">المال المسروق</div>
            <div className="text-2xl font-bouya text-yellow-400">+{amountStolen.toLocaleString()}</div>
            <div className="text-sm text-yellow-300">دولار</div>
          </div>
        )}
      </div>
      <div className="text-center mt-4 text-sm text-hitman-300">
        {isAttackerWinner ? 
          "مكافآت عالية لانتصارك! كلما كان خصمك أقوى، زادت مكافآتك." :
          "مكافآت متواضعة للخسارة. حاول محاربة خصوم أقوى للحصول على مكافآت أفضل."
        }
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white flex flex-col items-center justify-start p-0">
      <div className="w-full flex flex-col items-center justify-start py-12 px-2 sm:px-8 lg:px-32 animate-fade-in">
        <div className="text-center mb-8">
          <Sword className="w-16 h-16 mx-auto text-accent-red animate-bounce mb-4" />
          <h2 className="text-4xl font-bouya mb-2 text-accent-red">نتيجة المعركة</h2>
          <div className="w-40 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-4" />
        </div>
        
        <div className="bg-hitman-800/60 border border-accent-red/30 rounded-2xl p-6 max-h-[40vh] w-full mb-10 text-right rtl overflow-y-auto shadow-lg">
          <div className="font-bold text-accent-red mb-3 text-lg">سجل المعركة:</div>
          {log && log.length > 0 ? (
            log.slice(0, currentRound).map((line, i) => (
              <div key={i} className="text-base text-hitman-200 mb-2 animate-fade-in">{line}</div>
            ))
          ) : (
            <div className="text-hitman-400">لا يوجد تفاصيل</div>
          )}
        </div>
        
        {showFinal && (
          <div className="w-full animate-fade-in space-y-6">
            {/* Winner and Stats */}
            <div className="bg-hitman-800/60 border border-accent-red/30 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-accent-red mb-2">الفائز</div>
                  <div className="text-3xl font-bouya mb-1">
                    <VipName isVIP={winner?.isVIP} className="compact">
                      {winner?.name || "؟"}
                    </VipName>
                  </div>
                  <div className="text-hitman-300 text-lg">@{winner?.username}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-accent-yellow mb-2">الجولات</div>
                  <div className="text-3xl font-bouya">{rounds}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-accent-green mb-2">مجموع الضرر</div>
                  <div className="text-3xl font-bouya">{totalDamage?.toFixed(0) || '0'}</div>
                  <div className="text-sm text-hitman-300">(ضرر كلا اللاعبين)</div>
                </div>
              </div>
            </div>

            {/* Damage Breakdown */}
            {damageBreakdown}

            {/* Narrative */}
            {narrativeSection}

            {/* Rewards */}
            {rewardMsg}

            {/* Hospital Status */}
            {hospitalMsg}

            {/* Action Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full md:w-1/2 py-4 mt-2 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xl font-bold rounded-2xl transition-all duration-300 mx-auto block"
            >
              العودة للوحة التحكم
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 