import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, FileText, Loader, Download } from 'lucide-react';
import { doctorVbMapp, doctorAuth } from '../../../api/doctor';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import MonthlyReportPDF from './MonthlyReportPDF';

const MONTHS = [
  { value: 1, label: 'يناير' },
  { value: 2, label: 'فبراير' },
  { value: 3, label: 'مارس' },
  { value: 4, label: 'أبريل' },
  { value: 5, label: 'مايو' },
  { value: 6, label: 'يونيو' },
  { value: 7, label: 'يوليو' },
  { value: 8, label: 'أغسطس' },
  { value: 9, label: 'سبتمبر' },
  { value: 10, label: 'أكتوبر' },
  { value: 11, label: 'نوفمبر' },
  { value: 12, label: 'ديسمبر' }
];

const MonthlyReportModal = ({ childId, isOpen, onClose }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  const reportRef = useRef(null);

  const { data: authData } = useQuery({
    queryKey: ['doctor-me'],
    queryFn: async () => {
      const response = await doctorAuth.getMe();
      return response.data.data;
    }
  });

  const handleFetchData = async () => {
    setIsDataLoading(true);
    setReportData(null);
    try {
      const response = await doctorVbMapp.getMonthlyReport(childId, selectedMonth, selectedYear);
      const data = response.data.data;
      
      if (data.sessions.length === 0) {
        toast.error('لا توجد جلسات تقييمية مجدولة في هذا الشهر');
      } else {
        setReportData(data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب بينات التقرير');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // A4 format dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const safeName = reportData.child?.name?.replace(/\s+/g, '-') || 'طفل';
      const fileName = `تقرير-${safeName}-${MONTHS[selectedMonth-1].label}-${selectedYear}.pdf`;
      
      pdf.save(fileName);
      toast.success('تم تحميل التقرير بنجاح!');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء معالجة الصورة وتحميل الـ PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className=" fixed inset-10 z-50 flex flex-col h-screen bg-black/80 backdrop-blur-sm dir-rtl">
      {/* TOP BAR */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-md shrink-0 z-10 text-gray-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
            <FileText size={20} />
          </div>
          <h3 className="text-xl font-bold">
            تقرير شهري - {reportData?.child?.name || 'منتظر'}
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {reportData ? (
            <>
              <span className="font-bold text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                ({reportData.sessions.length} جلسات)
              </span>
              <button
                onClick={() => setReportData(null)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
                disabled={isGeneratingPDF}
              >
                تعديل 
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-colors disabled:opacity-70"
              >
                {isGeneratingPDF ? (
                  <><Loader size={18} className="animate-spin" /> جاري التحميل...</>
                ) : (
                  <><Download size={18} /> تحميل PDF</>
                )}
              </button>
            </>
          ) : null}
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors disabled:opacity-50" disabled={isGeneratingPDF}>
            إغلاق <X size={20} />
          </button>
        </div>
      </div>

      {/* PREVIEW AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        {!reportData ? (
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100 h-fit mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">اختيار فترة التقرير</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الشهر</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-primary-500 focus:ring-primary-500 form-select py-3 px-4"
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">السنة</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:border-primary-500 focus:ring-primary-500 py-3 px-4 text-left dir-ltr"
                  min="2020"
                  max="2100"
                />
              </div>
              <button
                onClick={handleFetchData}
                disabled={isDataLoading}
                className="w-full flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors disabled:opacity-70 mt-4"
              >
                {isDataLoading ? (
                  <><Loader size={18} className="animate-spin" /> جاري تجهيز البيانات...</>
                ) : (
                  'فحص ومعاينة'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-16">
            <div className="shadow-2xl bg-white" style={{ transform: 'scale(0.75)', transformOrigin: 'top center', width: '794px', height: 'max-content' }}>
              <MonthlyReportPDF ref={reportRef} reportData={reportData} doctorName={authData?.name} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportModal;
