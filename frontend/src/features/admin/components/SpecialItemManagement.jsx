import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  Plus,
  Edit,
  Trash2,
  Heart,
  Zap,
  Sword,
  Shield,
  DollarSign,
  Gem,
  Bomb
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

export default function SpecialItemManagement() {
  const queryClient = useQueryClient();
  
  // Special item management state
  const [itemViewMode, setItemViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    type: 'HEALTH_POTION',
    effect: {
      health: 0,
      energy: 0,
      experience: 0,
      duration: 0
    },
    price: 100,
    currency: 'money',
    imageUrl: '',
    isAvailable: true,
    levelRequired: 1
  });
  const [itemEditingId, setItemEditingId] = useState(null);
  const [itemImageUploading, setItemImageUploading] = useState(false);
  const [itemImagePreview, setItemImagePreview] = useState('');

  // Fetch all special items for admin
  const { data: specialItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['admin-special-items'],
    queryFn: () => axios.get('/api/special-items/admin').then(res => res.data),
    staleTime: 30 * 1000,
  });

  // Special item mutations
  const createItemMutation = useMutation({
    mutationFn: (data) => axios.post('/api/special-items/admin', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-special-items']);
      toast.success('تم إنشاء العنصر الخاص بنجاح!');
      resetItemForm();
      setItemViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في إنشاء العنصر الخاص');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/special-items/admin/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-special-items']);
      toast.success('تم تحديث العنصر الخاص بنجاح!');
      resetItemForm();
      setItemViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في تحديث العنصر الخاص');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/special-items/admin/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-special-items']);
      toast.success('تم حذف العنصر الخاص بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'فشل في حذف العنصر الخاص');
    },
  });

  // Special item management helper functions
  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      type: 'HEALTH_POTION',
      effect: {
        health: 'max',
        energy: 0,
        experience: 0,
        duration: 0
      },
      price: 100,
      currency: 'money',
      imageUrl: '',
      isAvailable: true,
      levelRequired: 1
    });
    setItemImagePreview('');
    setItemEditingId(null);
  };

  const updateEffectsForType = (type) => {
    let newEffect = { health: 0, energy: 0, experience: 0, duration: 0 };
    
    if (type === 'HEALTH_POTION') {
      newEffect = { health: 'max', energy: 0, experience: 0, duration: 0 };
    } else if (type === 'ENERGY_POTION') {
      newEffect = { health: 0, energy: 'max', experience: 0, duration: 0 };
    } else if (type === 'EXPERIENCE_POTION') {
      newEffect = { health: 0, energy: 0, experience: 0, duration: 0 };
    } else if (type === 'NAME_CHANGE') {
      newEffect = { health: 0, energy: 0, experience: 0, nameChange: true, duration: 0 };
    } else if (type === 'GANG_BOMB') {
      newEffect = { health: 0, energy: 0, experience: 0, gangBomb: true, duration: 0 };
    } else if (type === 'ATTACK_IMMUNITY') {
      newEffect = { health: 0, energy: 0, experience: 0, attackImmunity: true, duration: 3600 };
    } else if (type === 'CD_RESET') {
      newEffect = { health: 0, energy: 0, experience: 0, cdReset: true, duration: 0 };
    }
    
    setItemForm(prev => ({ ...prev, effect: newEffect }));
  };

  const handleItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setItemForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
    
    // Update effects when type changes
    if (name === 'type') {
      updateEffectsForType(value);
    }
  };

  const handleEffectChange = (e) => {
    const { name, value, type } = e.target;
    setItemForm((prev) => ({
      ...prev,
      effect: {
        ...prev.effect,
        [name]: type === 'number' ? Number(value) : value,
      },
    }));
  };

  const handleItemImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setItemImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post('/api/special-items/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setItemForm((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
      setItemImagePreview(URL.createObjectURL(file));
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل في رفع الصورة');
    } finally {
      setItemImageUploading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemForm.imageUrl) {
      toast.error('يرجى رفع صورة للعنصر.');
      return;
    }

    try {
      if (itemEditingId) {
        await updateItemMutation.mutateAsync({ id: itemEditingId, data: itemForm });
      } else {
        await createItemMutation.mutateAsync(itemForm);
      }
    } catch {
      // Error is handled by mutation
    }
  };

  const handleItemEdit = (item) => {
    setItemForm({
      name: item.name,
      description: item.description,
      type: item.type,
      effect: item.effect,
      price: item.price,
      currency: item.currency,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      levelRequired: item.levelRequired
    });
    setItemImagePreview(item.imageUrl ? item.imageUrl : '');
    setItemEditingId(item.id);
    setItemViewMode('edit');
  };

  const handleItemDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر الخاص؟')) {
      await deleteItemMutation.mutateAsync(id);
    }
  };

  const handleItemCreateNew = () => {
    resetItemForm();
    setItemViewMode('create');
  };

  const handleItemCancel = () => {
    resetItemForm();
    setItemViewMode('list');
  };



  // Item type labels
  const itemTypeLabels = {
    HEALTH_POTION: 'جرعة صحة',
    ENERGY_POTION: 'جرعة طاقة',
    EXPERIENCE_POTION: 'جرعة خبرة',
    NAME_CHANGE: 'تغيير الاسم',
    GANG_BOMB: 'قنبلة عصابة',
    ATTACK_IMMUNITY: 'حماية من الهجمات',
    CD_RESET: 'إعادة تعيين أوقات الانتظار',
    OTHER: 'أخرى'
  };

  if (itemsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <p className="text-white">جاري تحميل العناصر الخاصة...</p>
      </div>
    );
  }

  return (
    <div>
      {itemViewMode === 'list' ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">إدارة العناصر الخاصة</h2>
            <button
              onClick={handleItemCreateNew}
              className="bg-accent-red hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء عنصر خاص جديد
            </button>
          </div>

          {/* Special Items Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specialItems.map((item) => (
              <div key={item.id} className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleItemEdit(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleItemDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-hitman-400">النوع:</span>
                    <span className="text-purple-400 font-bold">{itemTypeLabels[item.type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">السعر:</span>
                    <span className="text-green-400 font-bold">
                      {item.currency === 'blackcoin' ? (
                        <span className="flex items-center gap-1">
                          <Gem className="w-4 h-4 text-yellow-400" />
                          {item.price}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {item.price}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hitman-400">العملة:</span>
                    <span className={`font-bold ${item.currency === 'blackcoin' ? 'text-accent-red' : 'text-green-400'}`}>
                      {item.currency === 'blackcoin' ? 'عملة سوداء' : 'مال'}
                    </span>
                  </div>
                  {(item.type === 'EXPERIENCE_POTION' || item.type === 'GANG_BOMB' || item.type === 'ATTACK_IMMUNITY' || item.type === 'CD_RESET') && (
                    <div className="flex justify-between">
                      <span className="text-hitman-400">المستوى المطلوب:</span>
                      <span className="text-blue-400 font-bold">المستوى {item.levelRequired}</span>
                    </div>
                  )}
                </div>

                {/* Effects */}
                <div className="mt-4 p-3 bg-hitman-800/50 rounded-lg">
                  <h4 className="text-sm font-bold text-hitman-300 mb-2">التأثيرات:</h4>
                  <div className="space-y-1 text-xs">
                    {item.effect.health && (
                      <div className="flex items-center text-green-400">
                        <Heart className="w-3 h-3 mr-1" />
                        <span>صحة: {item.effect.health === 'max' ? '100%' : `+${item.effect.health}`}</span>
                      </div>
                    )}
                    {item.effect.energy && (
                      <div className="flex items-center text-yellow-400">
                        <Zap className="w-3 h-3 mr-1" />
                        <span>طاقة: {item.effect.energy === 'max' ? '100%' : `+${item.effect.energy}`}</span>
                      </div>
                    )}
                    {item.effect.experience && (
                      <div className="flex items-center text-blue-400">
                        <Sword className="w-3 h-3 mr-1" />
                        <span>خبرة: {item.effect.experience === 'max' ? '100%' : `+${item.effect.experience}`}</span>
                      </div>
                    )}

                    {item.effect.nameChange && (
                      <div className="flex items-center text-purple-400">
                        <Package className="w-3 h-3 mr-1" />
                        <span>تغيير الاسم</span>
                      </div>
                    )}

                    {item.effect.gangBomb && (
                      <div className="flex items-center text-red-400">
                        <Bomb className="w-3 h-3 mr-1" />
                        <span>قنبلة عصابة - إدخال جميع الأعضاء المستشفى لمدة 30 دقيقة</span>
                      </div>
                    )}

                    {item.effect.attackImmunity && (
                      <div className="flex items-center text-blue-400">
                        <Shield className="w-3 h-3 mr-1" />
                        <span>حماية من الهجمات - منع الهجمات المباشرة وقنابل العصابة لمدة {Math.floor(item.effect.duration / 60)} دقيقة</span>
                      </div>
                    )}

                    {item.effect.cdReset && (
                      <div className="flex items-center text-green-400">
                        <Package className="w-3 h-3 mr-1" />
                        <span>إعادة تعيين أوقات الانتظار - إزالة جميع أوقات الانتظار فوراً (سجن، مستشفى، جيم، جرائم)</span>
                      </div>
                    )}

                    {item.effect.duration > 0 && (
                      <div className="flex items-center text-purple-400">
                        <Package className="w-3 h-3 mr-1" />
                        <span>المدة: {item.effect.duration} ثانية</span>
                      </div>
                    )}
                  </div>
                </div>

                {item.imageUrl && (
                  <img 
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name} 
                    className="w-full h-32 object-cover rounded mt-4"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {specialItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-hitman-400 text-lg">لا توجد عناصر خاصة. قم بإنشاء أول عنصر خاص!</p>
            </div>
          )}
        </>
      ) : (
        /* Special Item Form */
        <div className="max-w-4xl mx-auto">
          <form
            className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-8"
            onSubmit={handleItemSubmit}
          >
            <h2 className="text-2xl font-bold mb-6 text-accent-red text-center">
              {itemEditingId ? 'تعديل العنصر الخاص' : 'إنشاء عنصر خاص جديد'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">صورة العنصر <span className="text-red-400">*</span></label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleItemImageChange} 
                  required={!itemForm.imageUrl} 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
                {itemImageUploading && <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>}
                {itemImagePreview && (
                  <img src={getImageUrl(itemImagePreview)} alt="Preview" className="mt-2 rounded max-h-32 border border-hitman-600" />
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">اسم العنصر <span className="text-red-400">*</span></label>
                <input 
                  name="name" 
                  value={itemForm.name} 
                  onChange={handleItemChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 text-sm text-hitman-300">الوصف <span className="text-red-400">*</span></label>
                <textarea 
                  name="description" 
                  value={itemForm.description} 
                  onChange={handleItemChange} 
                  required 
                  rows="3"
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-hitman-300">نوع العنصر <span className="text-red-400">*</span></label>
                <select 
                  name="type" 
                  value={itemForm.type} 
                  onChange={handleItemChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value="HEALTH_POTION">جرعة صحة</option>
                  <option value="ENERGY_POTION">جرعة طاقة</option>
                  <option value="EXPERIENCE_POTION">جرعة خبرة</option>
                  <option value="NAME_CHANGE">تغيير الاسم</option>
                  <option value="GANG_BOMB">قنبلة عصابة</option>
                  <option value="ATTACK_IMMUNITY">حماية من الهجمات</option>
                  <option value="CD_RESET">إعادة تعيين أوقات الانتظار</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm text-hitman-300">السعر <span className="text-red-400">*</span></label>
                <input 
                  name="price" 
                  type="number" 
                  min="1" 
                  value={itemForm.price} 
                  onChange={handleItemChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-hitman-300">العملة <span className="text-red-400">*</span></label>
                <select 
                  name="currency" 
                  value={itemForm.currency} 
                  onChange={handleItemChange} 
                  required 
                  className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                >
                  <option value="money">مال عادي</option>
                  <option value="blackcoin">عملة سوداء</option>
                </select>
              </div>

              {(itemForm.type === 'EXPERIENCE_POTION' || itemForm.type === 'GANG_BOMB' || itemForm.type === 'ATTACK_IMMUNITY' || itemForm.type === 'CD_RESET') && (
                <div>
                  <label className="block mb-1 text-sm text-hitman-300">المستوى المطلوب <span className="text-red-400">*</span></label>
                  <input 
                    name="levelRequired" 
                    type="number" 
                    min="1" 
                    value={itemForm.levelRequired} 
                    onChange={handleItemChange} 
                    required 
                    className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-hitman-300">
                  <input 
                    name="isAvailable" 
                    type="checkbox" 
                    checked={itemForm.isAvailable} 
                    onChange={handleItemChange} 
                    className="rounded bg-hitman-700 border border-hitman-600" 
                  />
                  متاح للشراء
                </label>
              </div>

              {/* Effects Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-4">التأثيرات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-hitman-800/50 rounded-lg">
                  {itemForm.type === 'HEALTH_POTION' && (
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm text-hitman-300">مقدار الصحة</label>
                      <select 
                        name="health" 
                        value={itemForm.effect.health} 
                        onChange={handleEffectChange} 
                        className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                      >
                        <option value="max">100% (أقصى صحة)</option>
                        <option value="0">0 (لا تأثير)</option>
                      </select>
                    </div>
                  )}
                  {itemForm.type === 'ENERGY_POTION' && (
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm text-hitman-300">مقدار الطاقة</label>
                      <select 
                        name="energy" 
                        value={itemForm.effect.energy} 
                        onChange={handleEffectChange} 
                        className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white"
                      >
                        <option value="max">100% (أقصى طاقة)</option>
                        <option value="0">0 (لا تأثير)</option>
                      </select>
                    </div>
                  )}
                  {itemForm.type === 'EXPERIENCE_POTION' && (
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm text-hitman-300">الخبرة المضافة</label>
                      <input 
                        name="experience" 
                        type="number" 
                        min="0" 
                        value={itemForm.effect.experience} 
                        onChange={handleEffectChange} 
                        className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                      />
                    </div>
                  )}
                  {(itemForm.type === 'ATTACK_IMMUNITY') && (
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm text-hitman-300">مدة الحماية (ثانية)</label>
                      <input 
                        name="duration" 
                        type="number" 
                        min="0" 
                        value={itemForm.effect.duration} 
                        onChange={handleEffectChange} 
                        className="w-full p-2 rounded bg-hitman-700 border border-hitman-600 text-white" 
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-sm text-hitman-400">
                      ملاحظة: سيتم تعيين التأثيرات تلقائياً بناءً على نوع العنصر المختار
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={createItemMutation.isPending || updateItemMutation.isPending || itemImageUploading}
                className="flex-1 py-2 rounded bg-accent-red hover:bg-red-700 text-white font-bold text-lg transition-colors duration-200 disabled:opacity-60"
              >
                {createItemMutation.isPending || updateItemMutation.isPending ? (itemEditingId ? 'جاري التحديث...' : 'جاري الإنشاء...') : (itemEditingId ? 'تحديث العنصر' : 'إنشاء العنصر')}
              </button>
              <button
                type="button"
                onClick={handleItemCancel}
                className="px-6 py-2 rounded bg-hitman-700 hover:bg-hitman-600 text-white font-bold transition-colors duration-200"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 