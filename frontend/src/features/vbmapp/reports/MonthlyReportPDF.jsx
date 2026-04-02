import React from 'react';

export const MonthlyReportPDF = React.forwardRef(({ reportData, doctorName }, ref) => {
  const { child, period, sessions, skillAreaProgress, totalScorePerSession, achievedMilestones, activeIepGoals } = reportData;

  const monthsArabic = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const periodText = `${monthsArabic[period.month - 1]} ${period.year}`;
  
  const dateObj = new Date();
  const generationDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
  
  const maxScore = 170; // VB-MAPP max
  
  return (
    <div ref={ref} className="bg-white text-gray-900 w-[794px] mx-auto p-10 font-sans" style={{ minHeight: '1123px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex border-b-2 border-blue-600 pb-5 mb-8 justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تقرير الجلسات الشهري - VB-MAPP</h1>
          <p className="text-sm text-gray-600 mt-1">إشراف الأخصائي: {doctorName || 'غير محدد'}</p>
        </div>
        <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-lg flex flex-col justify-center items-center text-gray-500 text-xs">
          <span className="text-blue-600 font-bold text-lg ">تواصل</span>

        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
        <div>
          <p className="text-xs text-gray-500 mb-1">اسم الطفل</p>
          <p className="font-bold">{child.name || 'غير محدد'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">عمر الطفل</p>
          <p className="font-bold">{child.age ? `${child.age} سنوات` : 'غير محدد'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">المدة الزمنية</p>
          <p className="font-bold">{periodText}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">إجمالي الجلسات</p>
          <p className="font-bold">{sessions.length} جلسة</p>
        </div>
      </div>

      <div className="space-y-10 flex-grow">
        {/* Chart Section */}
        <section>
          <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-6">مؤشر التقدم الإجمالي (من 170 نقطة)</h2>
          {totalScorePerSession.length > 0 ? (
            <div className="flex justify-around items-end h-40 border-b border-gray-300 pb-4">
              {totalScorePerSession.map((s) => {
                const percentage = Math.min((s.totalScore / maxScore) * 100, 100);
                return (
                  <div key={s.sessionId} className="flex flex-col items-center justify-end h-full w-16">
                    <span className="text-sm font-bold mb-2">{s.totalScore}</span>
                    <div className="w-12 h-28 bg-gray-100 flex flex-col justify-end rounded-t-md overflow-hidden relative">
                      <div className="w-full bg-blue-500" style={{ height: `${percentage}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-700 mt-2 font-bold">الجلسة {s.sessionNumber}</span>
                    <span className="text-[10px] text-gray-500">{new Date(s.date).toISOString().split('T')[0]}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد بيانات جلسات لرسم المؤشر</p>
          )}
        </section>

        {/* Comparison Table */}
        {sessions.length > 1 && (
          <section>
            <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">مقارنة تطور المهارات التراكمي خلال الشهر</h2>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3 font-bold w-1/3">المهارة (الحد الأقصى)</th>
                    {sessions.map((s, idx) => (
                      <th key={`th-${s.id}`} className="p-3 font-bold text-center">الجلسة {idx + 1}</th>
                    ))}
                    <th className="p-3 font-bold text-center">التطور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {skillAreaProgress.map((area, idx) => (
                    <tr key={area.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">
                        {area.nameAr} <span className="text-gray-500 text-xs">({area.max})</span>
                      </td>
                      {sessions.map(s => {
                        const sData = area.sessionScores.find(sc => sc.sessionId === s.id);
                        return (
                          <td key={`td-${area.code}-${s.id}`} className="p-3 text-center text-gray-700">
                            {sData ? sData.score : '-'}
                          </td>
                        );
                      })}
                      <td className={`p-3 text-center font-bold ${area.improvement > 0 ? 'text-green-600' : area.improvement < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {area.improvement > 0 ? `+${area.improvement}` : area.improvement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Highlights & Goals */}
        <section className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">مهارات مكتسبة (تحقق كامل)</h2>
            {achievedMilestones.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {achievedMilestones.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>
                      <strong className="text-gray-900">{m.areaName} ({m.milestoneNumber}):</strong> {m.descriptionAr}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">لم يتم تسجيل تحقيق كامل لمهارات جديدة في هذا الشهر.</p>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">الأهداف التربوية (IEP) النشطة</h2>
            {activeIepGoals.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {activeIepGoals.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">-</span>
                    <span>
                      {g.goalDescription}
                      {g.milestone && <span className="text-gray-500 text-xs mr-2">[مرتبط بـ {g.milestone}]</span>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">لا توجد أهداف نشطة مسجلة لهذا الطفل.</p>
            )}
          </div>
        </section>

        {/* Notes Blank Area */}
        <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-bold mb-6">ملاحظات الأخصائي</h2>
            <div className="space-y-8">
                <div className="border-b border-gray-300 w-full h-1"></div>
                <div className="border-b border-gray-300 w-full h-1"></div>
                <div className="border-b border-gray-300 w-full h-1"></div>
            </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400 pb-2">
        <span>الطفل: {child.name || 'غير محدد'}</span>
        <span>تم إنشاء التقرير آلياً - نظام التواصل</span>
        <span>التاريخ: {generationDate}</span>
      </div>
    </div>
  );
});

MonthlyReportPDF.displayName = 'MonthlyReportPDF';
export default MonthlyReportPDF;
