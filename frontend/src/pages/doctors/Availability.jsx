import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doctorAvailability } from '../../api/doctor';
import { 
  Calendar, 
  Clock, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الأثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

const Availability = () => {
  const [availability, setAvailability] = useState([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['doctor-availability'],
    queryFn: async () => {
      const response = await doctorAvailability.get();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (data) {
      // Initialize with all days, merging with existing data
      const initialAvailability = DAYS.map(day => {
        const existing = data.find(a => a.dayOfWeek === day.value);
        return {
          dayOfWeek: day.value,
          label: day.label,
          isActive: existing ? existing.isActive : false,
          timeSlots: existing ? (typeof existing.timeSlots === 'string' ? JSON.parse(existing.timeSlots) : existing.timeSlots) : []
        };
      });
      setAvailability(initialAvailability);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: doctorAvailability.update,
    onSuccess: () => {
      toast.success('تم تحديث مواعيد العمل بنجاح');
      refetch();
    },
    onError: () => {
      toast.error('فشل تحديث مواعيد العمل');
    }
  });

  const toggleDay = (dayIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].isActive = !newAvailability[dayIndex].isActive;
    if (newAvailability[dayIndex].isActive && newAvailability[dayIndex].timeSlots.length === 0) {
      newAvailability[dayIndex].timeSlots = ['09:00', '17:00'];
    }
    setAvailability(newAvailability);
  };

  const addSlot = (dayIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].timeSlots.push('09:00');
    setAvailability(newAvailability);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].timeSlots.splice(slotIndex, 1);
    setAvailability(newAvailability);
  };

  const updateSlot = (dayIndex, slotIndex, value) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].timeSlots[slotIndex] = value;
    setAvailability(newAvailability);
  };

  const handleSave = () => {
    const dataToSave = availability.map(a => ({
      dayOfWeek: a.dayOfWeek,
      isActive: a.isActive,
      timeSlots: JSON.stringify(a.timeSlots)
    }));
    updateMutation.mutate(dataToSave);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مواعيد العمل</h1>
          <p className="text-gray-500">قم بتحديد الأيام والساعات المتاحة لاستقبال الحجوزات</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {availability.map((day, dayIndex) => (
          <div 
            key={day.dayOfWeek} 
            className={`glass-card rounded-2xl p-6 border transition-all duration-300 ${
              day.isActive ? 'border-primary-200 bg-white shadow-md' : 'border-gray-100 bg-gray-50 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleDay(dayIndex)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    day.isActive ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    day.isActive ? 'left-1' : 'left-7'
                  }`}></div>
                </button>
                <h3 className={`text-lg font-bold ${day.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  {day.label}
                </h3>
              </div>
              
              {day.isActive && (
                <button
                  onClick={() => addSlot(dayIndex)}
                  className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <Plus size={16} />
                  إضافة فترة
                </button>
              )}
            </div>

            {day.isActive ? (
              <div className="space-y-3">
                {day.timeSlots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {day.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                        <Clock size={16} className="text-gray-400" />
                        <input
                          type="time"
                          value={slot}
                          onChange={(e) => updateSlot(dayIndex, slotIndex, e.target.value)}
                          className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 flex-1"
                        />
                        <button
                          onClick={() => removeSlot(dayIndex, slotIndex)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">لا توجد فترات زمنية محددة. سيتم اعتبارك غير متاح طوال اليوم.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">مغلق</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Availability;
