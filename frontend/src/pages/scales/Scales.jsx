import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { 
  Brain, 
  Ear, 
  Eye, 
  Activity, 
  FileText, 
  ChevronLeft,
  Search,
  BookOpen,
  Plus,
  User,
  CheckCircle,
  Play
} from 'lucide-react';
import Modal from '../../components/common/Modal';

const Scales = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  // Fetch real tests from assessment engine
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['assessment-tests'],
    queryFn: async () => {
      const response = await apiClient.get('/assessments/tests');
      return response.data.data;
    },
  });

  // Fetch doctor's children for selection
  const { data: myChildren } = useQuery({
    queryKey: ['doctor-children-selection'],
    queryFn: async () => {
      const response = await apiClient.get('/doctor/children');
      return response.data.data;
    },
    enabled: role === 'doctor'
  });

  const handleStartTest = (testId) => {
    setSelectedTestId(testId);
    setIsChildModalOpen(true);
  };

  const selectChildAndStart = (childId) => {
    navigate(`/doctor/assessment/${selectedTestId}/${childId}`);
  };

  // Group tests by category
  const groupedTests = tests?.reduce((acc, test) => {
    const cat = test.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(test);
    return acc;
  }, {}) || {};

  const categories = [
    {
      id: 'AUDITORY',
      title: 'التقييمات السمعية',
      icon: Ear,
      color: 'bg-blue-100 text-blue-600',
      description: 'اختبارات لقياس مدى استجابة الطفل للأصوات والتمييز بينها.',
    },
    {
      id: 'VISUAL',
      title: 'التقييمات البصرية',
      icon: Eye,
      color: 'bg-green-100 text-green-600',
      description: 'اختبارات لقياس التواصل البصري والتمييز بين الأشكال والألوان.',
    },
    {
      id: 'psychological',
      title: 'المقاييس النفسية',
      icon: Brain,
      color: 'bg-purple-100 text-purple-600',
      description: 'أدوات تقييم الحالة النفسية والانفعالية ومستوى الذكاء.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المقاييس والاختبارات</h1>
          <p className="text-gray-500 mt-1">مكتبة المقاييس النفسية، السلوكية، والطبية المعتمدة</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث في المقاييس..." 
            className="input pr-10 pl-4 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id}
            onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
            className={`glass-card rounded-2xl p-6 border transition-all duration-300 cursor-pointer hover:shadow-lg ${
              activeCategory === category.id ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50/10' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color}`}>
                <category.icon size={24} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 bg-gray-50 text-gray-400 ${
                activeCategory === category.id ? 'rotate-[-90deg] bg-primary-100 text-primary-600' : ''
              }`}>
                <ChevronLeft size={20} />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              {category.description}
            </p>

            {/* Expandable Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${
              activeCategory === category.id ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-100' : 'grid-rows-[0fr] opacity-0'
            }`}>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <BookOpen size={16} />
                  الاختبارات المتوفرة:
                </h4>
                <ul className="space-y-3">
                  {groupedTests[category.id]?.map((test) => (
                    <li key={test.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-primary-200 transition-colors flex items-center justify-between group/item">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{test.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{test.description}</p>
                      </div>
                      {role === 'doctor' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTest(test.id);
                          }}
                          className="p-2 bg-primary-600 text-white rounded-lg opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110"
                          title="بدء الاختبار لطفل"
                        >
                          <Play size={14} fill="currentColor" />
                        </button>
                      )}
                    </li>
                  )) || (
                    <p className="text-xs text-gray-400 italic py-2">قريباً...</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Child Selection Modal for Doctor */}
      <Modal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        title="اختر الطفل لبدء التقييم"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">يرجى اختيار الطفل الذي تود إجراء الاختبار له الآن.</p>
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {myChildren?.length > 0 ? (
              myChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => selectChildAndStart(child.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all text-right group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:border-primary-200 transition-colors">
                    <User className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{child.name}</p>
                    <p className="text-xs text-gray-500">ولي الأمر: {child.user?.fullName}</p>
                  </div>
                  <ChevronLeft size={20} className="text-gray-300 group-hover:text-primary-600" />
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">لا يوجد أطفال مسجلين لديك لإجراء الاختبار</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Scales;
