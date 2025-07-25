import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    metric: '',
    goal: '',
    rewardMoney: '',
    rewardExp: '',
    rewardBlackcoins: '',
    progressPoints: '',
    isActive: true,
  });
  const [editingTask, setEditingTask] = useState(null);

  // Predefined metrics with Arabic labels
  const metricOptions = [
    { value: 'level', label: 'المستوى', description: 'الوصول إلى مستوى معين' },
    { value: 'money', label: 'المال', description: 'جمع مبلغ معين من المال' },
    { value: 'blackcoins', label: 'البلاك كوين', description: 'جمع عدد معين من البلاك كوين' },
    { value: 'days_in_game', label: 'أيام في اللعبة', description: 'اللعب لمدة أيام معينة' },
    { value: 'fame', label: 'الشهرة', description: 'الوصول إلى مستوى شهرة معين' },
    { value: 'fights_won', label: 'المعارك المربوحة', description: 'الفوز بعدد معين من المعارك' },
    { value: 'fights_lost', label: 'المعارك المفقودة', description: 'خسارة عدد معين من المعارك' },
    { value: 'total_fights', label: 'إجمالي المعارك', description: 'خوض عدد معين من المعارك' },
    { value: 'kill_count', label: 'عدد القتلى', description: 'قتل عدد معين من اللاعبين' },
    { value: 'damage_dealt', label: 'الضرر المُلحق', description: 'إلحاق ضرر معين' },
    { value: 'crimes_committed', label: 'الجرائم المرتكبة', description: 'ارتكاب عدد معين من الجرائم' },
    { value: 'jobs_completed', label: 'الوظائف المكتملة', description: 'إكمال عدد معين من الوظائف' },
    { value: 'ministry_missions_completed', label: 'مهام الوزارة المكتملة', description: 'إكمال عدد معين من مهام الوزارة' },
    { value: 'money_deposited', label: 'المال المودع', description: 'إيداع مبلغ معين في البنك' },
    { value: 'money_withdrawn', label: 'المال المسحوب', description: 'سحب مبلغ معين من البنك' },
    { value: 'bank_balance', label: 'رصيد البنك', description: 'الوصول إلى رصيد بنكي معين' },
    { value: 'blackmarket_items_bought', label: 'العناصر المشتراة من السوق السوداء', description: 'شراء عدد معين من العناصر' },
    { value: 'blackmarket_items_sold', label: 'العناصر المباعة في السوق السوداء', description: 'بيع عدد معين من العناصر' },
    { value: 'gang_joined', label: 'الانضمام للعصابات', description: 'الانضمام لعدد معين من العصابات' },
    { value: 'gang_created', label: 'إنشاء العصابات', description: 'إنشاء عدد معين من العصابات' },
    { value: 'gang_money_contributed', label: 'المساهمة المالية في العصابات', description: 'المساهمة بمبلغ معين في العصابات' },
    { value: 'houses_owned', label: 'المنازل المملوكة', description: 'امتلاك عدد معين من المنازل' },
    { value: 'dogs_owned', label: 'الكلاب المملوكة', description: 'امتلاك عدد معين من الكلاب' },
    { value: 'suggestions_submitted', label: 'الاقتراحات المقدمة', description: 'تقديم عدد معين من الاقتراحات' }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      console.log('Debug: Token exists:', !!token);
      console.log('Debug: Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      const res = await axios.get('/api/tasks/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Debug: Error fetching tasks:', error.response?.status, error.response?.data);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function getMetricLabel(value) {
    const option = metricOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  function startEdit(task) {
    setEditingTask(task);
    setForm({ ...task });
    setShowForm(true);
  }

  function startCreate() {
    setEditingTask(null);
    setForm({
      title: '', description: '', metric: '', goal: '', rewardMoney: '', rewardExp: '', rewardBlackcoins: '', progressPoints: '', isActive: true
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwt');
      
      // Clean up form data - convert empty strings to 0 for numeric fields
      const cleanedForm = {
        ...form,
        goal: form.goal ? parseInt(form.goal) : 0,
        rewardMoney: form.rewardMoney ? parseInt(form.rewardMoney) : 0,
        rewardExp: form.rewardExp ? parseInt(form.rewardExp) : 0,
        rewardBlackcoins: form.rewardBlackcoins ? parseInt(form.rewardBlackcoins) : 0,
        progressPoints: form.progressPoints ? parseInt(form.progressPoints) : 0,
      };
      
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, cleanedForm, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } else {
        await axios.post('/api/tasks', cleanedForm, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      }
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error submitting task:', error.response?.data);
      // You might want to show an error message to the user here
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    const token = localStorage.getItem('jwt');
    await axios.delete(`/api/tasks/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchTasks();
  }

  const selectedMetric = metricOptions.find(opt => opt.value === form.metric);

  return (
    <div className="bg-hitman-900/80 rounded-xl p-6 shadow-lg border border-hitman-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accent-red">إدارة المهام</h2>
        <button onClick={startCreate} className="bg-accent-red text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition">إضافة مهمة جديدة</button>
      </div>
      {loading ? (
        <div className="text-center text-accent-red">جاري التحميل...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-hitman-400">لا توجد مهام بعد.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-right border-separate border-spacing-y-2">
            <thead>
              <tr className="text-accent-red">
                <th>العنوان</th>
                <th>الوصف</th>
                <th>المعيار</th>
                <th>الهدف</th>
                <th>مكافأة المال</th>
                <th>مكافأة الخبرة</th>
                <th>مكافأة البلاك كوين</th>
                <th>نقاط التقدم</th>
                <th>نشطة؟</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="bg-hitman-800 hover:bg-hitman-700 transition">
                  <td className="px-2 py-1 font-bold">{task.title}</td>
                  <td className="px-2 py-1">{task.description}</td>
                  <td className="px-2 py-1">{getMetricLabel(task.metric)}</td>
                  <td className="px-2 py-1">{task.goal}</td>
                  <td className="px-2 py-1">{task.rewardMoney}</td>
                  <td className="px-2 py-1">{task.rewardExp}</td>
                  <td className="px-2 py-1">{task.rewardBlackcoins}</td>
                  <td className="px-2 py-1">{task.progressPoints}</td>
                  <td className="px-2 py-1">{task.isActive ? 'نعم' : 'لا'}</td>
                  <td className="px-2 py-1 flex gap-2">
                    <button onClick={() => startEdit(task)} className="bg-accent-red text-white px-2 py-1 rounded hover:bg-red-700">تعديل</button>
                    <button onClick={() => handleDelete(task.id)} className="bg-hitman-700 text-white px-2 py-1 rounded hover:bg-red-900">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 bg-hitman-800 p-6 rounded-xl border border-accent-red max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-accent-red">{editingTask ? 'تعديل مهمة' : 'إضافة مهمة جديدة'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="title" 
              value={form.title} 
              onChange={handleInput} 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="عنوان المهمة" 
              required 
            />
            
            <select 
              name="metric" 
              value={form.metric} 
              onChange={handleInput} 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              required
            >
              <option value="">اختر المعيار</option>
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {selectedMetric && (
              <div className="col-span-1 md:col-span-2 bg-hitman-700 p-3 rounded text-sm text-hitman-300">
                <strong>وصف المعيار:</strong> {selectedMetric.description}
              </div>
            )}

            <input 
              name="goal" 
              value={form.goal} 
              onChange={handleInput} 
              type="number" 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder={selectedMetric ? `الهدف: ${selectedMetric.label}` : 'الهدف'} 
              required 
            />

            <input 
              name="rewardMoney" 
              value={form.rewardMoney} 
              onChange={handleInput} 
              type="number" 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="مكافأة المال" 
            />

            <input 
              name="rewardExp" 
              value={form.rewardExp} 
              onChange={handleInput} 
              type="number" 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="مكافأة الخبرة" 
            />

            <input 
              name="rewardBlackcoins" 
              value={form.rewardBlackcoins} 
              onChange={handleInput} 
              type="number" 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="مكافأة البلاك كوين" 
            />

            <input 
              name="progressPoints" 
              value={form.progressPoints} 
              onChange={handleInput} 
              type="number" 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white" 
              placeholder="نقاط التقدم" 
            />

            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleInput} 
              className="bg-hitman-900 border border-hitman-700 rounded px-3 py-2 text-white col-span-1 md:col-span-2" 
              placeholder="وصف المهمة" 
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
            <button type="submit" className="bg-accent-red text-white px-6 py-2 rounded font-bold hover:bg-red-700">{editingTask ? 'حفظ التعديلات' : 'إضافة'}</button>
          </div>
        </form>
      )}
    </div>
  );
} 