import { useState } from 'react';
import { Volume2, VolumeX, Volume1, Volume } from 'lucide-react';
import { useBackgroundMusicContext } from '@/contexts/BackgroundMusicContext';

export default function MusicControl() {
  const { isPlaying, volume, toggle, setVolume, userInteracted } = useBackgroundMusicContext();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const getVolumeIcon = () => {
    if (!userInteracted) return VolumeX;
    if (!isPlaying) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 0.3) return Volume;
    if (volume < 0.7) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  const handleClick = () => {
    toggle();
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
          !userInteracted 
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-accent-red' 
            : 'bg-gray-800 hover:bg-gray-700 text-white hover:text-accent-red'
        }`}
        title={!userInteracted ? "انقر لتفعيل الموسيقى" : (isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى")}
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      {/* Volume Slider */}
      {showVolumeSlider && userInteracted && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg z-50">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs text-gray-300 whitespace-nowrap">مستوى الصوت</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
              }}
            />
            <span className="text-xs text-gray-400">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}

      {/* Tooltip for when user hasn't interacted */}
      {!userInteracted && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs text-gray-300 whitespace-nowrap">انقر لتفعيل الموسيقى</span>
        </div>
      )}
    </div>
  );
} 