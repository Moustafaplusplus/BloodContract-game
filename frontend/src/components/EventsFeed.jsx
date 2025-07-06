// frontend/src/components/EventsFeed.jsx
import React from 'react';

export default function EventsFeed({ events }) {
  const safeEvents = Array.isArray(events) ? events : [];

  if (!safeEvents.length) return null;

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title">Today's Events</h2>
        <ul className="text-sm space-y-1 max-h-64 overflow-y-auto">
          {safeEvents.map((e, i) => (
            <li key={i} className="border-b border-base-200 py-1">{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

