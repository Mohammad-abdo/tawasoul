import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorSupport } from '../../api/doctor';

const DoctorSupportThread = () => {
  const { ticketId } = useParams();
  const [message, setMessage] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctor-support-ticket', ticketId],
    queryFn: async () => {
      const response = await doctorSupport.getTicketById(ticketId);
      return response.data.data;
    },
    enabled: Boolean(ticketId),
    refetchInterval: 4000,
  });

  const replyMutation = useMutation({
    mutationFn: (payload) => doctorSupport.addReply(ticketId, payload),
    onSuccess: async () => {
      setMessage('');
      await refetch();
    },
    onError: () => {
      toast.error('فشل إرسال الرسالة');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700">
        تعذر تحميل محادثة الدعم.
      </div>
    );
  }

  const allMessages = [
    {
      id: `${data.id}-root`,
      senderRole: 'DOCTOR',
      message: data.message,
      createdAt: data.createdAt,
    },
    ...(data.replies || []).map((reply) => ({
      id: reply.id,
      senderRole: reply.adminId ? 'ADMIN' : 'DOCTOR',
      message: reply.message,
      createdAt: reply.createdAt,
      adminName: reply.admin?.name,
    })),
  ];

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    replyMutation.mutate({ message: trimmed });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/doctor/support" className="rounded-xl p-2 transition-colors hover:bg-gray-100">
          <ChevronRight size={22} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.subject}</h1>
          <p className="text-xs text-gray-500">الحالة: {data.status}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-4">
        <div className="h-[520px] space-y-3 overflow-y-auto p-2">
          {allMessages.map((item) => {
            const isDoctor = item.senderRole === 'DOCTOR';
            return (
              <div key={item.id} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isDoctor ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isDoctor && item.adminName ? (
                    <p className="mb-1 text-[11px] font-bold text-gray-700">{item.adminName}</p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{item.message}</p>
                  <p className={`mt-1 text-[10px] ${isDoctor ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(item.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="اكتب رسالة لفريق الإدارة..."
            className="input flex-1"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={replyMutation.isPending}
            className="btn-primary flex items-center gap-2 px-4"
          >
            <Send size={16} />
            {replyMutation.isPending ? '...' : 'إرسال'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSupportThread;
