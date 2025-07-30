import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  Bot,
  Gift
} from 'lucide-react';
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
import BotManagement from './components/BotManagement';
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
  { key: 'bots', label: 'إدارة البوتات', icon: Bot },
  { key: 'game-news', label: 'أخبار اللعبة', icon: MessageSquare },
  { key: 'login-gift', label: 'مكافآت الدخول اليومية', icon: Gift },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const { isAuthed, isAdmin, token } = useAuth();
  const navigate = useNavigate();

  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthed, isAdmin, navigate]);

  // Show loading while checking auth
  if (!isAuthed || !isAdmin) {
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
        <div className="flex justify-center mb-8">
          <div className="bg-hitman-800/50 rounded-lg p-1 flex overflow-x-auto max-w-full">
            <div className="flex min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                    activeTab === tab.key
                      ? 'bg-accent-red text-white'
                      : 'text-hitman-300 hover:text-white hover:bg-hitman-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
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
        {activeTab === 'bots' && <BotManagement />}
        {activeTab === 'game-news' && <GameNewsManagement />}
        {activeTab === 'login-gift' && <LoginGiftManagement />}
      </div>
    </div>
  );
} 