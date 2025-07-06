import { Routes, Route } from 'react-router-dom';

import Landing      from './pages/Landing';
import SignIn       from './pages/SignIn';
import SignUp       from './pages/SignUp';

import Dashboard    from './pages/Dashboard';
import WeaponsShop  from './pages/WeaponsShop';
import CrimesList   from './pages/CrimesList';
import RealEstate   from './pages/RealEstate';
import Fight        from './pages/Fight';
import Players      from './pages/Players';
import Jobs         from './pages/Jobs';
import EventsFeed   from './pages/EventsFeed';
import Gym          from './pages/Gym';
import Bank         from './pages/Bank';
import Jail         from './pages/Jail';
import Hospital     from './pages/Hospital';
import Inventory    from './pages/Inventory';
import BlackMarket  from './pages/BlackMarket';
import GoldMarket   from './pages/GoldMarket';
import GangsList    from './pages/GangsList';
import MyGang       from './pages/MyGang';
import City from './pages/City';
import PlayerSearch from './pages/PlayerSearch';
import Messenger    from './pages/Messenger';
import Leaderboards from './pages/Leaderboards.jsx';
import MainLayout   from './layouts/MainLayout';
import Allies from './pages/Allies'; 
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      {/* PUBLIC pages ------------------------------------------------ */}
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<SignIn />} />
      <Route path="/register"  element={<SignUp />} />

      {/* GAME pages (with HUD) -------------------------------------- */}
      <Route element={<MainLayout />}>
        {/* NOTE: **no** index redirect here, so “/” stays Landing */}
        <Route path="dashboard"    element={<Dashboard />} />

        <Route path="shop"         element={<WeaponsShop />} />
        <Route path="crimes"       element={<CrimesList />} />
        <Route path="realestate"   element={<RealEstate />} />
        <Route path="fight/:id"    element={<Fight />} />
        <Route path="players"      element={<Players />} />
        <Route path="jobs"         element={<Jobs />} />
        <Route path="events"       element={<EventsFeed />} />
        <Route path="gym"          element={<Gym />} />
        <Route path="bank"         element={<Bank />} />
        <Route path="jail"         element={<Jail />} />
        <Route path="hospital"     element={<Hospital />} />
        <Route path="inventory"    element={<Inventory />} />
        <Route path="black-market" element={<BlackMarket />} />
        <Route path="gold-market"  element={<GoldMarket />} />
        <Route path="gangs"        element={<GangsList />} />
        <Route path="gangs/:id"    element={<MyGang />} />
        <Route path="leaderboards" element={<Leaderboards />} />
        <Route path="city" element={<City />} />
        <Route path="search"             element={<PlayerSearch />} />
        <Route path="messenger/:playerId" element={<Messenger />} />
        <Route path="/allies" element={<Allies />} /> 
        <Route path="/profile" element={<Profile />} />        {/* my profile */}
        <Route path="/profile/:id" element={<Profile />} /> 
      </Route>
    </Routes>
  );
}
