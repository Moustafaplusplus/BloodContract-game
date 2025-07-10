// src/features/dashboard/Home.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Target,
  Zap,
  Heart,
  Star,
  DollarSign,
  Shield,
  Car,
  Home as HomeIcon,
  Users,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Briefcase,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character"],
    queryFn: () => axios.get("/api/character").then((res) => res.data),
    staleTime: 1 * 60 * 1000,
    retry: false,
  });

  // Mock data for design purposes when backend is not available
  const mockCharacter = {
    username: "Player",
    level: 5,
    hp: 85,
    maxHp: 100,
    energy: 75,
    maxEnergy: 100,
    exp: 750,
    nextLevelExp: 1000,
    money: 15420,
    crimesCommitted: 23,
    fightsWon: 12,
    rank: "Thug",
  };

  const displayCharacter = character || mockCharacter;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-hitman-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-red mx-auto mb-6"></div>
          <p className="text-white text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const healthPercent = displayCharacter.maxHp
    ? (displayCharacter.hp / displayCharacter.maxHp) * 100
    : 0;
  const energyPercent = displayCharacter.maxEnergy
    ? (displayCharacter.energy / displayCharacter.maxEnergy) * 100
    : 0;
  const expPercent = displayCharacter.nextLevelExp
    ? (displayCharacter.exp / displayCharacter.nextLevelExp) * 100
    : 0;

  const quickActions = [
    {
      icon: Target,
      label: "ارتكاب جريمة",
      href: "/crimes",
      color: "bg-accent-red hover:bg-red-700",
    },
    {
      icon: Zap,
      label: "صالة الألعاب",
      href: "/gym",
      color: "bg-accent-blue hover:bg-blue-700",
    },
    {
      icon: DollarSign,
      label: "البنك",
      href: "/bank",
      color: "bg-accent-green hover:bg-green-700",
    },
    {
      icon: Shield,
      label: "��لمتجر",
      href: "/shop",
      color: "bg-accent-purple hover:bg-purple-700",
    },
    {
      icon: Car,
      label: "السيارات",
      href: "/cars",
      color: "bg-accent-orange hover:bg-orange-700",
    },
    {
      icon: HomeIcon,
      label: "المنازل",
      href: "/houses",
      color: "bg-accent-yellow hover:bg-yellow-700",
    },
  ];

  const recentActivities = [
    {
      icon: Target,
      text: "ارتكبت جريمة سرقة سيارة",
      time: "منذ 5 دقائق",
      color: "text-accent-red",
    },
    {
      icon: TrendingUp,
      text: "ربحت 500$ من استثمار البنك",
      time: "منذ 15 دقيقة",
      color: "text-accent-green",
    },
    {
      icon: Award,
      text: "حصلت على إنجاز جديد",
      time: "منذ ساعة",
      color: "text-accent-yellow",
    },
    {
      icon: Users,
      text: "انضممت إلى عصابة جديدة",
      time: "منذ ساعتين",
      color: "text-accent-blue",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-red to-accent-orange bg-clip-text text-transparent">
            مرحباً، {displayCharacter.username}
          </h1>
          <p className="text-hitman-300 text-lg">
            جاهز لبدء يوم جديد في عالم الجريمة؟
          </p>
        </div>

        {/* Character Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Health Card */}
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-accent-red" />
              <span className="text-2xl font-bold">{displayCharacter.hp}</span>
            </div>
            <h3 className="text-hitman-300 mb-2">الصحة</h3>
            <div className="w-full bg-hitman-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${healthPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-hitman-400 mt-2">
              {displayCharacter.hp}/{displayCharacter.maxHp}
            </p>
          </div>

          {/* Energy Card */}
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-accent-blue" />
              <span className="text-2xl font-bold">
                {displayCharacter.energy}
              </span>
            </div>
            <h3 className="text-hitman-300 mb-2">الطاقة</h3>
            <div className="w-full bg-hitman-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${energyPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-hitman-400 mt-2">
              {displayCharacter.energy}/{displayCharacter.maxEnergy}
            </p>
          </div>

          {/* Level Card */}
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-accent-yellow" />
              <span className="text-2xl font-bold">
                {displayCharacter.level}
              </span>
            </div>
            <h3 className="text-hitman-300 mb-2">المستوى</h3>
            <div className="w-full bg-hitman-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${expPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-hitman-400 mt-2">
              {displayCharacter.exp}/{displayCharacter.nextLevelExp} XP
            </p>
          </div>

          {/* Money Card */}
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-accent-green" />
              <span className="text-2xl font-bold">
                ${displayCharacter.money?.toLocaleString()}
              </span>
            </div>
            <h3 className="text-hitman-300 mb-2">الأموال</h3>
            <div className="flex items-center justify-between text-sm text-hitman-400">
              <span>الرتبة: {displayCharacter.rank || "مب��دئ"}</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Briefcase className="w-6 h-6 mr-3 text-accent-red" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`${action.color} rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg group`}
              >
                <action.icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-3 text-accent-blue" />
                النشاط الأخير
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 space-x-reverse p-4 bg-hitman-800/30 rounded-lg"
                  >
                    <activity.icon
                      className={`w-5 h-5 mt-1 ${activity.color}`}
                    />
                    <div className="flex-1">
                      <p className="text-white">{activity.text}</p>
                      <p className="text-hitman-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/profile"
                className="block mt-6 text-center py-3 bg-hitman-700 hover:bg-hitman-600 rounded-lg transition-colors"
              >
                عرض جميع الأنشطة
              </Link>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Game News */}
            <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-accent-orange" />
                أخبار اللعبة
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-hitman-800/50 rounded-lg">
                  <h4 className="font-medium text-accent-yellow">
                    تحديث جديد!
                  </h4>
                  <p className="text-sm text-hitman-300">
                    إضافة ميزات جديدة للعصابات
                  </p>
                </div>
                <div className="p-3 bg-hitman-800/50 rounded-lg">
                  <h4 className="font-medium text-accent-green">حدث خاص</h4>
                  <p className="text-sm text-hitman-300">
                    مضاعفة الخبرة هذا الأسبوع
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-accent-purple" />
                إحصائيات سريعة
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-hitman-300">الجرائم المرتكبة</span>
                  <span className="font-bold text-accent-red">
                    {displayCharacter.crimesCommitted || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hitman-300">المعارك المكسوبة</span>
                  <span className="font-bold text-accent-blue">
                    {displayCharacter.fightsWon || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hitman-300">الترتيب العام</span>
                  <span className="font-bold text-accent-yellow">#42</span>
                </div>
              </div>
              <Link
                to="/achievements"
                className="block mt-4 text-center py-2 bg-accent-purple hover:bg-purple-700 rounded-lg transition-colors"
              >
                عرض الإنجازات
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-accent-red/20 to-accent-orange/20 border border-accent-red/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">جاهز لبدء المغامرة؟</h3>
            <p className="text-hitman-300 mb-6">
              ابدأ رحلتك في عالم الجريمة وكن أقوى قاتل محترف
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/crimes"
                className="bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                ابدأ الجريمة الأولى
              </Link>
              <Link
                to="/gangs"
                className="bg-transparent border-2 border-accent-red text-accent-red hover:bg-accent-red hover:text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                انضم إلى عصابة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
