import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronLeft,
  Ear,
  Eye,
  Play,
  Search,
  User,
} from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/common/Modal';
import { doctorAssessments } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';

const categoryMeta = {
  AUDITORY: {
    title: 'التقييمات السمعية',
    icon: Ear,
    color: 'bg-blue-100 text-blue-600',
    description: 'اختبارات لقياس استجابة الطفل للأصوات والتمييز بينها.',
  },
  VISUAL: {
    title: 'التقييمات البصرية',
    icon: Eye,
    color: 'bg-green-100 text-green-600',
    description: 'اختبارات لقياس الإدراك البصري والتسلسل والتمييز من خلال الصور والمشاهد.',
  },
  OTHER: {
    title: 'تقييمات أخرى',
    icon: BookOpen,
    color: 'bg-gray-100 text-gray-600',
    description: 'اختبارات متاحة ضمن تصنيفات أخرى.',
  },
};

const categoryOrder = ['AUDITORY', 'VISUAL', 'OTHER'];

const Scales = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['assessment-tests'],
    queryFn: async () => {
      const response = await doctorAssessments.getTests();
      return response.data.data ?? [];
    },
  });

  const { data: myChildren } = useQuery({
    queryKey: ['doctor-children-selection'],
    queryFn: async () => {
      const response = await apiClient.get('/doctor/children');
      return response.data.data;
    },
    enabled: role === 'doctor',
  });

  const handleStartTest = (testId) => {
    setSelectedTestId(testId);
    setIsChildModalOpen(true);
  };

  const selectChildAndStart = (childId) => {
    navigate(`/doctor/assessment/${selectedTestId}/${childId}`);
  };

  const toggleCategory = (categoryId) => {
    setActiveCategory((currentCategory) =>
      currentCategory === categoryId ? null : categoryId
    );
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTests = tests.filter((test) => {
    if (!normalizedSearch) return true;

    return [
      test.title,
      test.titleAr,
      test.description,
      test.testType,
      test.type,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  const groupedTests = filteredTests.reduce((acc, test) => {
    const categoryId = test.type || 'OTHER';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(test);
    return acc;
  }, {});

  const categories = Object.keys(groupedTests)
    .sort((left, right) => {
      const leftIndex = categoryOrder.indexOf(left);
      const rightIndex = categoryOrder.indexOf(right);
      const normalizedLeftIndex = leftIndex === -1 ? categoryOrder.length : leftIndex;
      const normalizedRightIndex = rightIndex === -1 ? categoryOrder.length : rightIndex;

      return normalizedLeftIndex - normalizedRightIndex || left.localeCompare(right);
    })
    .map((categoryId) => ({
      id: categoryId,
      title: categoryMeta[categoryId]?.title || categoryId,
      icon: categoryMeta[categoryId]?.icon || BookOpen,
      color: categoryMeta[categoryId]?.color || categoryMeta.OTHER.color,
      description:
        categoryMeta[categoryId]?.description || categoryMeta.OTHER.description,
      count: groupedTests[categoryId]?.length || 0,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المقاييس والاختبارات</h1>
          <p className="mt-1 text-gray-500">
            اختبارات التقييم المتاحة حالياً، مصنفة تلقائياً حسب النوع القادم من النظام.
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ابحث في الاختبارات..."
            className="input w-full pr-10 pl-4 md:w-72"
          />
        </div>
      </div>

      {testsLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          جاري تحميل الاختبارات...
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">لا توجد اختبارات مطابقة</h2>
          <p className="mt-2 text-sm text-gray-500">
            لم يتم العثور على اختبارات تطابق البحث الحالي.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`glass-card self-start rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
                activeCategory === category.id
                  ? 'border-primary-500 bg-primary-50/10 ring-1 ring-primary-500'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.color}`}
                >
                  <category.icon size={24} />
                </div>
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-transform duration-300 ${
                    activeCategory === category.id
                      ? 'rotate-[-90deg] bg-primary-100 text-primary-600'
                      : ''
                  }`}
                  aria-label={
                    activeCategory === category.id
                      ? 'Collapse category'
                      : 'Expand category'
                  }
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {category.count}
                </span>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-gray-500">
                {category.description}
              </p>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  activeCategory === category.id
                    ? 'mt-4 grid-rows-[1fr] border-t border-gray-100 pt-4 opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <BookOpen size={16} />
                    الاختبارات المتوفرة:
                  </h4>

                  <ul className="space-y-3">
                    {groupedTests[category.id]?.map((test) => (
                      <li
                        key={test.id}
                        className="group/item flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:border-primary-200"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {test.titleAr || test.title}
                          </p>
                          {test.titleAr && test.title && test.titleAr !== test.title ? (
                            <p className="mt-0.5 text-xs text-gray-500">{test.title}</p>
                          ) : null}
                          {test.description ? (
                            <p className="mt-1 text-xs text-gray-500">{test.description}</p>
                          ) : null}
                        </div>

                        {role === 'doctor' ? (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStartTest(test.id);
                            }}
                            className="rounded-lg bg-primary-600 p-2 text-white opacity-0 transition-all hover:scale-110 group-hover/item:opacity-100"
                            title="بدء الاختبار لطفل"
                          >
                            <Play size={14} fill="currentColor" />
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        title="اختر الطفل لبدء التقييم"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            يرجى اختيار الطفل الذي تود إجراء الاختبار له الآن.
          </p>

          <div className="custom-scrollbar grid max-h-[400px] grid-cols-1 gap-3 overflow-y-auto pr-2">
            {myChildren?.length > 0 ? (
              myChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => selectChildAndStart(child.id)}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-right transition-all hover:border-primary-500 hover:bg-primary-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white transition-colors group-hover:border-primary-200">
                    <User className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{child.name}</p>
                    <p className="text-xs text-gray-500">
                      ولي الأمر: {child.user?.fullName}
                    </p>
                  </div>
                  <ChevronLeft size={20} className="text-gray-300 group-hover:text-primary-600" />
                </button>
              ))
            ) : (
              <div className="py-8 text-center">
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
