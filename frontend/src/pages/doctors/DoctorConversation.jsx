import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { doctorMessages } from '../../api/doctor';
import { ChevronRight, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorConversation = () => {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const listRef = useRef(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['doctor-messages-conversation', userId],
    queryFn: async () => {
      const res = await doctorMessages.getConversationMessages(userId, { page: 1, limit: 100 });
      return res.data.data;
    },
    enabled: !!userId,
  });

  const messages = data?.messages || [];
  const ordered = useMemo(() => [...messages].reverse(), [messages]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!text) throw new Error('اكتب رسالة أولاً');
      await doctorMessages.sendMessageToUser({ userId, content: text, messageType: 'TEXT' });
    },
    onSuccess: async () => {
      setContent('');
      await queryClient.invalidateQueries({ queryKey: ['doctor-messages-conversation', userId] });
      await queryClient.invalidateQueries({ queryKey: ['doctor-messages-conversations'] });
    },
    onError: (e) => {
      toast.error(e?.message || 'فشل إرسال الرسالة');
    },
  });

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [ordered.length]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card rounded-2xl border border-gray-200 p-6">
        <p className="text-sm text-red-600">
          {error?.message || 'حدث خطأ أثناء تحميل الرسائل'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/doctor/messages" className="rounded-xl p-2 transition-colors hover:bg-gray-100">
          <ChevronRight size={22} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">المحادثة</h1>
          <p className="text-xs text-gray-500">User ID: {userId}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-4">
        <div ref={listRef} className="h-[520px] overflow-y-auto space-y-3 p-2">
          {ordered.length === 0 ? (
            <div className="py-10 text-center text-gray-500">لا توجد رسائل بعد</div>
          ) : (
            ordered.map((m) => {
              const isDoctor = m.senderRole === 'DOCTOR';
              return (
                <div key={m.id} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                      isDoctor ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content || '—'}</div>
                    <div className={`mt-1 text-[10px] ${isDoctor ? 'text-white/70' : 'text-gray-500'}`}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleString('ar-EG') : ''}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب رسالة..."
            className="input flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMutation.mutate();
              }
            }}
          />
          <button
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
            className="btn-primary flex items-center gap-2 px-4"
          >
            <Send size={16} />
            {sendMutation.isPending ? '...' : 'إرسال'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorConversation;

