import React, { useState } from 'react';
import IntroVideo from '../components/IntroVideo';
import { ImageIcon, PlayIcon, SkipForwardIcon, VolumeXIcon, Volume2Icon, FilmIcon } from 'lucide-react';
import './IntroDemo.css';

const IntroDemo = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  const handleStartIntro = () => {
    setShowIntro(true);
    setIntroCompleted(false);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIntroCompleted(true);
  };

  const handleRestartIntro = () => {
    setShowIntro(true);
    setIntroCompleted(false);
  };

  if (showIntro) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 flex items-center justify-center p-2 sm:p-4">
      {/* Video Banner Header */}
      <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-r from-blood-900/20 to-blood-700/20 backdrop-blur-sm border-b border-blood-500/20 flex items-center justify-center overflow-hidden">
        <div className="flex items-center space-x-2 animate-float">
          <FilmIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blood-400" />
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blood-300 animate-pulse" />
          <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blood-200" />
        </div>
      </div>

      <div className="w-full max-w-md sm:max-w-lg bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 shadow-2xl shadow-blood-900/50 mt-20 sm:mt-24">
        {/* Header with Visual Elements */}
        <div className="relative p-3 sm:p-4 border-b border-blood-500/20 bg-gradient-to-r from-blood-900/20 to-blood-700/10">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blood-500 to-blood-700 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white text-center">عقد الدم</h1>
          </div>
          <p className="text-xs sm:text-sm text-blood-200 text-center opacity-80">Intro Video Demo</p>
        </div>

        {!introCompleted ? (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Video Preview Banner */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-br from-blood-900/30 to-black/50 rounded-lg border border-blood-500/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-blood-500/10 animate-pulse" />
              <div className="text-center z-10">
                <FilmIcon className="w-8 h-8 sm:w-12 sm:h-12 text-blood-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-blood-300">Click to start intro video</p>
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <div className="w-2 h-2 bg-blood-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blood-500 rounded-full animate-pulse delay-300" />
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blood-500/30 flex items-center justify-center space-x-2"
              onClick={handleStartIntro}
            >
              <PlayIcon className="w-4 h-4" />
              <span className="text-sm sm:text-base">بدء العرض التقديمي</span>
            </button>

            {/* Features with Visual Icons */}
            <div className="bg-blood-900/20 border border-blood-500/20 rounded-lg p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-blood-400 mb-3 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Features
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-blood-200 p-1 rounded hover:bg-blood-800/20">
                  <FilmIcon className="w-3 h-3 text-blood-400" />
                  <span>Full Video</span>
                </div>
                <div className="flex items-center space-x-2 text-blood-200 p-1 rounded hover:bg-blood-800/20">
                  <Volume2Icon className="w-3 h-3 text-blood-400" />
                  <span>Audio Sync</span>
                </div>
                <div className="flex items-center space-x-2 text-blood-200 p-1 rounded hover:bg-blood-800/20">
                  <SkipForwardIcon className="w-3 h-3 text-blood-400" />
                  <span>Skip Option</span>
                </div>
                <div className="flex items-center space-x-2 text-blood-200 p-1 rounded hover:bg-blood-800/20">
                  <PlayIcon className="w-3 h-3 text-blood-400" />
                  <span>Controls</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 text-center space-y-4">
            {/* Completion Banner */}
            <div className="relative h-24 sm:h-32 bg-gradient-to-br from-green-900/30 to-blood-900/30 rounded-lg border border-green-500/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
              <div className="text-center z-10">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg sm:text-2xl">✓</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-green-400">Intro Completed!</h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-blood-300">The intro video has finished successfully.</p>

            <button
              className="w-full bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blood-500/30 flex items-center justify-center space-x-2"
              onClick={handleRestartIntro}
            >
              <PlayIcon className="w-4 h-4" />
              <span className="text-sm sm:text-base">إعادة تشغيل</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroDemo;
