import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  MessageSquare,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorMessages } from '../../api/doctor';
import {
  getModalityLabel,
  getTestDisplayTitle,
} from '../assessments/assessmentUiUtils';

const SessionSidePanel = ({ booking, availableTests = [] }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tests');
  const [chatMessage, setChatMessage] = useState('');
  const chatListRef = useRef(null);

  const conversationUserId = booking?.userId || booking?.user?.id || null;
  const childId = booking?.childId;
  const sessionId = booking?.id;

  const { data: conversationData } = useQuery({
    queryKey: ['agora-side-chat', sessionId, conversationUserId],
    queryFn: async () => {
      const response = await doctorMessages.getConversationMessages(conversationUserId, { page: 1, limit: 100 });
      return response.data.data;
    },
    enabled: Boolean(conversationUserId && activeTab === 'chat'),
    refetchInterval: activeTab === 'chat' ? 5000 : false,
  });

  const sendChatMessageMutation = useMutation({
    mutationFn: async () => {
      const content = chatMessage.trim();
      if (!content || !conversationUserId) return;

      await doctorMessages.sendMessageToUser({
        userId: conversationUserId,
        content,
        messageType: 'TEXT',
      });
    },
    onSuccess: async () => {
      setChatMessage('');
      await queryClient.invalidateQueries({
        queryKey: ['agora-side-chat', sessionId, conversationUserId],
      });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error?.message || 'فشل إرسال الرسالة');
    },
  });

  useEffect(() => {
    if (!chatListRef.current) return;
    chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
  }, [conversationData?.messages?.length, activeTab]);

  const handleOpenAssessment = (test) => {
    if (!test?.id || !childId) {
      toast.error('تعذر فتح الاختبار لعدم اكتمال بيانات الطفل');
      return;
    }

    const params = new URLSearchParams({
      testId: String(test.id),
      bookingId: String(sessionId || ''),
      childId: String(childId),
    });
    const targetUrl = `/doctor/assessment/${test.id}/${childId}?${params.toString()}`;
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="flex h-full flex-col text-[13px]">
      <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${
            activeTab === 'tests' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-white'
          }`}
        >
          الاختبارات
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${
            activeTab === 'chat' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-white'
          }`}
        >
          الدردشة
        </button>
      </div>

      {activeTab === 'tests' ? (
        <div className="overflow-y-auto p-3">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
            <ClipboardList className="text-primary-600" size={18} />
            اختر اختبار للتقييم
          </h3>

          {availableTests?.length > 0 ? (
            <div className="space-y-2">
              {availableTests.map((test) => (
                <div
                  key={test.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2"
                >
                  <h4 className="text-[13px] font-bold text-gray-900">{getTestDisplayTitle(test)}</h4>
                  <p className="mt-1 text-xs text-gray-500">{getModalityLabel(test.type)}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenAssessment(test)}
                    className="mt-2 w-full rounded-md bg-primary-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    افتح الاختبار
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
              لا توجد اختبارات متاحة حالياً.
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div ref={chatListRef} className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-2">
            {(conversationData?.messages || []).length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-xs text-gray-500">
                <MessageSquare size={18} className="mb-1 text-gray-400" />
                لا توجد رسائل بعد
              </div>
            ) : (
              [...(conversationData?.messages || [])].reverse().map((message) => {
                const isDoctor = message.senderRole === 'DOCTOR';
                return (
                  <div key={message.id} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[92%] rounded-lg px-2 py-1 text-xs leading-tight ${
                        isDoctor ? 'bg-primary-600 text-white' : 'border border-gray-200 bg-white text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content || '...'}</p>
                      <p className={`mt-1 text-[10px] ${isDoctor ? 'text-white/75' : 'text-gray-500'}`}>
                        {new Date(message.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 bg-white p-2">
            <div className="flex items-end gap-1.5">
              <textarea
                value={chatMessage}
                onChange={(event) => setChatMessage(event.target.value)}
                rows={2}
                placeholder="اكتب رسالة..."
                className="w-full resize-none rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendChatMessageMutation.mutate();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => sendChatMessageMutation.mutate()}
                disabled={sendChatMessageMutation.isPending || !chatMessage.trim()}
                className="rounded-md bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSidePanel;
