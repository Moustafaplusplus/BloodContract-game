/* ============================================================================
 *  src/App.jsx – added Gym route
 * ----------------------------------------------------------------------------*/
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/layouts/DashboardLayout';

const Login    = lazy(() => import('@/features/auth/Login'));
const Signup   = lazy(() => import('@/features/auth/Signup'));
const Home     = lazy(() => import('@/features/dashboard/Home'));
const Overview = lazy(() => import('@/features/character/Overview'));
const Crimes   = lazy(() => import('@/features/crimes/Crimes'));
const Gym      = lazy(() => import('@/features/gym/Gym'));
const Bank  = lazy(() => import('@/features/bank/Bank'));
const NotFound = lazy(() => import('@/features/NotFound'));
const InterestHistory = lazy(() => import('@/features/bank/InterestHistory'));
const Inventory  = lazy(() => import('@/features/inventory/Inventory'));
const Shop      = lazy(() => import('@/features/shop/Shop'));

const queryClient = new QueryClient();

function PrivateRoute({ children }) {
  const { tokenLoaded, isAuthed } = useAuth();
  if (!tokenLoaded) {
    return <div className="h-screen flex items-center justify-center">جاري التحميل…</div>;
  }
  return isAuthed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<div className="h-screen flex items-center justify-center">جاري التحميل…</div>}>
          <Routes>
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<Home />} />
                      <Route path="character" element={<Overview />} />
                      <Route path="crimes" element={<Crimes />} />
                      <Route path="gym" element={<Gym />} />
                      <Route path="bank"  element={<Bank />} />
                      <Route path="bank/history" element={<InterestHistory />} />
                      <Route path="*" element={<NotFound />} />
                      <Route path="inventory"  element={<Inventory />} />
                      <Route path="shop"      element={<Shop />} />
                    </Routes>
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
        <ToastContainer position="bottom-right" theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
