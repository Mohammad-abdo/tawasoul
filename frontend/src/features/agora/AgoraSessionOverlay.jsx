import { useEffect, useRef } from 'react';
import {
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import { useAgoraSession } from './useAgoraSession';

const playTrack = (track, element) => {
  if (!track || !element) return;
  element.innerHTML = '';
  track.play(element);
};

const placeholderTextByState = {
  waiting: 'Waiting for the other participant...',
  reconnecting: 'Connection lost, waiting to reconnect...',
};

const AgoraSessionOverlay = ({
  isOpen,
  booking,
  fetchToken,
  onClose,
  onEndCall,
  allowScreenShare = false,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    errorMessage,
    isJoining,
    isJoined,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    localVideoTrack,
    remoteVideoTrack,
    remoteState,
    leave,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
  } = useAgoraSession({
    enabled: isOpen,
    fetchToken,
    allowScreenShare,
  });

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      playTrack(localVideoTrack, localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteVideoTrack && remoteVideoRef.current) {
      playTrack(remoteVideoTrack, remoteVideoRef.current);
    }
  }, [remoteVideoTrack]);

  if (!isOpen) {
    return null;
  }

  const handleClose = async () => {
    await leave();
    onClose();
  };

  const handleEndCall = async () => {
    await leave();
    await onEndCall?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-gray-950 text-white">
      <div className="absolute inset-0">
        <div className="relative h-full w-full overflow-hidden bg-black">
          {remoteVideoTrack ? (
            <div ref={remoteVideoRef} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-center">
              {isJoining ? (
                <Loader2 className="animate-spin text-primary-400" size={48} />
              ) : (
                <VideoOff className="text-slate-500" size={56} />
              )}
              <div>
                <p className="text-xl font-semibold">{placeholderTextByState[remoteState] || 'Joining session...'}</p>
                <p className="mt-2 text-sm text-slate-300">
                  Channel: {booking?.videoLink || booking?.id}
                </p>
              </div>
            </div>
          )}

          <div className="absolute right-6 top-6 flex items-center gap-3">
            {errorMessage ? (
              <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-lg">
                {errorMessage}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute bottom-28 right-6 h-44 w-72 overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl">
            {localVideoTrack && isCameraEnabled ? (
              <div ref={localVideoRef} className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-900">
                <VideoOff className="text-slate-500" size={32} />
                <p className="text-sm text-slate-300">
                  {isScreenSharing ? 'Screen sharing active' : 'Camera is off'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/60 px-5 py-4 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleMicrophone().catch(() => {})}
            disabled={!isJoined}
            className={`rounded-full p-4 transition ${isMicEnabled ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-50`}
          >
            {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            type="button"
            onClick={() => toggleCamera().catch(() => {})}
            disabled={!isJoined}
            className={`rounded-full p-4 transition ${isCameraEnabled ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-50`}
          >
            {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {allowScreenShare ? (
            <button
              type="button"
              onClick={() => toggleScreenShare().catch(() => {})}
              disabled={!isJoined}
              className={`rounded-full p-4 transition ${isScreenSharing ? 'bg-primary-600 hover:bg-primary-500' : 'bg-slate-800 hover:bg-slate-700'} disabled:opacity-50`}
            >
              <MonitorUp size={20} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => handleEndCall().catch(() => {})}
            className="rounded-full bg-red-600 p-4 transition hover:bg-red-500"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgoraSessionOverlay;
