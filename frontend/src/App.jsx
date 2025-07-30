/* ============================================================================
 *  src/App.jsx – added Gym route
 * ----------------------------------------------------------------------------*/
import { lazy, Suspense } from "react";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import Ranking from "@/pages/Ranking";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ModalProvider } from "@/contexts/ModalContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import HUD from "@/components/HUD";
import AdminReturnButton from "@/components/AdminReturnButton";
import PlayerSearch from "./features/profile/PlayerSearch.jsx";
import FightResults from './features/fights/FightResults';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GangDetailsWrapper from './features/gangs/GangDetailsWrapper';
import AdminPanel from "@/features/admin/AdminPanel";
import { SocketProvider } from "@/contexts/SocketContext";
import { FamePopupProvider } from "@/contexts/FamePopupContext";
import { jwtDecode } from "jwt-decode";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

// Lazy load all components
const LandingPage = lazy(() => import("@/components/LandingPage"));
const Login = lazy(() => import("@/features/auth/Login"));
const Signup = lazy(() => import("@/features/auth/Signup"));
const Home = lazy(() => import("@/features/dashboard/Home"));
const Overview = lazy(() => import("@/features/character/character"));
const Crimes = lazy(() => import("@/features/crimes/Crimes"));
const Gym = lazy(() => import("@/features/gym/Gym"));
const Bank = lazy(() => import("@/features/bank/Bank"));
const Inventory = lazy(() => import("@/features/inventory/Inventory"));
const Shop = lazy(() => import("@/features/shop/Shop"));
const Houses = lazy(() => import("@/features/houses/Houses"));
const Cars = lazy(() => import("@/features/cars/Cars"));
const Dogs = lazy(() => import("@/features/dogs/Dogs"));
const Gangs = lazy(() => import("@/features/gangs/Gangs"));
const Friendship = lazy(() => import("@/features/friendship/Friendship.jsx"));
const Messages = lazy(() => import("@/features/messages/Messages.jsx"));
const GlobalChat = lazy(() => import("@/features/chat/GlobalChat.jsx"));
const Profile = lazy(() => import("@/features/profile/Profile"));
const Jobs = lazy(() => import("@/features/jobs/Jobs"));
const NotFound = lazy(() => import("@/features/NotFound"));
const ActiveUsers = lazy(() => import("@/features/fights/ActivePlayers"));
const CrimeResults = lazy(() => import("@/features/crimes/CrimeResults"));
const Hospital = lazy(() => import("@/features/confinement/Hospital"));
const Jail = lazy(() => import("@/features/confinement/Jail"));
const BlackMarket = lazy(() => import("@/features/blackMarket/BlackMarket"));
const SpecialShop = lazy(() => import("@/features/shop/SpecialShop"));
const Suggestions = lazy(() => import("@/features/suggestions/Suggestions"));
const MinistryMission = lazy(() => import("@/features/missions/MinistryMission"));
const BloodContracts = lazy(() => import("@/features/bloodContracts"));
const Tasks = lazy(() => import("@/features/tasks/Tasks"));
const Notifications = lazy(() => import("@/features/notifications/Notifications"));
const GoogleCallback = lazy(() => import("@/features/auth/GoogleCallback"));
const LoginGift = lazy(() => import("@/features/loginGift/LoginGift"));
const IntroSlideshow = lazy(() => import("@/components/IntroSlideshow"));
const IntroDemo = lazy(() => import("@/pages/IntroDemo"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // No stale time by default
      retry: false,
    },
  },
});

function PrivateRoute({ children }) {
  const { tokenLoaded, isAuthed } = useAuth();
  if (!tokenLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل…</p>
        </div>
      </div>
    );
  }
  return isAuthed ? children : <Navigate to="/" replace />;
}

function HUDWrapper() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // Create a key that changes when the user changes (based on token)
  const hudKey = token ? (() => {
    try {
      const { id } = jwtDecode(token);
      return `hud-${id}`;
    } catch {
      return 'hud-no-user';
    }
  })() : 'hud-no-user';
  
  // Global cache invalidation when user changes
  React.useEffect(() => {
    if (token) {
      try {
        const { id } = jwtDecode(token);

        // Clear all character-related queries to ensure fresh data
        queryClient.removeQueries(["character"]);
        queryClient.removeQueries(["hospitalStatus"]);
        queryClient.removeQueries(["profile"]);
        // Force refetch of all character data
        queryClient.invalidateQueries(["character"]);
        queryClient.invalidateQueries(["hospitalStatus"]);
        queryClient.invalidateQueries(["profile"]);
      } catch (error) {
        console.error('[App] Error decoding token:', error);
      }
    } else {
      
      queryClient.clear();
    }
  }, [token, queryClient]);
  
  return <HUD key={hudKey} />;
}

function HomeWrapper() {
  const { token } = useAuth();
  
  // Create a key that changes when the user changes (based on token)
  const homeKey = token ? (() => {
    try {
      const { id } = jwtDecode(token);
      return `home-${id}`;
    } catch {
      return 'home-no-user';
    }
  })() : 'home-no-user';
  
  return <Home key={homeKey} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ModalProvider>
            <SocketProvider>
                              <FamePopupProvider>
                  <NotificationProvider>
                  <Suspense
                fallback={
                  <div className="h-screen flex items-center justify-center bg-black">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
                      <p className="text-gray-400">جاري التحميل…</p>
                    </div>
                  </div>
                }
              >
                <Routes>
                  {/* Landing page is bare */}
                  <Route path="/" element={<LandingPage />} />
                  {/* Login and Signup are also bare */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/auth/callback" element={<GoogleCallback />} />
                  {/* Privacy Policy and Terms pages (bare) */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  {/* Intro Slideshow routes */}
                  <Route path="/intro" element={<IntroSlideshow onComplete={() => window.location.href = '/dashboard'} />} />
                  <Route path="/intro-demo" element={<IntroDemo />} />
                  {/* All other pages use main layout and HUD */}
                  <Route
                    path="*"
                    element={
                      <>
                        <HUDWrapper />
                        <DashboardLayout>
                          <AdminReturnButton />
                          <Routes>
                            <Route path="/players" element={<PlayerSearch />} />
                            <Route path="/hospital" element={<Navigate to="/dashboard/hospital" replace />} />
                            <Route path="/jail" element={<Navigate to="/dashboard/jail" replace />} />
                            <Route path="/dashboard/black-market" element={<BlackMarket />} />
                            <Route path="/dashboard/suggestions" element={<Suggestions />} />
                            <Route path="/dashboard/ministry-mission" element={<MinistryMission />} />
                            <Route path="/dashboard/blood-contracts" element={<BloodContracts />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/gangs/:id" element={<GangDetailsWrapper />} />
                            <Route path="/admin/panel" element={<AdminPanel />} />
                            <Route path="/dashboard/*" element={
                              <PrivateRoute>
                                <Routes>
                                  <Route index element={<HomeWrapper />} />
                                  <Route path="character" element={<Overview />} />
                                  <Route path="crimes" element={<Crimes />} />
                                  <Route path="crime-result" element={<CrimeResults />} />
                                  <Route path="gym" element={<Gym />} />
                                  <Route path="active-users" element={<ActiveUsers />} />
                                  <Route path="fight-result" element={<FightResults />} />
                                  <Route path="hospital" element={<Hospital />} />
                                  <Route path="jail" element={<Jail />} />
                                  <Route path="bank" element={<Bank />} />
                                  <Route path="bank/history" element={<Navigate to="/dashboard/bank" replace />} />
                                  <Route path="inventory" element={<Inventory />} />
                                  <Route path="shop" element={<Shop />} />
                                  <Route path="special-shop" element={<SpecialShop />} />
                                  <Route path="houses" element={<Houses />} />
                                  <Route path="cars" element={<Cars />} />
                                  <Route path="dogs" element={<Dogs />} />
                                  <Route path="gangs" element={<Gangs />} />
                                  <Route path="friends" element={<Friendship />} />
                                  <Route path="messages" element={<Messages />} />
                                  <Route path="global-chat" element={<GlobalChat />} />
                                  <Route path="profile" element={<Profile />} />
                                  <Route path="profile/:username" element={<Profile />} />
                                  <Route path="jobs" element={<Jobs />} />
                                  <Route path="tasks" element={<Tasks />} />
                                  <Route path="login-gift" element={<LoginGift />} />
                                  <Route path="ranking" element={<Ranking />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </PrivateRoute>
                            } />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </DashboardLayout>
                      </>
                    }
                  />
                </Routes>
              </Suspense>
              <ToastContainer
                position="bottom-center"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastClassName="Toastify__toast"
                bodyClassName="Toastify__toast-body"
              />
                          </NotificationProvider>
                </FamePopupProvider>
            </SocketProvider>
          </ModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
