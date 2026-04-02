import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Mic, Paperclip, Pause, Play, Send, Square, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorMessages } from '../../api/doctor';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ─── VoiceMessage Component ───────────────────────────────────────────────────
const VoiceMessage = ({ src, isOwn }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const setMeta = () => setDuration(audio.duration);
    const handleEnded = () => setPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setMeta);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setMeta);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const formatTime = (time) => {
    if (!time) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-2xl ${
        isOwn ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'
      }`}
    >
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full flex-shrink-0"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <div className="w-40 h-2 bg-white/40 rounded overflow-hidden">
        <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
      </div>

      <span className="text-xs tabular-nums">{formatTime(duration)}</span>
      <audio ref={audioRef} src={src} />
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const resolveMessageType = (message) => {
  if (message?.messageType && message.messageType !== 'TEXT') return message.messageType;
  if (message?.voiceUrl) return 'VOICE';
  if (message?.imageUrl) return 'IMAGE';
  if (message?.fileUrl) return 'FILE';
  return 'TEXT';
};

const renderMessageContent = (message, isDoctor) => {
  const messageType = resolveMessageType(message);
  const captionClass = isDoctor ? 'text-white/80' : 'text-gray-700';
  const metaClass = isDoctor ? 'text-white/70' : 'text-gray-500';

  if (messageType === 'IMAGE' && message.imageUrl) {
    return (
      <div className="space-y-2">
        <img src={message.imageUrl} alt="attachment" className="max-h-64 rounded-xl object-cover" />
        {message.content && (
          <p className={`whitespace-pre-wrap text-sm ${captionClass}`}>{message.content}</p>
        )}
        <div className={`text-[10px] ${metaClass}`}>
          {message.createdAt ? new Date(message.createdAt).toLocaleString('ar-EG') : ''}
        </div>
      </div>
    );
  }

  // ── VOICE: now uses the custom VoiceMessage component ──
  if (messageType === 'VOICE' && message.voiceUrl) {
    return (
      <div className="space-y-1">
        <VoiceMessage src={message.voiceUrl} isOwn={isDoctor} />
        {message.content && (
          <p className={`whitespace-pre-wrap text-sm ${captionClass}`}>{message.content}</p>
        )}
        <div className={`text-[10px] ${metaClass}`}>
          {message.createdAt ? new Date(message.createdAt).toLocaleString('ar-EG') : ''}
        </div>
      </div>
    );
  }

  if (messageType === 'FILE' && message.fileUrl) {
    return (
      <div className="space-y-2">
        
          href={message.fileUrl}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
            isDoctor
              ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
              : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
          }`}
        <a>
          <Paperclip size={14} />
          {message.fileName || 'تحميل الملف'}
        </a>
        {message.content && (
          <p className={`whitespace-pre-wrap text-sm ${captionClass}`}>{message.content}</p>
        )}
        <div className={`text-[10px] ${metaClass}`}>
          {message.createdAt ? new Date(message.createdAt).toLocaleString('ar-EG') : ''}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="whitespace-pre-wrap">{message.content || '—'}</div>
      <div className={`mt-1 text-[10px] ${metaClass}`}>
        {message.createdAt ? new Date(message.createdAt).toLocaleString('ar-EG') : ''}
      </div>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DoctorConversationEnhanced = () => {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const listRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['doctor-messages-conversation', userId],
    queryFn: async () => {
      const response = await doctorMessages.getConversationMessages(userId, { page: 1, limit: 100 });
      return response.data.data;
    },
    enabled: Boolean(userId),
  });

  const messages = data?.messages || [];
  const ordered = useMemo(() => [...messages].reverse(), [messages]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!text && !attachment) throw new Error('اكتب رسالة أو أرفق ملفاً');

      let uploadData = null;
      if (attachment) {
        const uploadResponse = await doctorMessages.uploadAttachment(attachment.file);
        uploadData = uploadResponse.data.data;
      }

      await doctorMessages.sendMessageToUser({
        userId,
        content: text || null,
        messageType: uploadData?.messageType || 'TEXT',
        imageUrl: uploadData?.imageUrl || null,
        fileUrl: uploadData?.fileUrl || null,
        fileName: uploadData?.fileName || null,
        voiceUrl: uploadData?.voiceUrl || null,
      });
    },
    onSuccess: async () => {
      setContent('');
      setAttachment(null);
      setAttachmentPreview(null);
      await queryClient.invalidateQueries({ queryKey: ['doctor-messages-conversation', userId] });
      await queryClient.invalidateQueries({ queryKey: ['doctor-messages-conversations'] });
    },
    onError: (e) => toast.error(e?.message || 'فشل إرسال الرسالة'),
  });

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [ordered.length]);

  useEffect(
    () => () => {
      if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    },
    [attachmentPreview]
  );

  const handleAttachmentPick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = IMAGE_TYPES.includes(file.type);
    const isFile = FILE_TYPES.includes(file.type);
    if (!isImage && !isFile) {
      toast.error('المرفقات المدعومة: JPG, PNG, PDF, DOC, DOCX');
      event.target.value = '';
      return;
    }

    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);

    const preview = isImage ? URL.createObjectURL(file) : null;
    setAttachment({ file, messageType: isImage ? 'IMAGE' : 'FILE', fileName: file.name });
    setAttachmentPreview(preview);
    event.target.value = '';
  };

  const clearAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('المتصفح لا يدعم تسجيل الصوت');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
        setAttachment({ file, messageType: 'VOICE', fileName: file.name });
        setAttachmentPreview(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error('تعذر بدء تسجيل الصوت');
    }
  };

  const stopVoiceRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

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
        <p className="text-sm text-red-600">{error?.message || 'حدث خطأ أثناء تحميل الرسائل'}</p>
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
            ordered.map((message) => {
              const isDoctor = message.senderRole === 'DOCTOR';
              return (
                <div key={message.id} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      isDoctor ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {renderMessageContent(message, isDoctor)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {attachment && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">معاينة قبل الإرسال</p>
              <button
                type="button"
                onClick={clearAttachment}
                className="rounded-lg p-1 text-gray-500 hover:bg-white hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {attachment.messageType === 'IMAGE' && attachmentPreview && (
              <img src={attachmentPreview} alt="preview" className="max-h-40 rounded-lg object-cover" />
            )}

            {/* ── Voice preview uses VoiceMessage too ── */}
            {attachment.messageType === 'VOICE' && attachmentPreview && (
              <VoiceMessage src={attachmentPreview} isOwn={false} />
            )}

            {attachment.messageType === 'FILE' && (
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700">
                <Paperclip size={14} />
                {attachment.fileName}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:border-primary-200 hover:text-primary-600">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,application/pdf,.doc,.docx"
              onChange={handleAttachmentPick}
              disabled={sendMutation.isPending || isRecording}
            />
            <Paperclip size={16} />
          </label>

          <button
            type="button"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            disabled={sendMutation.isPending}
            className={`rounded-xl border p-2 ${
              isRecording
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-600'
            }`}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
          </button>

          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="اكتب رسالة..."
            className="input flex-1"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMutation.mutate();
              }
            }}
          />

          <button
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending || isRecording}
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

export default DoctorConversationEnhanced;