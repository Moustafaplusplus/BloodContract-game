import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard'; // 👈 Add this
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<App />} />
        <Route path="/register" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* 👈 Dashboard route */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
