import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Search, User } from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/common/Modal';
import { doctorAssessments } from '../../api/doctor';
import { useAuthStore } from '../../store/authStore';

const Scales = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المقاييس والاختبارات</h1>
          <p className="mt-1 text-gray-500">
            جميع اختبارات التقييم المتاحة معروضة هنا كقائمة مباشرة لتسهيل الوصول إليها.
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
      ) : filteredTests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">لا توجد اختبارات مطابقة</h2>
          <p className="mt-2 text-sm text-gray-500">
            لم يتم العثور على اختبارات تطابق البحث الحالي.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <article
              key={test.id}
              className="glass-card flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {test.titleAr || test.title}
                </h2>

                {test.titleAr && test.title && test.titleAr !== test.title ? (
                  <p className="mt-1 text-sm text-gray-500">{test.title}</p>
                ) : null}

                {test.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-gray-500">
                    {test.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-gray-400">
                    لا يوجد وصف متاح لهذا الاختبار.
                  </p>
                )}

                {test.testType ? (
                  <div className="mt-4">
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {test.testType.replaceAll('_', ' ')}
                    </span>
                  </div>
                ) : null}
              </div>

              {role === 'doctor' ? (
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleStartTest(test.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                    title="بدء الاختبار لطفل"
                  >
                    <Play size={14} fill="currentColor" />
                    بدء الاختبار
                  </button>
                </div>
              ) : null}
            </article>
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
                  <ChevronLeft
                    size={20}
                    className="text-gray-300 group-hover:text-primary-600"
                  />
                </button>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  لا يوجد أطفال مسجلين لديك لإجراء الاختبار
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Scales;
