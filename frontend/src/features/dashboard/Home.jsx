// src/features/dashboard/Home.jsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-3xl font-bold">مرحباً، {user?.nickname || user?.username}!</h1>
      <p>هذه هي لوحة القيادة الخاصة بك. اختر أحد الخيارات من القائمة الجانبية للبدء.</p>
      {/* يمكنك إضافة بطاقات ملخص سريعة هنا */}
    </div>
  );
}