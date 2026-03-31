import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { doctorMessages } from '../../api/doctor';
import { MessageSquare, Search } from 'lucide-react';

const DoctorMessages = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['doctor-messages-conversations'],
    queryFn: async () => {
      const res = await doctorMessages.getConversations({ page: 1, limit: 50 });
      return res.data.data;
    },
  });

  const conversations = data?.conversations || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = (c?.user?.fullName || c?.user?.username || '').toLowerCase();
      const msg = (c?.messages?.[0]?.content || '').toLowerCase();
      return name.includes(q) || msg.includes(q);
    });
  }, [conversations, search]);

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
          {error?.message || 'حدث خطأ أثناء تحميل المحادثات'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الرسائل</h1>
          <p className="text-sm text-gray-500">محادثاتك مع أولياء الأمور</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو محتوى آخر رسالة..."
            className="input pr-10"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-gray-200 p-4">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            لا توجد محادثات
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((c) => {
              const lastMessage = c?.messages?.[0];
              const title = c?.user?.fullName || c?.user?.username || 'مستخدم';
              const subtitle = lastMessage?.content || '—';
              return (
                <Link
                  key={c.id}
                  to={`/doctor/messages/${c.userId}`}
                  className="block p-4 hover:bg-gray-50 rounded-xl transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{title}</p>
                      <p className="text-sm text-gray-500 truncate">{subtitle}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {lastMessage?.createdAt ? new Date(lastMessage.createdAt).toLocaleString('ar-EG') : ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMessages;

