import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sword } from 'lucide-react';
import VipName from '../profile/VipName.jsx';

export default function FightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const fightResult = location.state?.fightResult;
  const [currentRound, setCurrentRound] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (!fightResult) {
      navigate('/dashboard/fights', { replace: true });
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

  const { winner, rounds, totalDamage, log, xpGain, attackerFinalHp, defenderFinalHp, attackerId, defenderId, amountStolen } = fightResult;
  const attackerWentToHospital = attackerFinalHp <= 0;
  const defenderWentToHospital = defenderFinalHp <= 0;

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

  // Enhanced reward message
  const rewardMsg = (
    <div className="flex flex-col items-center justify-center mb-6 animate-fade-in">
      <div className="text-lg font-bold text-accent-green mb-2">المكافآت</div>
      <div className="text-base text-hitman-200 mb-1">خبرة مكتسبة: <span className="text-accent-yellow font-bold">+{xpGain}</span></div>
      {amountStolen > 0 && (
        <div className="text-base text-hitman-200 mb-1">المال المسروق: <span className="text-accent-red font-bold">+{amountStolen.toLocaleString()}$</span></div>
      )}
      <div className="text-sm text-hitman-400">كلما كان خصمك أقوى أو أغنى، زادت مكافآتك!</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white flex flex-col items-center justify-start p-0">
      <div className="w-full flex flex-col items-center justify-start py-12 px-2 sm:px-8 lg:px-32 animate-fade-in">
        <div className="text-center mb-8">
          <Sword className="w-16 h-16 mx-auto text-accent-red animate-bounce mb-4" />
          <h2 className="text-4xl font-bouya mb-2 text-accent-red">نتيجة القتال</h2>
          <div className="w-40 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-4" />
        </div>
        <div className="bg-hitman-800/60 border border-accent-red/30 rounded-2xl p-6 max-h-[40vh] w-full mb-10 text-right rtl overflow-y-auto shadow-lg">
          <div className="font-bold text-accent-red mb-3 text-lg">سجل القتال:</div>
          {log && log.length > 0 ? (
            log.slice(0, currentRound).map((line, i) => (
              <div key={i} className="text-base text-hitman-200 mb-2 animate-fade-in">{line}</div>
            ))
          ) : (
            <div className="text-hitman-400">لا يوجد تفاصيل</div>
          )}
        </div>
        {showFinal && (
          <div className="w-full animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-8">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-accent-red mb-2">الفائز</div>
                <div className="text-3xl font-bouya mb-1">
                  <VipName isVIP={winner?.isVIP}>{winner?.name || "؟"}</VipName>
                </div>
                <div className="text-hitman-300 text-lg">@{winner?.username}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-accent-yellow mb-2">الجولات</div>
                <div className="text-3xl font-bouya">{rounds}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-accent-green mb-2">إجمالي الضرر</div>
                <div className="text-3xl font-bouya">{totalDamage.toFixed(0)}</div>
              </div>
            </div>
            {rewardMsg}
            {hospitalMsg}
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