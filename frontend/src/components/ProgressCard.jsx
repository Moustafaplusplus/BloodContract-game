// frontend/src/components/ProgressCard.jsx
import React from 'react';

export default function ProgressCard({ progress }) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title">Your Progress</h2>
        <ul className="text-sm space-y-1">
          <li>Level: {progress.level}</li>
          <li>XP: {progress.xp}</li>
          <li>Energy: {progress.energy}</li>
          <li>Stamina: {progress.stamina}</li>
          <li>Health: {progress.health}</li>
        </ul>
      </div>
    </div>
  );
}
