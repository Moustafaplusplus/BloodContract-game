import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth.jsx';
import MoneyIcon from '@/components/MoneyIcon';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Star, 
  Award, 
  ArrowLeft, 
  Crown,
  Shield,
  Sparkles,
  Trophy,
  Target,
  Scroll,
  ImageIcon,
  Clock,
  Zap
} from 'lucide-react';

const MinistryMission = () => {
  const { customToken } = useFirebaseAuth();
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [currentPage, setCurrentPage] = useState("start");
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedEnding, setCompletedEnding] = useState(null);
  const [missionRewards, setMissionRewards] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingMission, setPlayingMission] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    if (!customToken) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/ministry-missions/list', {
        headers: {
          'Authorization': `Bearer ${customToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch missions');
      }
      
      const data = await response.json();
      setMissions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startMission = async (mission) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ministry-missions/${mission.missionId}`, {
        headers: {
          'Authorization': `Bearer ${customToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch mission data');
      }
      
      const responseData = await response.json();
      setSelectedMission(responseData.data);
      setCurrentPage("start");
      setIsCompleted(false);
      setCompletedEnding(null);
      setMissionRewards(null);
      setImageLoaded(false);
      setPlayingMission(true);
    } catch (err) {
      setError('فشل في تحميل بيانات المهمة');
      console.error('Error fetching mission data:', err);
    } finally {
      setLoading(false);
    }
  };

  let parsedMissionData = null;
  if (selectedMission && selectedMission.missionData) {
    parsedMissionData = typeof selectedMission.missionData === 'string'
      ? JSON.parse(selectedMission.missionData)
      : selectedMission.missionData;
  }

  const handleOptionClick = async (nextPage) => {
    if (nextPage.startsWith("ending_")) {
      const ending = parsedMissionData.endings[nextPage];
      
      try {
        const response = await fetch('/api/ministry-missions/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${customToken}`
          },
          body: JSON.stringify({
            missionId: selectedMission.missionId,
            ending: nextPage
          })
        });
        
        if (!response.ok) {
          console.error('Failed to save mission completion');
        } else {
          const completionData = await response.json();
          setIsCompleted(true);
          setCompletedEnding(ending);
          setMissionRewards(completionData.rewards || completionData.data?.rewards);
        }
      } catch (err) {
        console.error('Error saving mission completion:', err);
        setIsCompleted(true);
        setCompletedEnding(ending);
      }
    } else {
      setCurrentPage(nextPage);
      setImageLoaded(false);
    }
  };

  const getRewardText = (reward) => {
    switch (reward) {
      case "money+xp":
        return "💰 مكافأة: مال + خبرة";
      case "blackcoins (best)":
        return "عملات سوداء مكافأة: (الأفضل)";
      case "none":
        return "❌ لا توجد مكافأة";
      default:
        return "🎁 مكافأة مجهولة";
    }
  };

  const getMissionStatus = (mission) => {
    if (!mission.isUnlocked) {
      return { status: 'locked', text: `مستوى ${mission.minLevel} مطلوب` };
    }
    if (mission.isCompleted) {
      return { status: 'completed', text: 'مكتملة' };
    }
    return { status: 'available', text: 'متاحة' };
  };

  if (loading) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center">
        <div className="text-center card-3d p-8">
          <div className="w-12 h-12 border border-orange-500/50 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-orange-300">جاري تحميل المهام...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center p-4">
        <div className="text-center card-3d p-8">
          <div className="text-2xl text-red-400 mb-4">⚠️</div>
          <div className="text-lg text-red-300 mb-4">حدث خطأ في تحميل المهام</div>
          <button 
            onClick={fetchMissions}
            className="btn-3d px-6 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Mission selection screen
  if (!playingMission) {
    return (
      <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
        <div className="container mx-auto max-w-6xl p-3 space-y-4">
          
          {/* Enhanced Header with Background Image */}
          <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-gray-800 to-yellow-900">
              <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f59e0b\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 10l8 16h-16z\"/%3E%3Ccircle cx=\"30\" cy=\"40\" r=\"6\"/%3E%3Crect x=\"25\" y=\"5\" width=\"10\" height=\"5\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
            </div>

            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Scroll className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">مهام الوزارة</h1>
                  <p className="text-xs sm:text-sm text-white/80 drop-shadow">Ministry Missions</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-white">
                <div className="hidden sm:flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-white/60" />
                  <Target className="w-4 h-4 text-orange-400 animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-orange-400" />
                    {missions.length}
                  </div>
                  <div className="text-xs text-white/80 drop-shadow">مهمة</div>
                </div>
              </div>
            </div>
          </div>

          {/* Missions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((mission) => {
              const status = getMissionStatus(mission);
              const isLocked = status.status === 'locked';
              const isCompleted = status.status === 'completed';
              
              return (
                <div 
                  key={mission.missionId}
                  className={`card-3d p-0 overflow-hidden transition-all duration-300 ${
                    isLocked 
                      ? 'opacity-60 cursor-not-allowed' 
                      : isCompleted 
                        ? 'border-green-500/40 hover:border-green-500/60' 
                        : 'hover:border-orange-500/50 hover:scale-[1.02]'
                  }`}
                >
                  {/* Mission Banner */}
                  <div className="h-48 relative">
                    <img
                      src={mission.banner}
                      alt={mission.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className={`w-full h-full bg-gradient-to-br from-orange-800/60 to-yellow-800/60 flex items-center justify-center ${mission.banner ? 'hidden' : 'flex'}`}>
                      <Scroll className="w-16 h-16 text-orange-400/50" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        status.status === 'locked' 
                          ? 'bg-gray-700/80 text-gray-300 border border-gray-600/50'
                          : status.status === 'completed'
                            ? 'bg-green-600/80 text-white border border-green-500/50'
                            : 'bg-orange-600/80 text-white border border-orange-500/50'
                      }`}>
                        {status.status === 'locked' && <Lock className="w-3 h-3" />}
                        {status.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {status.status === 'available' && <Play className="w-3 h-3" />}
                        {status.text}
                      </div>
                    </div>
                  </div>

                  {/* Mission Info */}
                  <div className="p-4 bg-gradient-to-b from-black/40 to-hitman-950/40">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Scroll className="w-4 h-4 text-orange-400" />
                      {mission.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{mission.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-bold">
                          المستوى {mission.minLevel}
                        </span>
                      </div>
                      
                      {mission.canPlay && (
                        <button
                          onClick={() => startMission(mission)}
                          className="btn-3d text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          ابدأ المهمة
                        </button>
                      )}
                      
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                          <CheckCircle className="w-4 h-4" />
                          مكتملة
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {missions.length === 0 && (
            <div className="card-3d p-8 text-center">
              <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <div className="text-xl text-white/50 mb-2">لا توجد مهام متاحة حالياً</div>
              <div className="text-white/30">تحقق لاحقاً للحصول على مهام جديدة</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mission completion screen
  if (isCompleted && selectedMission) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full mb-6 animate-pulse">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-orange-400 mb-4 animate-glow">
              {selectedMission.title}
            </h1>
            <div className="text-2xl text-white/80 mb-6 flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              تم إكمال المهمة
            </div>
          </div>
          
          <div className="card-3d p-6 mb-6">
            <div className="text-lg mb-4 text-orange-400 font-semibold">
              {getRewardText(completedEnding.reward)}
            </div>
            
            {(missionRewards || completedEnding?.reward !== 'none') && (
              <div className="mb-4 card-3d bg-black/40 border-white/10 p-4">
                <div className="text-sm text-white/70 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  المكافآت المكتسبة:
                </div>
                {missionRewards ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {missionRewards.exp > 0 && (
                      <div className="flex items-center justify-between bg-yellow-900/40 border border-yellow-500/30 rounded p-2">
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          الخبرة
                        </span>
                        <span className="font-bold text-white">+{missionRewards.exp}</span>
                      </div>
                    )}
                    {missionRewards.money > 0 && (
                      <div className="flex items-center justify-between bg-green-900/40 border border-green-500/30 rounded p-2">
                        <span className="text-green-400 flex items-center gap-1">
                          <MoneyIcon className="w-4 h-4" />
                          المال
                        </span>
                        <span className="font-bold text-white">+{missionRewards.money.toLocaleString()}</span>
                      </div>
                    )}
                    {missionRewards.blackcoins > 0 && (
                      <div className="flex items-center justify-between bg-purple-900/40 border border-purple-500/30 rounded p-2">
                        <span className="text-purple-400 flex items-center gap-1">
                          <img src="/images/blackcoins-icon.png" alt="Blackcoin" className="w-4 h-4 object-contain" />
                          العملات السوداء
                        </span>
                        <span className="font-bold text-white">+{missionRewards.blackcoins}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white/50 text-center py-2">
                    جاري حساب المكافآت...
                  </div>
                )}
              </div>
            )}
            
            <div className="text-white/80 leading-relaxed">
              {completedEnding.summary}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="card-3d bg-orange-950/40 border-orange-500/30 p-3">
              <div className="text-sm text-orange-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                لا يمكن إعادة لعب هذه المهمة
              </div>
            </div>
            
            <button
              onClick={() => setPlayingMission(false)}
              className="btn-3d-secondary px-6 py-3 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة إلى قائمة المهام
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active mission screen
  if (!selectedMission || !parsedMissionData || !parsedMissionData.pages) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center">
        <div className="text-center card-3d p-8">
          <div className="w-12 h-12 border border-orange-500/50 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-orange-300">جاري تحميل بيانات المهمة...</div>
        </div>
      </div>
    );
  }
  
  const currentPageData = parsedMissionData.pages[currentPage];

  return (
    <div className="min-h-screen blood-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Mission Image Section */}
      <div className="h-1/2 relative">
        <div className="w-full h-full bg-gradient-to-br from-orange-900 via-gray-800 to-yellow-900">
          <img
            src={currentPageData.image}
            alt="Story Scene"
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        {/* Mission title overlay */}
        <div className="absolute top-4 right-4 left-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPlayingMission(false)}
              className="card-3d bg-black/60 hover:bg-black/80 text-white p-2 border-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {selectedMission.title}
              </h1>
              <div className="text-sm text-orange-300 mt-1 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                المستوى المطلوب: {selectedMission.minLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="h-1/2 bg-gradient-to-b from-black/90 to-hitman-950/90 p-6 flex flex-col">
        <div className="flex-1 mb-6">
          <div className="text-lg leading-relaxed text-white/90 animate-fade-in">
            {currentPageData.text}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentPageData.options && currentPageData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option.next)}
              className="w-full card-3d bg-hitman-800/60 hover:bg-orange-500/20 border-white/20 hover:border-orange-500/50 text-white font-bold py-4 px-6 transition-all duration-300 transform hover:scale-[1.02] text-right"
            >
              <div className="flex items-center justify-between">
                <span>{option.text}</span>
                <ArrowLeft className="w-4 h-4 text-orange-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinistryMission;
