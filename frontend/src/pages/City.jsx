// 📁 frontend/src/pages/City.jsx
import React from 'react';
import { Link } from 'react-router-dom';

/*
  Simple interactive SVG city map.  Each hotspot is a <Link> to an existing
  page.  Replace the placeholder rectangles with a real SVG later.
*/
export default function City() {
  return (
    <div className="p-4 flex justify-center">
      <svg viewBox="0 0 400 250" className="w-full max-w-3xl h-auto bg-base-200 rounded">
        {/* Bank */}
        <a href="/bank">
          <rect x="20" y="20" width="100" height="40" fill="#4ade80" opacity="0.3" />
          <text x="70" y="45" textAnchor="middle" fontSize="12" fill="white">Bank</text>
        </a>
        {/* Gym */}
        <a href="/gym">
          <rect x="150" y="20" width="100" height="40" fill="#22d3ee" opacity="0.3" />
          <text x="200" y="45" textAnchor="middle" fontSize="12" fill="white">Gym</text>
        </a>
        {/* Black Market */}
        <a href="/black-market">
          <rect x="280" y="20" width="100" height="40" fill="#fbbf24" opacity="0.3" />
          <text x="330" y="45" textAnchor="middle" fontSize="12" fill="white">Black Market</text>
        </a>
        {/* Weapons Shop */}
        <a href="/shop">
          <rect x="20" y="90" width="100" height="40" fill="#f472b6" opacity="0.3" />
          <text x="70" y="115" textAnchor="middle" fontSize="12" fill="white">Weapons</text>
        </a>
        {/* Crimes */}
        <a href="/crimes">
          <rect x="150" y="90" width="100" height="40" fill="#a78bfa" opacity="0.3" />
          <text x="200" y="115" textAnchor="middle" fontSize="12" fill="white">Crimes</text>
        </a>
        {/* Hospital */}
        <a href="/hospital">
          <rect x="280" y="90" width="100" height="40" fill="#60a5fa" opacity="0.3" />
          <text x="330" y="115" textAnchor="middle" fontSize="12" fill="white">Hospital</text>
        </a>
      </svg>
    </div>
  );
}