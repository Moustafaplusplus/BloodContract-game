import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Target, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Copy,
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Settings,
  Upload,
  Info,
  HelpCircle
} from 'lucide-react';

export default function MinistryMissionManagement() {
  const queryClient = useQueryClient();
  
  // Mission management state
  const [missionViewMode, setMissionViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [showFlowDiagram, setShowFlowDiagram] = useState(false);
  const [missionForm, setMissionForm] = useState({
    missionId: '',
    title: '',
    description: '',
    minLevel: 5,
    thumbnail: '',
    banner: '',
    isActive: true,
    order: 0,
    // Predefined flow structure
    missionData: {
      pages: {
        start: {
          text: '',
          image: '',
          options: [
            { text: '', next: 'page_1' },
            { text: '', next: 'page_2' }
          ]
        },
        page_1: {
          text: '',
          image: '',
          options: [
            { text: '', next: 'page_3' },
            { text: '', next: 'page_4' }
          ]
        },
        page_2: {
          text: '',
          image: '',
          options: [
            { text: '', next: 'page_5' },
            { text: '', next: 'page_6' }
          ]
        },
        page_3: {
          text: '',
          image: '',
          options: [
            { text: '', next: 'ending_combat' },
            { text: '', next: 'ending_stealth' }
          ]
        },
        page_4: {
          text: '',
          image: '',
          options: [
            { text: '', next: 'ending_reveal' },
            { text: '', next: 'ending_deception' }
          ]
        },
        page_5: {
          text: '',
          image: '',
          options: [
            { text: '', next: 'ending_combat' },
            { text: '', next: 'ending_stealth' }
          ]
        },
        page_6: {
          text: '',
          image: '',
          options: [
            { text: '', next: 'ending_reject' },
            { text: '', next: 'ending_reveal' }
          ]
        }
      },
      endings: {
        ending_reject: {
          reward: 'none',
          summary: ''
        },
        ending_combat: {
          reward: 'money+xp',
          summary: ''
        },
        ending_stealth: {
          reward: 'blackcoins (best)',
          summary: ''
        },
        ending_reveal: {
          reward: 'money+xp',
          summary: ''
        },
        ending_deception: {
          reward: 'blackcoins (best)',
          summary: ''
        }
      }
    }
  });
  const [missionEditingId, setMissionEditingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadingType, setImageUploadingType] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [currentPage, setCurrentPage] = useState('start');
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch all missions for admin
  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ['admin-ministry-missions'],
    queryFn: () => axios.get('/api/ministry-missions/admin/list').then(res => res.data.data || []),
    staleTime: 30 * 1000,
  });

  // Mission mutations
  const createMissionMutation = useMutation({
    mutationFn: (data) => axios.post('/api/ministry-missions/admin', data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-ministry-missions']);
      toast.success('تم إنشاء المهمة بنجاح!');
      resetMissionForm();
      setMissionViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'فشل في إنشاء المهمة');
    },
  });

  const updateMissionMutation = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/api/ministry-missions/admin/${id}`, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-ministry-missions']);
      toast.success('تم تحديث المهمة بنجاح!');
      resetMissionForm();
      setMissionViewMode('list');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'فشل في تحديث المهمة');
    },
  });

  const deleteMissionMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/ministry-missions/admin/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-ministry-missions']);
      toast.success('تم حذف المهمة بنجاح!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'فشل في حذف المهمة');
    },
  });

  // Mission management helper functions
  const resetMissionForm = () => {
    setMissionForm({
      missionId: '',
      title: '',
      description: '',
      minLevel: 5,
      thumbnail: '',
      banner: '',
      isActive: true,
      order: 0,
      missionData: {
        pages: {
          start: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'page_1' },
              { text: '', next: 'page_2' }
            ]
          },
          page_1: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'page_3' },
              { text: '', next: 'page_4' }
            ]
          },
          page_2: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'page_5' },
              { text: '', next: 'page_6' }
            ]
          },
          page_3: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_combat' },
              { text: '', next: 'ending_stealth' }
            ]
          },
          page_4: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_reveal' },
              { text: '', next: 'ending_deception' }
            ]
          },
          page_5: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_combat' },
              { text: '', next: 'ending_stealth' }
            ]
          },
          page_6: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_reject' },
              { text: '', next: 'ending_reveal' }
            ]
          }
        },
        endings: {
          ending_reject: {
            reward: 'none',
            summary: ''
          },
          ending_combat: {
            reward: 'money+xp',
            summary: ''
          },
          ending_stealth: {
            reward: 'blackcoins (best)',
            summary: ''
          },
          ending_reveal: {
            reward: 'money+xp',
            summary: ''
          },
          ending_deception: {
            reward: 'blackcoins (best)',
            summary: ''
          }
        }
      }
    });
    setMissionEditingId(null);
    setCurrentPage('start');
    setImagePreview('');
  };

  const handleMissionChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setMissionForm(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setMissionForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleMissionDataChange = (path, value) => {
    const keys = path.split('.');
    setMissionForm(prev => {
      const newForm = { ...prev };
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      setImageUploadingType(type);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/ministry-missions/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = response.data.url;
      
      // Handle different types of image uploads
      if (type === 'thumbnail' || type === 'banner') {
        setMissionForm(prev => ({ ...prev, [type]: imageUrl }));
      } else if (type.startsWith('missionData.pages.')) {
        // Handle page image uploads
        const path = type;
        handleMissionDataChange(path, imageUrl);
      }
      
      setImagePreview(imageUrl);
    } catch (error) {
      toast.error('فشل في رفع الصورة');
    } finally {
      setImageUploading(false);
      setImageUploadingType('');
    }
  };

  const handleMissionSubmit = async (e) => {
    e.preventDefault();
    
    if (!missionForm.missionId || !missionForm.title || !missionForm.missionData) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (missionEditingId) {
      updateMissionMutation.mutate({ id: missionEditingId, data: missionForm });
    } else {
      createMissionMutation.mutate(missionForm);
    }
  };

  const handleMissionEdit = (mission) => {
    setMissionForm({
      missionId: mission.missionId,
      title: mission.title,
      description: mission.description,
      minLevel: mission.minLevel,
      thumbnail: mission.thumbnail,
      banner: mission.banner,
      isActive: mission.isActive,
      order: mission.order,
      missionData: mission.missionData || {
        pages: {
          start: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'page_1' },
              { text: '', next: 'page_2' }
            ]
          },
          page_1: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'page_3' },
              { text: '', next: 'page_4' }
            ]
          },
          page_2: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'page_5' },
              { text: '', next: 'page_6' }
            ]
          },
          page_3: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_combat' },
              { text: '', next: 'ending_stealth' }
            ]
          },
          page_4: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_reveal' },
              { text: '', next: 'ending_deception' }
            ]
          },
          page_5: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_combat' },
              { text: '', next: 'ending_stealth' }
            ]
          },
          page_6: {
            text: '',
            image: '',
            options: [
              { text: '', next: 'ending_reject' },
              { text: '', next: 'ending_reveal' }
            ]
          }
        },
        endings: {
          ending_reject: { reward: 'none', summary: '' },
          ending_combat: { reward: 'money+xp', summary: '' },
          ending_stealth: { reward: 'blackcoins (best)', summary: '' },
          ending_reveal: { reward: 'money+xp', summary: '' },
          ending_deception: { reward: 'blackcoins (best)', summary: '' }
        }
      }
    });
    setMissionEditingId(mission.id);
    setMissionViewMode('edit');
  };

  const handleMissionDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      deleteMissionMutation.mutate(id);
    }
  };

  const handleMissionCreateNew = () => {
    resetMissionForm();
    setMissionViewMode('create');
  };

  const handleMissionCancel = () => {
    resetMissionForm();
    setMissionViewMode('list');
  };

  const updateOption = (index, field, value) => {
    const currentPageData = missionForm.missionData.pages[currentPage];
    const newOptions = [...currentPageData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleMissionDataChange(`missionData.pages.${currentPage}.options`, newOptions);
  };

  const getPageTitle = (pageId) => {
    const pageTitles = {
      start: 'الصفحة الأولى',
      page_1: 'الصفحة الثانية',
      page_2: 'الصفحة الثالثة',
      page_3: 'الصفحة الرابعة',
      page_4: 'الصفحة الخامسة',
      page_5: 'الصفحة السادسة',
      page_6: 'الصفحة السابعة'
    };
    return pageTitles[pageId] || pageId;
  };

  const getNextPageTitle = (nextPage) => {
    if (nextPage.startsWith('ending_')) {
      const endingTitles = {
        ending_reject: 'نهاية: رفض',
        ending_combat: 'نهاية: قتال',
        ending_stealth: 'نهاية: تسلل',
        ending_reveal: 'نهاية: كشف',
        ending_deception: 'نهاية: خداع'
      };
      return endingTitles[nextPage] || nextPage;
    }
    return getPageTitle(nextPage);
  };

  // Flow diagram component
  const FlowDiagram = () => (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 max-w-4xl">
      <h4 className="text-lg font-bold text-white mb-4 text-center">خريطة تدفق القصة</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {/* Row 1: Start */}
        <div className="text-center">
          <div className="bg-accent-red text-white p-3 rounded-lg mb-2">
            <div className="font-bold">الصفحة الأولى</div>
            <div className="text-xs opacity-80">بداية القصة</div>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <div>↓ الخيار 1</div>
            <div>↓ الخيار 2</div>
          </div>
        </div>

        {/* Row 2: Page 1 & 2 */}
        <div className="text-center">
          <div className="bg-blue-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">الصفحة الثانية</div>
            <div className="text-xs opacity-80">مسار 1</div>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <div>↓ الخيار 1</div>
            <div>↓ الخيار 2</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-blue-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">الصفحة الثالثة</div>
            <div className="text-xs opacity-80">مسار 2</div>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <div>↓ الخيار 1</div>
            <div>↓ الخيار 2</div>
          </div>
        </div>

        {/* Row 3: Page 3 & 4 */}
        <div className="text-center">
          <div className="bg-green-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">الصفحة الرابعة</div>
            <div className="text-xs opacity-80">من صفحة 2</div>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <div>↓ الخيار 1</div>
            <div>↓ الخيار 2</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-green-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">الصفحة الخامسة</div>
            <div className="text-xs opacity-80">من صفحة 2</div>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <div>↓ الخيار 1</div>
            <div>↓ الخيار 2</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-green-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">الصفحة السادسة</div>
            <div className="text-xs opacity-80">من صفحة 3</div>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <div>↓ الخيار 1</div>
            <div>↓ الخيار 2</div>
          </div>
        </div>

        {/* Row 4: Page 5 & 6 */}
        <div className="text-center">
          <div className="bg-green-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">الصفحة السابعة</div>
            <div className="text-xs opacity-80">من صفحة 3</div>
          </div>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <div>↓ الخيار 1</div>
            <div>↓ الخيار 2</div>
          </div>
        </div>

        {/* Row 5: Endings */}
        <div className="text-center">
          <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">نهاية: رفض</div>
            <div className="text-xs opacity-80">لا توجد مكافأة</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">نهاية: قتال</div>
            <div className="text-xs opacity-80">مال + خبرة</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">نهاية: تسلل</div>
            <div className="text-xs opacity-80">عملات سوداء</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">نهاية: كشف</div>
            <div className="text-xs opacity-80">مال + خبرة</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
            <div className="font-bold">نهاية: خداع</div>
            <div className="text-xs opacity-80">عملات سوداء</div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-zinc-700 rounded-lg">
        <h5 className="font-bold text-white mb-2">ملاحظات:</h5>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• كل صفحة تحتوي على خيارين محددين مسبقاً</li>
          <li>• الخيارات تؤدي إلى صفحات محددة أو نهايات</li>
          <li>• النهايات لها مكافآت مختلفة (مال، خبرة، عملات سوداء)</li>
          <li>• التركيز على النص والصور فقط - التدفق ثابت</li>
        </ul>
      </div>
    </div>
  );

  if (missionsLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
        <div className="text-lg text-gray-400">جاري تحميل المهام...</div>
      </div>
    );
  }

  // Mission list view
  if (missionViewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">إدارة مهام الوزارة</h2>
            <p className="text-gray-400">إنشاء وإدارة المهام السرية للوزارة</p>
          </div>
          <button
            onClick={handleMissionCreateNew}
            className="bg-accent-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            مهمة جديدة
          </button>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <div 
              key={mission.id}
              className={`bg-zinc-900 border rounded-lg overflow-hidden ${
                mission.isActive ? 'border-zinc-600' : 'border-zinc-700 opacity-60'
              }`}
            >
              {/* Mission Banner */}
              <div className="h-32 relative">
                {mission.banner ? (
                  <img
                    src={mission.banner}
                    alt={mission.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    mission.isActive 
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-700 text-gray-300'
                  }`}>
                    {mission.isActive ? 'نشطة' : 'غير نشطة'}
                  </span>
                </div>
              </div>

              {/* Mission Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{mission.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{mission.description}</p>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div>المعرف: {mission.missionId}</div>
                  <div>المستوى المطلوب: {mission.minLevel}</div>
                  <div>الترتيب: {mission.order}</div>
                  <div>الصفحات: {mission.pagesCount}</div>
                  <div>النهايات: {mission.endingsCount}</div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">
                    {new Date(mission.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMissionEdit(mission)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMissionDelete(mission.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {missions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-500 mb-4">لا توجد مهام حالياً</div>
            <div className="text-gray-600">ابدأ بإنشاء مهمة جديدة</div>
          </div>
        )}
      </div>
    );
  }

  // Mission form view (create/edit)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {missionEditingId ? 'تعديل المهمة' : 'مهمة جديدة'}
          </h2>
          <p className="text-gray-400">
            {missionEditingId ? 'تعديل بيانات المهمة' : 'إنشاء مهمة جديدة'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {previewMode ? 'إخفاء المعاينة' : 'معاينة'}
          </button>
          <button
            onClick={handleMissionCancel}
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            إلغاء
          </button>
        </div>
      </div>

      <form onSubmit={handleMissionSubmit} className="space-y-6">
        {/* Basic Mission Info */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">المعلومات الأساسية</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                معرف المهمة *
              </label>
              <input
                type="text"
                name="missionId"
                value={missionForm.missionId}
                onChange={handleMissionChange}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                placeholder="مثال: mission_001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                العنوان *
              </label>
              <input
                type="text"
                name="title"
                value={missionForm.title}
                onChange={handleMissionChange}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                placeholder="عنوان المهمة"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الوصف
              </label>
              <textarea
                name="description"
                value={missionForm.description}
                onChange={handleMissionChange}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                placeholder="وصف المهمة"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المستوى المطلوب
              </label>
              <input
                type="number"
                name="minLevel"
                value={missionForm.minLevel}
                onChange={handleMissionChange}
                min="1"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الترتيب
              </label>
              <input
                type="number"
                name="order"
                value={missionForm.order}
                onChange={handleMissionChange}
                min="0"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={missionForm.isActive}
                  onChange={handleMissionChange}
                  className="rounded border-zinc-600 bg-zinc-800 text-accent-red focus:ring-accent-red"
                />
                <span className="text-sm font-medium text-gray-300">نشطة</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">الصور</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الصورة المصغرة
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'thumbnail')}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white cursor-pointer hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  رفع صورة
                </label>
                <input
                  type="text"
                  name="thumbnail"
                  value={missionForm.thumbnail}
                  onChange={handleMissionChange}
                  placeholder="رابط الصورة"
                  className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              {missionForm.thumbnail && (
                <img
                  src={missionForm.thumbnail}
                  alt="Thumbnail"
                  className="mt-2 w-20 h-20 object-cover rounded border"
                />
              )}
              {imageUploading && imageUploadingType === 'thumbnail' && (
                <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                صورة البانر
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'banner')}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white cursor-pointer hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  رفع صورة
                </label>
                <input
                  type="text"
                  name="banner"
                  value={missionForm.banner}
                  onChange={handleMissionChange}
                  placeholder="رابط الصورة"
                  className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                />
              </div>
              {missionForm.banner && (
                <img
                  src={missionForm.banner}
                  alt="Banner"
                  className="mt-2 w-20 h-20 object-cover rounded border"
                />
              )}
              {imageUploading && imageUploadingType === 'banner' && (
                <div className="text-xs text-red-400 mt-1">جاري الرفع...</div>
              )}
            </div>
          </div>
        </div>

        {/* Story Builder */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">محتوى القصة</h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400">
                تدفق محدد مسبقاً - فقط أضف النص والصور
              </div>
              <button
                type="button"
                onClick={() => setShowFlowDiagram(!showFlowDiagram)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-lg transition-colors"
                title="عرض خريطة التدفق"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Flow Diagram */}
          {showFlowDiagram && (
            <div className="mb-6">
              <FlowDiagram />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pages List */}
            <div className="lg:col-span-1">
              <h4 className="text-md font-semibold text-white mb-3">الصفحات</h4>
              <div className="space-y-2">
                {Object.keys(missionForm.missionData.pages).map((pageId) => (
                  <div
                    key={pageId}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentPage === pageId
                        ? 'bg-accent-red text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                    onClick={() => setCurrentPage(pageId)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {getPageTitle(pageId)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Page Editor */}
            <div className="lg:col-span-2">
              <h4 className="text-md font-semibold text-white mb-3">
                محتوى الصفحة: {getPageTitle(currentPage)}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    النص
                  </label>
                  <textarea
                    value={missionForm.missionData.pages[currentPage]?.text || ''}
                    onChange={(e) => handleMissionDataChange(`missionData.pages.${currentPage}.text`, e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                    placeholder="نص القصة..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    صورة الخلفية
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, `missionData.pages.${currentPage}.image`)}
                      className="hidden"
                      id={`page-image-upload-${currentPage}`}
                    />
                    <label
                      htmlFor={`page-image-upload-${currentPage}`}
                      className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white cursor-pointer hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      رفع صورة
                    </label>
                    <input
                      type="text"
                      value={missionForm.missionData.pages[currentPage]?.image || ''}
                      onChange={(e) => handleMissionDataChange(`missionData.pages.${currentPage}.image`, e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                      placeholder="رابط الصورة"
                    />
                  </div>
                  {missionForm.missionData.pages[currentPage]?.image && (
                    <div className="mb-2">
                      <img
                        src={missionForm.missionData.pages[currentPage].image}
                        alt="Page Background"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {imageUploading && imageUploadingType === `missionData.pages.${currentPage}.image` && (
                    <div className="text-xs text-red-400">جاري الرفع...</div>
                  )}
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    الخيارات (محددة مسبقاً)
                  </label>
                  
                  <div className="space-y-3">
                    {missionForm.missionData.pages[currentPage]?.options?.map((option, index) => (
                      <div key={index} className="border border-zinc-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">الخيار {index + 1}</span>
                          <span className="text-xs text-gray-500">
                            يؤدي إلى: {getNextPageTitle(option.next)}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          placeholder="نص الخيار"
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Endings Configuration */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">تكوين النهايات</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(missionForm.missionData.endings).map(([endingKey, ending]) => (
              <div key={endingKey} className="border border-zinc-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-white mb-3">
                  {endingKey === 'ending_reject' && 'نهاية: رفض'}
                  {endingKey === 'ending_combat' && 'نهاية: قتال'}
                  {endingKey === 'ending_stealth' && 'نهاية: تسلل'}
                  {endingKey === 'ending_reveal' && 'نهاية: كشف'}
                  {endingKey === 'ending_deception' && 'نهاية: خداع'}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      نوع المكافأة
                    </label>
                    <select
                      value={ending.reward}
                      onChange={(e) => handleMissionDataChange(`missionData.endings.${endingKey}.reward`, e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                    >
                      <option value="none">لا توجد مكافأة</option>
                      <option value="money+xp">مال + خبرة</option>
                      <option value="blackcoins (best)">عملات سوداء (الأفضل)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ملخص النهاية
                    </label>
                    <textarea
                      value={ending.summary}
                      onChange={(e) => handleMissionDataChange(`missionData.endings.${endingKey}.summary`, e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-accent-red focus:outline-none"
                      placeholder="ملخص ما حدث في هذه النهاية..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleMissionCancel}
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={createMissionMutation.isPending || updateMissionMutation.isPending}
            className="bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {createMissionMutation.isPending || updateMissionMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {missionEditingId ? 'تحديث المهمة' : 'إنشاء المهمة'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 