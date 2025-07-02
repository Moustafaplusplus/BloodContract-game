import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import WeaponsShop from './pages/WeaponsShop';
import CrimesList from './pages/CrimesList';
import RealEstate from './pages/RealEstate';
import Fight from './pages/Fight';
import Players from './pages/Players'; // ✅ added

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/shop" element={<WeaponsShop />} />
      <Route path="/crimes" element={<CrimesList />} />
      <Route path="/realestate" element={<RealEstate />} />
      <Route path="/fight/:id" element={<Fight />} />
      <Route path="/players" element={<Players />} /> {/* ✅ new route */}
    </Routes>
  );
}
