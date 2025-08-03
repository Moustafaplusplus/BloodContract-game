import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Target, 
  Zap, 
  Trophy, 
  AlertTriangle, 
  Clock, 
  Activity,
  Crown,
  Heart,
  Shield,
  TrendingUp,
  Home,
  ChevronRight
} from 'lucide-react';
import VipName from '../profile/VipName.jsx';

// Enhanced round animation with blood theme
const RoundAnimation = ({ log, currentRound, showFinal }) => (
  <div className="card-3d p-6 bg-gradient-to-br from-blood-950/40 to-black/60 border-blood-500/30 max-h-[40vh] overflow-y-auto">
    <div className="flex items-center gap-2 mb-4">
      <Activity className="w-5 h-5 text-blood-400" />
      <h3 className="text-lg font-bold text-blood-400">سجل المعركة</h3>
    </div>
    
    {log && log.length > 0 ? (
      <div className="space-y-2">
        {log.slice(0, currentRound).map((line, i) => (
          <div 
            key={i} 
            className="text-sm text-white/90 p-2 rounded bg-black/40 border border-white/10 animate-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {line}
          </div>
        ))}
        {!showFinal && currentRound < log.length && (
          <div className="flex items-center justify-center p-4">
            <div className="loading-shimmer w-6 h-6 rounded-full"></div>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-4">
        <div className="text-white/50 text-sm">لا يوجد تفاصيل للمعركة</div>
      </div>
    )}
  </div>
);

// Enhanced Winner Display Component
const WinnerDisplay = ({ winner, rounds, totalDamage }) => (
  <div className="card-3d p-6 bg-gradient-to-br from-yellow-950/30 to-amber-950/20 border-yellow-500/40">
    <div className="flex items-center justify-center gap-3 mb-4">
      <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
      <h2 className="text-2xl font-bold text-yellow-400">الفائز</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Winner Info */}
      <div className="text-center">
        <div className="card-3d bg-yellow-500/10 border-yellow-500/30 p-4 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-xl font-bold">
            <VipName user={winner} />
          </div>
          <div className="text-sm text-yellow-300 mt-1">@{winner?.name || winner?.username}</div>
        </div>
      </div>
      
      {/* Rounds */}
      <div className="text-center">
        <div className="card-3d bg-blue-500/10 border-blue-500/30 p-4">
          <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-400">الجولات</div>
          <div className="text-2xl font-bold text-white">{rounds}</div>
        </div>
      </div>
      
      {/* Total Damage */}
      <div className="text-center">
        <div className="card-3d bg-red-500/10 border-red-500/30 p-4">
          <Zap className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-red-400">مجموع الضرر</div>
          <div className="text-2xl font-bold text-white">{totalDamage?.toFixed(0) || '0'}</div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Damage Breakdown Component
const DamageBreakdown = ({ attackerDamage, defenderDamage, totalDamage }) => (
  <div className="card-3d p-6">
    <div className="flex items-center gap-2 mb-4">
      <Target className="w-5 h-5 text-blood-400" />
      <h3 className="text-lg font-bold text-blood-400">تحليل الضرر</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Attacker Damage */}
      <div className="card-3d bg-gradient-to-br from-red-950/40 to-blood-950/20 border-red-500/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sword className="w-5 h-5 text-red-400" />
          <span className="font-bold text-red-300">ضرر المهاجم</span>
        </div>
        <div className="text-3xl font-bold text-red-400 mb-2">
          {attackerDamage?.toFixed(1) || '0'}
        </div>
        <div className="text-sm text-red-300">
          {attackerDamage && totalDamage ? `${((attackerDamage / totalDamage) * 100).toFixed(1)}%` : '0%'} من المجموع
        </div>
        <div className="progress-3d mt-3 h-2">
          <div 
            className="progress-3d-fill bg-gradient-to-r from-red-600 to-red-400"
            style={{ width: `${attackerDamage && totalDamage ? (attackerDamage / totalDamage) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
      
      {/* Defender Damage */}
      <div className="card-3d bg-gradient-to-br from-blue-950/40 to-cyan-950/20 border-blue-500/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-blue-300">ضرر المدافع</span>
        </div>
        <div className="text-3xl font-bold text-blue-400 mb-2">
          {defenderDamage?.toFixed(1) || '0'}
        </div>
        <div className="text-sm text-blue-300">
          {defenderDamage && totalDamage ? `${((defenderDamage / totalDamage) * 100).toFixed(1)}%` : '0%'} من المجموع
        </div>
        <div className="progress-3d mt-3 h-2">
          <div 
            className="progress-3d-fill bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ width: `${defenderDamage && totalDamage ? (defenderDamage / totalDamage) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Narrative Component
const NarrativeSection = ({ narrative }) => {
  if (!narrative) return null;
  
  return (
    <div className="card-3d p-6 bg-gradient-to-r from-purple-950/30 to-indigo-950/20 border-purple-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-bold text-purple-400">تحليل المعركة</h3>
      </div>
      <div className="text-white/90 text-base leading-relaxed text-center bg-black/40 rounded-lg p-4 border border-white/10">
        {narrative}
      </div>
    </div>
  );
};

// Enhanced Rewards Component
const RewardsSection = ({ xpGain, amountStolen, isAttackerWinner }) => (
  <div className="card-3d p-6 bg-gradient-to-br from-green-950/40 to-emerald-950/20 border-green-500/40">
    <div className="flex items-center gap-2 mb-4">
      <TrendingUp className="w-6 h-6 text-green-400" />
      <h3 className="text-lg font-bold text-green-400">المكافآت والمكاسب</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* XP Reward */}
      <div className="card-3d bg-green-500/10 border-green-500/30 p-4 text-center">
        <Zap className="w-6 h-6 text-green-400 mx-auto mb-2" />
        <div className="text-sm font-bold text-green-300 mb-1">نقاط الخبرة</div>
        <div className="text-2xl font-bold text-green-400">+{xpGain || 0}</div>
        <div className="text-xs text-green-300 mt-1">XP مكتسبة</div>
      </div>
      
      {/* Money Stolen */}
      {amountStolen > 0 && (
        <div className="card-3d bg-yellow-500/10 border-yellow-500/30 p-4 text-center">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-sm font-bold text-yellow-300 mb-1">المال المسروق</div>
          <div className="text-2xl font-bold text-yellow-400">${amountStolen.toLocaleString()}</div>
          <div className="text-xs text-yellow-300 mt-1">مكاسب نقدية</div>
        </div>
      )}
    </div>
    
    <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/10">
      <div className="text-center text-sm text-white/70">
        {isAttackerWinner ? 
          "🎉 انتصار رائع! كلما كان خصمك أقوى، زادت مكافآتك." :
          "💪 لا بأس، تعلم من التجربة. حارب خصوم أقوى للحصول على مكافآت أفضل."
        }
      </div>
    </div>
  </div>
);

// Enhanced Hospital Status Component
const HospitalStatus = ({ attackerWentToHospital, defenderWentToHospital }) => {
  if (!attackerWentToHospital && !defenderWentToHospital) return null;
  
  return (
    <div className="card-3d p-6 bg-gradient-to-br from-red-950/40 to-orange-950/20 border-red-500/40">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-red-400" />
        <h3 className="text-lg font-bold text-red-400">حالة المستشفى</h3>
      </div>
      
      <div className="space-y-3">
        {attackerWentToHospital && (
          <div className="card-3d bg-red-500/10 border-red-500/30 p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-red-300 font-bold text-lg">المهاجم في المستشفى</div>
            <div className="text-sm text-red-200 mt-1">فقدان كامل لنقاط الصحة</div>
          </div>
        )}
        
        {defenderWentToHospital && (
          <div className="card-3d bg-orange-500/10 border-orange-500/30 p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-orange-300 font-bold text-lg">المدافع في المستشفى</div>
            <div className="text-sm text-orange-200 mt-1">فقدان كامل لنقاط الصحة</div>
          </div>
        )}
        
        <div className="bg-black/40 rounded-lg p-3 border border-white/10">
          <div className="text-center text-sm text-white/70">
            ⚠️ الإصابات الخطيرة تتطلب العلاج في المستشفى وقد تكلف وقتاً ومالاً
          </div>
        </div>
      </div>
    </div>
  );
};

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

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom">
      <div className="container mx-auto max-w-4xl p-3 space-y-6">
        
        {/* Enhanced Header */}
        <div className="text-center py-6">
          <div className="relative inline-block mb-4">
            <Sword className="w-16 h-16 text-blood-400 animate-pulse" />
            <div className="absolute inset-0 bg-blood-500/20 rounded-full blur-xl"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blood-400 mb-2">نتيجة المعركة</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blood-500 to-transparent mx-auto"></div>
        </div>
        
        {/* Round Animation */}
        <RoundAnimation 
          log={log}
          currentRound={currentRound}
          showFinal={showFinal}
        />
        
        {showFinal && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Winner Display */}
            <WinnerDisplay 
              winner={winner}
              rounds={rounds}
              totalDamage={totalDamage}
            />
            
            {/* Damage Breakdown */}
            <DamageBreakdown 
              attackerDamage={attackerDamage}
              defenderDamage={defenderDamage}
              totalDamage={totalDamage}
            />
            
            {/* Narrative */}
            <NarrativeSection narrative={narrative} />
            
            {/* Rewards */}
            <RewardsSection 
              xpGain={xpGain}
              amountStolen={amountStolen}
              isAttackerWinner={isAttackerWinner}
            />
            
            {/* Hospital Status */}
            <HospitalStatus 
              attackerWentToHospital={attackerWentToHospital}
              defenderWentToHospital={defenderWentToHospital}
            />
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-3d flex-1 py-3 text-lg font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300"
              >
                <Home className="w-5 h-5" />
                العودة للوحة التحكم
              </button>
              <button
                onClick={() => navigate('/dashboard/active-users')}
                className="btn-3d-secondary flex-1 py-3 text-lg font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300"
              >
                <Sword className="w-5 h-5" />
                معركة أخرى
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
