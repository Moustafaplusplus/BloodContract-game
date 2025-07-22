import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp,
  Activity,
  Shield,
  MessageSquare,
  Sword,
  Briefcase
} from 'lucide-react';
import CharacterManagement from './components/CharacterManagement';
import CrimeManagement from './components/CrimeManagement';
import WeaponManagement from './components/WeaponManagement';
import ArmorManagement from './components/ArmorManagement';
import JobManagement from './components/JobManagement';
import SystemStats from './components/SystemStats';
import Overview from './components/Overview';
import IpManagement from './components/IpManagement';
import SuggestionManagement from './components/SuggestionManagement';

const TABS = [
  { key: 'overview', label: 'نظرة عامة', icon: Activity },
  { key: 'characters', label: 'إدارة الشخصيات', icon: Users },
  { key: 'crimes', label: 'إدارة الجرائم', icon: Target },
  { key: 'weapons', label: 'إدارة الأسلحة', icon: Sword },
  { key: 'armors', label: 'إدارة الدروع', icon: Shield },
  { key: 'jobs', label: 'إدارة الوظائف', icon: Briefcase },
  { key: 'suggestions', label: 'الاقتراحات والبلاغات', icon: MessageSquare },
  { key: 'system', label: 'إحصائيات النظام', icon: TrendingUp },
  { key: 'ips', label: 'إدارة عناوين IP', icon: Shield },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
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
          <div className="bg-hitman-800/50 rounded-lg p-1 flex">
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

        {/* Tab Content */}
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'characters' && <CharacterManagement />}
        {activeTab === 'crimes' && <CrimeManagement />}
        {activeTab === 'weapons' && <WeaponManagement />}
        {activeTab === 'armors' && <ArmorManagement />}
        {activeTab === 'jobs' && <JobManagement />}
        {activeTab === 'suggestions' && <SuggestionManagement />}
        {activeTab === 'system' && <SystemStats />}
        {activeTab === 'ips' && <IpManagement />}
      </div>
    </div>
  );
} 