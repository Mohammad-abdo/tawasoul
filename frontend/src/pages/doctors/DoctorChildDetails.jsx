import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { doctorChildren } from '../../api/doctor';
import {
  Baby,
  ChevronRight,
  Activity,
  User,
  Phone,
  Mail,
  Calendar,
  ClipboardList,
  CheckCircle,
  FileText,
  Plus,
} from 'lucide-react';

const getAssessmentTest = (result) => result?.test || result?.question?.test || null;

const getAssessmentModality = (result) =>
  getAssessmentTest(result)?.category || getAssessmentTest(result)?.type || null;

const getAssessmentTitle = (result) =>
  getAssessmentTest(result)?.titleAr || getAssessmentTest(result)?.title || 'اختبار تقييم';

const getAssessmentScore = (result) => ({
  value: result?.totalScore ?? result?.scoreGiven ?? '-',
  max: result?.maxScore ?? '-',
});

const extractDiagnosisFromCaseDescription = (caseDescription) => {
  if (typeof caseDescription !== 'string') {
    return null;
  }

  const diagnosisMatch = caseDescription.match(/(?:المجموع|النتيجة):\s*[^()]+\(([^)]+)\)/);
  return diagnosisMatch?.[1]?.trim() || null;
};

const deriveCarsDiagnosisFromScore = (score) => {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) return null;
  if (numericScore >= 15 && numericScore < 30) return 'ليس توحد (طبيعي)';
  if (numericScore >= 30 && numericScore <= 36.5) return 'توحد بسيط إلى متوسط';
  if (numericScore >= 37 && numericScore <= 60) return 'توحد شديد';
  return null;
};

const deriveRatioDiagnosis = (testType, score, maxScore) => {
  const numericScore = Number(score);
  const numericMax = Number(maxScore);

  if (Number.isNaN(numericScore) || Number.isNaN(numericMax) || numericMax <= 0) {
    return null;
  }

  const ratio = numericScore / numericMax;
  const isStrong = ratio >= 0.75;
  const isMedium = ratio >= 0.5;

  switch (testType) {
    case 'ANALOGY':
      if (isStrong) return 'أداء جيد في مهارات التناظر والتصنيف';
      if (isMedium) return 'صعوبات متوسطة في مهارات التناظر والتصنيف';
      return 'صعوبات واضحة في مهارات التناظر والتصنيف';

    case 'VISUAL_MEMORY':
      if (isStrong) return 'ذاكرة بصرية جيدة';
      if (isMedium) return 'ذاكرة بصرية متوسطة وتحتاج إلى تنمية';
      return 'ضعف في الذاكرة البصرية';

    case 'AUDITORY_MEMORY':
      if (isStrong) return 'ذاكرة سمعية جيدة';
      if (isMedium) return 'ذاكرة سمعية متوسطة وتحتاج إلى دعم';
      return 'ضعف في الذاكرة السمعية';

    case 'VERBAL_NONSENSE':
      if (isStrong) return 'أداء جيد في النطق والتمييز اللفظي';
      if (isMedium) return 'صعوبات متوسطة في النطق والتمييز اللفظي';
      return 'صعوبات واضحة في النطق والتمييز اللفظي';

    case 'IMAGE_SEQUENCE_ORDER':
      if (isStrong) return 'قدرة جيدة على ترتيب التسلسل البصري';
      if (isMedium) return 'قدرة متوسطة على ترتيب التسلسل البصري';
      return 'ضعف في ترتيب التسلسل البصري';

    case 'HELP':
      if (isStrong) return 'المهارات النمائية ضمن المستوى المتوقع';
      if (isMedium) return 'المهارات النمائية تحتاج إلى دعم وتدريب';
      return 'يوجد تأخر نمائي يستدعي تنمية مهارات مكثفة';

    default:
      return null;
  }
};

const getAssessmentDiagnosis = ({ result, caseDescription, isLatestResult }) => {
  const testType = getAssessmentTest(result)?.testType;
  const score = result?.totalScore ?? result?.scoreGiven;
  const maxScore = result?.maxScore;
  const diagnosisFromCase = isLatestResult
    ? extractDiagnosisFromCaseDescription(caseDescription)
    : null;

  if (testType === 'CARS') {
    return diagnosisFromCase || deriveCarsDiagnosisFromScore(score);
  }

  return deriveRatioDiagnosis(testType, score, maxScore) || diagnosisFromCase;
};

const getModalityLabel = (modality) => {
  if (modality === 'AUDITORY') return 'تقييم سمعي';
  if (modality === 'VISUAL') return 'تقييم بصري';
  return 'تقييم';
};

const DoctorChildDetails = () => {
  const { id } = useParams();

  const { data: child, isLoading } = useQuery({
    queryKey: ['doctor-child-details', id],
    queryFn: async () => {
      const response = await doctorChildren.getById(id);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/doctor/children" className="rounded-xl p-2 transition-colors hover:bg-gray-100">
          <ChevronRight size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل حالة الطفل</h1>
          <p className="text-sm text-gray-500">متابعة سجل الاختبارات والجلسات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card rounded-2xl border border-gray-200 p-6">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-primary-200 bg-primary-50">
                {child.profileImage ? (
                  <img src={child.profileImage} alt={child.name} className="h-full w-full object-cover" />
                ) : (
                  <Baby className="text-primary-600" size={48} />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{child.name}</h2>
              <span className="mt-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                {child.status || 'غير محدد'}
              </span>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h3 className="mb-2 font-bold text-gray-900">بيانات التواصل</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User size={18} className="text-primary-500" />
                <span>ولي الأمر: {child.user?.fullName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={18} className="text-primary-500" />
                <span>{child.user?.phone}</span>
              </div>
              {child.user?.email ? (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={18} className="text-primary-500" />
                  <span>{child.user?.email}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-gray-200 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <FileText size={18} className="text-primary-500" />
              ملاحظات الحالة
            </h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-gray-500">تاريخ الحالة</p>
                <p className="text-sm text-gray-800">{child.caseHistory || 'لا يوجد بيانات'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500">وصف الحالة</p>
                <p className="text-sm text-gray-800">{child.caseDescription || 'لا يوجد بيانات'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500">ملاحظات سلوكية</p>
                <p className="text-sm text-gray-800">{child.behavioralNotes || 'لا يوجد ملاحظات'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="glass-card rounded-2xl border border-gray-200 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Activity size={20} className="text-primary-500" />
                نتائج التقييمات والاختبارات
              </h3>
              <Link
                to="/scales"
                className="btn-primary flex items-center gap-2 px-4 py-1.5 text-xs shadow-lg"
              >
                <Plus size={14} /> بدء تقييم جديد
              </Link>
            </div>

            <div className="space-y-4">
              {child.assessmentResults?.length > 0 ? (
                child.assessmentResults.map((result, index) => {
                  const modality = getAssessmentModality(result);
                  const score = getAssessmentScore(result);
                  const diagnosis = getAssessmentDiagnosis({
                    result,
                    caseDescription: child.caseDescription,
                    isLatestResult: index === 0,
                  });

                  return (
                    <div
                      key={result.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-primary-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white">
                            {modality === 'AUDITORY' ? (
                              <Activity className="text-blue-500" size={24} />
                            ) : (
                              <Activity className="text-purple-500" size={24} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{getAssessmentTitle(result)}</h4>
                            <p className="mt-1 text-xs text-gray-500">
                              {getModalityLabel(modality)} • {new Date(result.timestamp).toLocaleDateString('ar-EG')}
                            </p>
                            {diagnosis ? (
                              <p className="mt-2 text-xs font-semibold text-primary-700">
                                التشخيص: {diagnosis}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold text-primary-600">
                            {score.value}/{score.max}
                          </div>
                          <p className="text-[10px] text-gray-400">إجمالي النتيجة</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <ClipboardList className="mx-auto mb-2 text-gray-300" size={48} />
                  <p className="text-gray-500">لم يتم إجراء أي اختبارات تقييمية بعد</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-gray-200 p-6">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Calendar size={20} className="text-primary-500" />
              الجلسات السابقة معك
            </h3>
            <div className="space-y-3">
              {child.bookings?.length > 0 ? (
                child.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-gray-200 bg-white p-2">
                        <CheckCircle className="text-green-500" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {booking.sessionType === 'VIDEO' ? 'جلسة فيديو' : 'جلسة صوتية'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.scheduledAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      {booking.status === 'COMPLETED' ? 'مكتملة' : booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">لا يوجد جلسات سابقة مسجلة</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorChildDetails;
