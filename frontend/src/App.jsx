/* ============================================================================
 *  src/App.jsx – added Gym route
 * ----------------------------------------------------------------------------*/
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import DashboardLayout from "@/layouts/DashboardLayout";
import HUD from "@/components/HUD";
import HospitalDialog from "@/components/HospitalDialog";
import JailDialog from "@/components/JailDialog";
import PlayerSearch from "./features/profile/PlayerSearch.jsx";

// Lazy load all components
const Login = lazy(() => import("@/features/auth/Login"));
const Signup = lazy(() => import("@/features/auth/Signup"));
const Home = lazy(() => import("@/features/dashboard/Home"));
const Overview = lazy(() => import("@/features/character/Overview"));
const Crimes = lazy(() => import("@/features/crimes/Crimes"));
const Gym = lazy(() => import("@/features/gym/Gym"));
const Bank = lazy(() => import("@/features/bank/Bank"));
const InterestHistory = lazy(() => import("@/features/bank/InterestHistory"));
const Inventory = lazy(() => import("@/features/inventory/Inventory"));
const Shop = lazy(() => import("@/features/shop/Shop"));
const Houses = lazy(() => import("@/features/houses/Houses"));
const Cars = lazy(() => import("@/features/cars/Cars"));
const Gangs = lazy(() => import("@/features/gangs/Gangs"));
const Events = lazy(() => import("@/features/events/Events"));
const Social = lazy(() => import("@/features/social/Social"));
const Achievements = lazy(() => import("@/features/achievements/Achievements"));
const Profile = lazy(() => import("@/features/profile/Profile"));
const BlackMarket = lazy(() => import("@/features/blackMarket/BlackMarket"));
const Jobs = lazy(() => import("@/features/jobs/Jobs"));
const Gold = lazy(() => import("@/features/gold/Gold"));
const NotFound = lazy(() => import("@/features/NotFound"));

const queryClient = new QueryClient();

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
  return isAuthed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/players" element={<PlayerSearch />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <>
                      <HUD />
                      <HospitalDialog />
                      <JailDialog />
                      <DashboardLayout>
                        <Routes>
                          <Route index element={<Home />} />
                          <Route path="character" element={<Overview />} />
                          <Route path="crimes" element={<Crimes />} />
                          <Route path="gym" element={<Gym />} />
                          <Route path="bank" element={<Bank />} />
                          <Route
                            path="bank/history"
                            element={<InterestHistory />}
                          />
                          <Route path="inventory" element={<Inventory />} />
                          <Route path="shop" element={<Shop />} />
                          <Route path="houses" element={<Houses />} />
                          <Route path="cars" element={<Cars />} />
                          <Route path="gangs" element={<Gangs />} />
                          <Route path="events" element={<Events />} />
                          <Route path="social" element={<Social />} />
                          <Route
                            path="achievements"
                            element={<Achievements />}
                          />
                          <Route path="profile" element={<Profile />} />
                          <Route
                            path="black-market"
                            element={<BlackMarket />}
                          />
                          <Route path="jobs" element={<Jobs />} />
                          <Route path="gold" element={<Gold />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </DashboardLayout>
                    </>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Suspense>
          <ToastContainer
            position="bottom-right"
            theme="dark"
            rtl={true}
            toastClassName="font-arabic"
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
