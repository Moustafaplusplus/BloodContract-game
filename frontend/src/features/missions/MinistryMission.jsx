import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const MinistryMission = () => {
  const { token } = useAuth();
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
    if (!token) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/ministry-missions/list', {
        headers: {
          'Authorization': `Bearer ${token}`
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
      // Fetch the full mission data including pages and endings
      const response = await fetch(`/api/ministry-missions/${mission.missionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
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

  const handleOptionClick = async (nextPage) => {
          if (nextPage.startsWith("ending_")) {
        // Mission completed
        const ending = selectedMission.missionData.endings[nextPage];
        
        try {
          // Send completion to backend
          const response = await fetch('/api/ministry-missions/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
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
            // Mission completion successful
            setIsCompleted(true);
            setCompletedEnding(ending);
            setMissionRewards(completionData.rewards || completionData.data?.rewards);
          }
        } catch (err) {
          console.error('Error saving mission completion:', err);
          // Still show completion even if backend fails
          setIsCompleted(true);
          setCompletedEnding(ending);
        }
    } else {
      // Move to next page
      setCurrentPage(nextPage);
      setImageLoaded(false);
    }
  };

  const getRewardText = (reward) => {
    switch (reward) {
      case "money+xp":
        return "💰 مكافأة: مال + خبرة";
      case "blackcoins (best)":
        return "🪙 مكافأة: عملات سوداء (الأفضل)";
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <div className="text-lg text-gray-400">جاري تحميل المهام...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-2xl text-accent-red mb-4">⚠️</div>
          <div className="text-lg text-gray-400 mb-4">حدث خطأ في تحميل المهام</div>
          <button 
            onClick={fetchMissions}
            className="bg-accent-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Mission selection screen
  if (!playingMission) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-accent-red mb-4 animate-glow">
              مهام الوزارة
            </h1>
            <p className="text-gray-400 text-lg">
              مهمات سرية تتطلب مهارات عالية وحكمة في القرارات
            </p>
          </div>

          {/* Missions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => {
              const status = getMissionStatus(mission);
              const isLocked = status.status === 'locked';
              const isCompleted = status.status === 'completed';
              
              return (
                                 <div 
                   key={mission.missionId}
                   className={`relative bg-zinc-900 border rounded-lg overflow-hidden animate-mission-card ${
                     isLocked 
                       ? 'border-zinc-700 opacity-60' 
                       : isCompleted 
                         ? 'border-green-600' 
                         : 'border-zinc-600 hover:border-accent-red'
                   }`}
                 >
                  {/* Mission Banner */}
                  <div className="h-48 relative">
                    <img
                      src={mission.banner}
                      alt={mission.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        status.status === 'locked' 
                          ? 'bg-zinc-700 text-gray-300'
                          : status.status === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-accent-red text-white'
                      }`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {/* Mission Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        المستوى {mission.minLevel}
                      </div>
                      
                      {mission.canPlay && (
                        <button
                          onClick={() => startMission(mission)}
                          className="bg-accent-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                          ابدأ المهمة
                        </button>
                      )}
                      
                      {isCompleted && (
                        <div className="text-green-400 text-sm font-bold">
                          ✓ مكتملة
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {missions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-2xl text-gray-500 mb-4">لا توجد مهام متاحة حالياً</div>
              <div className="text-gray-600">تحقق لاحقاً للحصول على مهام جديدة</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mission completion screen
  if (isCompleted && selectedMission) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background particles effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-accent-red rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent-red rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-accent-red rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-accent-red mb-4 animate-glow">
              {selectedMission.title}
            </h1>
            <div className="text-2xl text-gray-400 mb-6 flex items-center justify-center">
              <span className="mr-2">✓</span>
              تم إكمال المهمة
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6 shadow-lg">
            <div className="text-lg mb-4 text-accent-red font-semibold">
              {getRewardText(completedEnding.reward)}
            </div>
            
            {/* Actual Rewards Display */}
            {/* Mission rewards displayed */}
            {(missionRewards || completedEnding?.reward !== 'none') && (
              <div className="mb-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="text-sm text-gray-400 mb-2">المكافآت المكتسبة:</div>
                {missionRewards ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {missionRewards.exp > 0 && (
                      <div className="flex items-center justify-between bg-zinc-700 rounded p-2">
                        <span className="text-yellow-400">⭐ الخبرة</span>
                        <span className="font-bold text-white">+{missionRewards.exp}</span>
                      </div>
                    )}
                    {missionRewards.money > 0 && (
                      <div className="flex items-center justify-between bg-zinc-700 rounded p-2">
                        <span className="text-green-400">💰 المال</span>
                        <span className="font-bold text-white">+{missionRewards.money.toLocaleString()}</span>
                      </div>
                    )}
                    {missionRewards.blackcoins > 0 && (
                      <div className="flex items-center justify-between bg-zinc-700 rounded p-2">
                        <span className="text-purple-400">🪙 العملات السوداء</span>
                        <span className="font-bold text-white">+{missionRewards.blackcoins}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-300 text-center py-2">
                    جاري حساب المكافآت...
                  </div>
                )}
              </div>
            )}
            
            <div className="text-gray-300 leading-relaxed font-arabic">
              {completedEnding.summary}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-500 bg-zinc-800 rounded-lg p-3">
              لا يمكن إعادة لعب هذه المهمة
            </div>
            
            <button
              onClick={() => setPlayingMission(false)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              العودة إلى قائمة المهام
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active mission screen
  if (!selectedMission || !selectedMission.missionData || !selectedMission.missionData.pages) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <div className="text-lg text-gray-400">جاري تحميل بيانات المهمة...</div>
        </div>
      </div>
    );
  }
  
  const currentPageData = selectedMission.missionData.pages[currentPage];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background particles effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-accent-red rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent-red rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-accent-red rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Top 50% - Image with gradient overlay */}
      <div className="h-1/2 relative">
        <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
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
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        {/* Mission title overlay */}
        <div className="absolute top-4 right-4 left-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPlayingMission(false)}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
            >
              ← العودة
            </button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg animate-glow">
                {selectedMission.title}
              </h1>
              <div className="text-sm text-gray-300 mt-1">
                المستوى المطلوب: {selectedMission.minLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 50% - Story text and options */}
      <div className="h-1/2 bg-black p-6 flex flex-col">
        {/* Story text */}
        <div className="flex-1 mb-6">
          <div className="text-lg leading-relaxed text-gray-200 font-arabic animate-story-text">
            {currentPageData.text}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentPageData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option.next)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-accent-red text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20 text-right animate-option-pulse"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinistryMission; 