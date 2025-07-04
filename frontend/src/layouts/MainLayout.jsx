import { Outlet } from 'react-router-dom';
import HudBar from '../components/HudBar';   // ← the HUD we added earlier

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* header with HUD */}
      <header className="p-3 bg-gray-900 text-white flex justify-center">
        <HudBar />
      </header>

      {/* routed pages render here */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
