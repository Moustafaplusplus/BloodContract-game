// src/components/HUD/index.jsx
import React from 'react';
import { useHud } from '@/hooks/useHud';

export default function HUD() {
  const { stats } = useHud();
  if (!stats) return null;

  return (
    <div dir="rtl" className="fixed top-0 left-0 right-0 bg-black bg-opacity-60 text-white py-2 px-4 flex justify-around text-sm z-50">
      <span>الصحة: {stats.health}</span>
      <span>الرصيد: {stats.cash}</span>
      <span>الطاقة: {stats.energy}</span>
      {/* أضف حقولًا أخرى حسب الحاجة */}
    </div>
  );
}