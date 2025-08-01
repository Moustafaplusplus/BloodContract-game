import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  TrendingUp,
  Activity,
  Shield,
  MessageSquare,
  Sword,
  Briefcase,
  Home,
  Dog,
  Award,
  Coins,
  Star,
  Package,
  DollarSign,
  BookOpen,
  Gift,
  Calculator
} from 'lucide-react';
import LevelCalculator from '../../components/LevelCalculator';
import CharacterManagement from './components/CharacterManagement';
import CrimeManagement from './components/CrimeManagement';
import WeaponManagement from './components/WeaponManagement';
import ArmorManagement from './components/ArmorManagement';
import JobManagement from './components/JobManagement';
import Overview from './components/Overview';
import IpManagement from './components/IpManagement';
import SuggestionManagement from './components/SuggestionManagement';
import HouseManagement from './components/HouseManagement';
import DogManagement from './components/DogManagement';
import CarManagement from './components/CarManagement';
import TasksManagement from './components/TasksManagement';
import PromotionManagement from './components/PromotionManagement';
import BlackcoinPackageManagement from './components/BlackcoinPackageManagement';
import MoneyPackageManagement from './components/MoneyPackageManagement';
import VIPPackageManagement from './components/VIPPackageManagement';
import SpecialItemManagement from './components/SpecialItemManagement';
import MinistryMissionManagement from './components/MinistryMissionManagement';

import GameNewsManagement from './components/GameNewsManagement';
import LoginGiftManagement from './components/LoginGiftManagement';

const TABS = [
  { key: 'overview', label: 'لوحة التحكم', icon: Activity },
  { key: 'characters', label: 'إدارة الشخصيات', icon: Users },
  { key: 'crimes', label: 'إدارة الجرائم', icon: Target },
  { key: 'weapons', label: 'إدارة الأسلحة', icon: Sword },
  { key: 'armors', label: 'إدارة الدروع', icon: Shield },
  { key: 'special-items', label: 'العناصر الخاصة', icon: Package },
  { key: 'houses', label: 'إدارة المنازل', icon: Home },
  { key: 'cars', label: 'إدارة السيارات', icon: Briefcase },
  { key: 'dogs', label: 'إدارة الكلاب', icon: Dog },
  { key: 'jobs', label: 'إدارة الوظائف', icon: Briefcase },
  { key: 'ministry-missions', label: 'مهام الوزارة', icon: BookOpen },
  { key: 'blackcoin-packages', label: 'باقات العملة السوداء', icon: Coins },
  { key: 'money-packages', label: 'باقات المال', icon: DollarSign },
  { key: 'vip-packages', label: 'باقات VIP', icon: Star },
  { key: 'suggestions', label: 'الاقتراحات والبلاغات', icon: MessageSquare },
  { key: 'ips', label: 'إدارة عناوين IP', icon: Shield },
  { key: 'tasks', label: 'إدارة المهام', icon: Activity },
  { key: 'promotions', label: 'إدارة الرتب', icon: Award },

  { key: 'game-news', label: 'أخبار اللعبة', icon: MessageSquare },
  { key: 'login-gift', label: 'مكافآت الدخول اليومية', icon: Gift },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCalculator, setShowCalculator] = useState(false);
  const { user, isAdmin, customToken } = useFirebaseAuth();
  const navigate = useNavigate();

  // Check authentication and admin status
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, isAdmin, navigate]);

  // Show loading while checking auth
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <p className="text-white">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red">
            لوحة الإدارة
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-w-6xl mx-auto">
            {TABS.map((tab) => {
              const hasCalculator = ['crimes', 'weapons', 'armors', 'houses', 'dogs', 'cars', 'tasks', 'ministry-missions', 'promotions'].includes(tab.key);
              return (
                <div key={tab.key} className="relative">
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-br from-accent-red to-red-600 text-white shadow-lg shadow-red-500/25'
                        : 'bg-hitman-800/50 text-hitman-300 hover:text-white hover:bg-hitman-700/70 border border-hitman-700 hover:border-hitman-600'
                    }`}
                  >
                    <tab.icon className={`w-6 h-6 ${activeTab === tab.key ? 'text-white' : 'text-hitman-400'}`} />
                    <span className="text-sm font-medium text-center leading-tight">{tab.label}</span>
                  </button>
                  {hasCalculator && (
                    <button
                      onClick={() => setShowCalculator(true)}
                      className="absolute -top-2 -right-2 p-1.5 text-accent-red hover:text-red-300 transition-colors bg-hitman-900 border border-accent-red rounded-full shadow-lg hover:shadow-red-500/25"
                      title="حاسبة المستوى"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'characters' && <CharacterManagement />}
        {activeTab === 'crimes' && <CrimeManagement />}
        {activeTab === 'weapons' && <WeaponManagement />}
        {activeTab === 'armors' && <ArmorManagement />}
        {activeTab === 'special-items' && <SpecialItemManagement />}
        {activeTab === 'houses' && <HouseManagement />}
        {activeTab === 'cars' && <CarManagement />}
        {activeTab === 'dogs' && <DogManagement />}
        {activeTab === 'jobs' && <JobManagement />}
        {activeTab === 'ministry-missions' && <MinistryMissionManagement />}
        {activeTab === 'blackcoin-packages' && <BlackcoinPackageManagement />}
        {activeTab === 'money-packages' && <MoneyPackageManagement />}
        {activeTab === 'vip-packages' && <VIPPackageManagement />}
        {activeTab === 'suggestions' && <SuggestionManagement />}
        {activeTab === 'ips' && <IpManagement />}
        {activeTab === 'tasks' && <TasksManagement />}
        {activeTab === 'promotions' && <PromotionManagement />}

        {activeTab === 'game-news' && <GameNewsManagement />}
        {activeTab === 'login-gift' && <LoginGiftManagement />}
      </div>
      
      {/* Level Calculator Modal */}
      <LevelCalculator 
        isOpen={showCalculator} 
        onClose={() => setShowCalculator(false)} 
      />
    </div>
  );
} 