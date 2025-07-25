import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    titleEn: '',
    rank: '',
    requiredPoints: '',
    powerBonus: '',
    defenseBonus: '',
    description: '',
    isActive: true,
  });
  const [editingPromotion, setEditingPromotion] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await axios.get('/api/tasks/promotions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPromotions(res.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(promotion) {
    setEditingPromotion(promotion);
    setForm({ ...promotion });
    setShowForm(true);
  }

  function startCreate() {
    setEditingPromotion(null);
    setForm({
      title: '', titleEn: '', rank: '', requiredPoints: '', powerBonus: '', defenseBonus: '', description: '', isActive: true
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwt');
      
      // Clean up form data
      const cleanedForm = {
        ...form,
        rank: form.rank ? parseInt(form.rank) : 0,
        requiredPoints: form.requiredPoints ? parseInt(form.requiredPoints) : 0,
        powerBonus: form.powerBonus ? parseInt(form.powerBonus) : 0,
        defenseBonus: form.defenseBonus ? parseInt(form.defenseBonus) : 0,
      };
      
      if (editingPromotion) {
        await axios.put(`/api/tasks/promotions/${editingPromotion.id}`, cleanedForm, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } else {
        await axios.post('/api/tasks/promotions', cleanedForm, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      }
      setShowForm(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error submitting promotion:', error.response?.data);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرتبة؟')) return;
    const token = localStorage.getItem('jwt');
    await axios.delete(`/api/tasks/promotions/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchPromotions();
  }

  return (
    <div className="bg-hitman-900/80 rounded-xl p-6 shadow-lg border border-hitman-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accent-red">إدارة نظام الرتب</h2>
        <button onClick={startCreate} className="bg-accent-red text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition">إضافة رتبة جديدة</button>
      </div>
      {loading ? (
        <div className="text-center text-accent-red">جاري التحميل...</div>
      ) : promotions.length === 0 ? (
        <div className="text-center text-hitman-400">لا توجد رتب بعد.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-right border-separate border-spacing-y-2">
            <thead>
              <tr className="text-accent-red">
                <th>الرتبة</th>
                <th>العنوان</th>
                <th>العنوان (إنجليزي)</th>
                <th>النقاط المطلوبة</th>
                <th>مكافأة القوة</th>
                <th>مكافأة الدفاع</th>
                <th>الوصف</th>
                <th>نشطة؟</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promotion => (
                <tr key={promotion.id} className="bg-hitman-800 hover:bg-hitman-700 transition">
                  <td className="px-2 py-1 font-bold">{promotion.rank}</td>
                  <td className="px-2 py-1">{promotion.title}</td>
                  <td className="px-2 py-1">{promotion.titleEn}</td>
                  <td className="px-2 py-1">{promotion.requiredPoints}</td>
                  <td className="px-2 py-1">{promotion.powerBonus}</td>
                  <td className="px-2 py-1">{promotion.defenseBonus}</td>
                  <td className="px-2 py-1 max-w-xs truncate">{promotion.description}</td>
                  <td className="px-2 py-1">{promotion.isActive ? 'نعم' : 'لا'}</td>
                  <td className="px-2 py-1 flex gap-2">
                    <button onClick={() => startEdit(promotion)} className="bg-accent-red text-white px-2 py-1 rounded hover:bg-red-700">تعديل</button>
                    <button onClick={() => handleDelete(promotion.id)} className="bg-hitman-700 text-white px-2 py-1 rounded hover:bg-red-900">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 bg-hitman-800 p-6 rounded-xl border border-accent-red max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-accent-red">{editingPromotion ? 'تعديل رتبة' : 'إضافة رتبة جديدة'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="rank" 
              value={form.rank} 
              onChange={handleInput} 
              type="number"
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="الرتبة (1-10)" 
              required 
            />
            <input 
              name="title" 
              value={form.title} 
              onChange={handleInput} 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="العنوان (عربي)" 
              required 
            />
            <input 
              name="titleEn" 
              value={form.titleEn} 
              onChange={handleInput} 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="العنوان (إنجليزي)" 
              required 
            />
            <input 
              name="requiredPoints" 
              value={form.requiredPoints} 
              onChange={handleInput} 
              type="number"
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="النقاط المطلوبة" 
              required 
            />
            <input 
              name="powerBonus" 
              value={form.powerBonus} 
              onChange={handleInput} 
              type="number"
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="مكافأة القوة" 
            />
            <input 
              name="defenseBonus" 
              value={form.defenseBonus} 
              onChange={handleInput} 
              type="number"
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="مكافأة الدفاع" 
            />
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleInput} 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white col-span-1 md:col-span-2" 
              placeholder="وصف الرتبة" 
              required 
            />
            <label className="flex items-center gap-2 col-span-1 md:col-span-2">
              <input 
                type="checkbox" 
                name="isActive" 
                checked={form.isActive} 
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} 
              />
              <span className="text-white">نشطة</span>
            </label>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => setShowForm(false)} className="bg-hitman-700 text-white px-4 py-2 rounded hover:bg-hitman-900">إلغاء</button>
            <button type="submit" className="bg-accent-red text-white px-6 py-2 rounded font-bold hover:bg-red-700">{editingPromotion ? 'حفظ التعديلات' : 'إضافة'}</button>
          </div>
        </form>
      )}
    </div>
  );
} 