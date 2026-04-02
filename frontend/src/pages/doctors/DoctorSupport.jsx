import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Headphones, MessageSquarePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorSupport } from '../../api/doctor';

const DoctorSupport = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['doctor-support-tickets'],
    queryFn: async () => {
      const response = await doctorSupport.getTickets({ page: 1, limit: 50 });
      return response.data.data;
    },
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: doctorSupport.createTicket,
    onSuccess: async () => {
      setSubject('');
      setMessage('');
      setPriority('MEDIUM');
      setShowCreate(false);
      toast.success('تم فتح محادثة دعم جديدة');
      await refetch();
    },
    onError: () => {
      toast.error('فشل فتح محادثة الدعم');
    },
  });

  const tickets = data?.tickets || [];

  const handleCreateTicket = (event) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('أدخل العنوان والرسالة');
      return;
    }

    createMutation.mutate({
      subject: subject.trim(),
      message: message.trim(),
      priority,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">دعم الإدارة</h1>
          <p className="text-sm text-gray-500">محادثاتك المباشرة مع فريق الإدارة</p>
        </div>
        <button
          onClick={() => setShowCreate((previous) => !previous)}
          className="btn-primary flex items-center gap-2 px-4"
        >
          <MessageSquarePlus size={16} />
          محادثة جديدة
        </button>
      </div>

      {showCreate ? (
        <form
          onSubmit={handleCreateTicket}
          className="glass-card rounded-2xl border border-gray-200 p-4 space-y-3"
        >
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="input"
            placeholder="عنوان المشكلة"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="input min-h-[110px]"
            placeholder="اكتب رسالتك..."
          />
          <div className="flex items-center justify-between">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="input max-w-[220px]"
            >
              <option value="LOW">أولوية منخفضة</option>
              <option value="MEDIUM">أولوية متوسطة</option>
              <option value="HIGH">أولوية عالية</option>
              <option value="URGENT">أولوية عاجلة</option>
            </select>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'جارٍ الفتح...' : 'فتح المحادثة'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="glass-card rounded-2xl border border-gray-200 p-4">
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="py-12 text-center text-gray-500">لا توجد محادثات دعم حتى الآن.</div>
          ) : (
            tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/doctor/support/${ticket.id}`}
                className="block rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-primary-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary-100 p-2 text-primary-700">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.updatedAt || ticket.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-primary-700">{ticket.status}</p>
                    <p className="text-[11px] text-gray-500">{ticket.priority}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSupport;
