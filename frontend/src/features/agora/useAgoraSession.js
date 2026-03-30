import { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const getReadableAgoraError = (error, fallbackMessage) => {
  const serverMessage = error?.response?.data?.error?.message;
  if (serverMessage) {
    return serverMessage;
  }

  const message = String(error?.message || error || '').toLowerCase();

  if (message.includes('permission') || message.includes('notallowederror') || message.includes('permission denied')) {
    return 'Camera or microphone permission was denied. Please allow access and try again.';
  }

  if (message.includes('network')) {
    return 'Network connection failed while preparing the call.';
  }

  return fallbackMessage;
};

export const useAgoraSession = ({ enabled, fetchToken, allowScreenShare = false }) => {
  const clientRef = useRef(null);
  const audioTrackRef = useRef(null);
  const cameraTrackRef = useRef(null);
  const screenTrackRef = useRef(null);
  const fetchTokenRef = useRef(fetchToken);
  const hasRemoteJoinedRef = useRef(false);

  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
  const [remoteState, setRemoteState] = useState('waiting');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    fetchTokenRef.current = fetchToken;
  }, [fetchToken]);

  const ensureClient = () => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }

    return clientRef.current;
  };

  const stopTrack = async (track) => {
    if (!track) return;

    try {
      track.stop();
    } catch (error) {
      // Ignore stop errors during cleanup.
    }

    try {
      track.close();
    } catch (error) {
      // Ignore close errors during cleanup.
    }
  };

  const leave = async () => {
    const client = clientRef.current;

    try {
      if (screenTrackRef.current && client) {
        await client.unpublish(screenTrackRef.current).catch(() => {});
      }

      const publishableTracks = [audioTrackRef.current, cameraTrackRef.current].filter(Boolean);
      if (publishableTracks.length && client) {
        await client.unpublish(publishableTracks).catch(() => {});
      }
    } catch (error) {
      // Ignore unpublish errors during cleanup.
    }

    await stopTrack(screenTrackRef.current);
    await stopTrack(cameraTrackRef.current);
    await stopTrack(audioTrackRef.current);

    screenTrackRef.current = null;
    cameraTrackRef.current = null;
    audioTrackRef.current = null;
    hasRemoteJoinedRef.current = false;

    if (client) {
      try {
        await client.leave();
      } catch (error) {
        // Ignore leave errors during cleanup.
      }
    }

    setLocalVideoTrack(null);
    setRemoteVideoTrack(null);
    setRemoteAudioTrack(null);
    setIsJoined(false);
    setIsJoining(false);
    setIsScreenSharing(false);
    setIsMicEnabled(true);
    setIsCameraEnabled(true);
    setRemoteState('waiting');
  };

  const stopScreenShare = async () => {
    if (!allowScreenShare || !screenTrackRef.current) {
      return;
    }

    const client = ensureClient();
    const screenTrack = screenTrackRef.current;
    screenTrackRef.current = null;

    await client.unpublish(screenTrack).catch(() => {});
    await stopTrack(screenTrack);

    if (cameraTrackRef.current) {
      await client.publish(cameraTrackRef.current);
      setLocalVideoTrack(cameraTrackRef.current);
    }

    setIsScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (!allowScreenShare) {
      return;
    }

    if (isScreenSharing) {
      await stopScreenShare();
      return;
    }

    try {
      const client = ensureClient();
      const nextTrack = await AgoraRTC.createScreenVideoTrack();
      const screenTrack = Array.isArray(nextTrack) ? nextTrack[0] : nextTrack;

      screenTrack.on('track-ended', () => {
        stopScreenShare().catch(() => {});
      });

      if (cameraTrackRef.current) {
        await client.unpublish(cameraTrackRef.current);
      }

      await client.publish(screenTrack);
      screenTrackRef.current = screenTrack;
      setLocalVideoTrack(screenTrack);
      setIsScreenSharing(true);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(getReadableAgoraError(error, 'Unable to start screen sharing.'));
    }
  };

  const toggleMicrophone = async () => {
    if (!audioTrackRef.current) return;

    const nextEnabled = !isMicEnabled;
    await audioTrackRef.current.setEnabled(nextEnabled);
    setIsMicEnabled(nextEnabled);
  };

  const toggleCamera = async () => {
    if (!cameraTrackRef.current) return;

    const nextEnabled = !isCameraEnabled;
    await cameraTrackRef.current.setEnabled(nextEnabled);
    setIsCameraEnabled(nextEnabled);
  };

  useEffect(() => {
    if (!enabled) {
      leave().catch(() => {});
      return undefined;
    }

    let isMounted = true;
    const client = ensureClient();

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (!isMounted) return;

      hasRemoteJoinedRef.current = true;
      setRemoteState('connected');

      if (mediaType === 'video') {
        setRemoteVideoTrack(user.videoTrack || null);
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play();
        setRemoteAudioTrack(user.audioTrack || null);
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (!isMounted) return;

      if (mediaType === 'video') {
        setRemoteVideoTrack(null);
      }

      if (mediaType === 'audio') {
        setRemoteAudioTrack(null);
      }

      setRemoteState(hasRemoteJoinedRef.current ? 'reconnecting' : 'waiting');
    };

    const handleUserLeft = () => {
      if (!isMounted) return;

      setRemoteVideoTrack(null);
      setRemoteAudioTrack(null);
      setRemoteState(hasRemoteJoinedRef.current ? 'reconnecting' : 'waiting');
    };

    const handleTokenWillExpire = async () => {
      try {
        const tokenData = await fetchTokenRef.current();
        await client.renewToken(tokenData.token);
      } catch (error) {
        if (isMounted) {
          setErrorMessage('Session token renewal failed. Please rejoin the call if the connection drops.');
        }
      }
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);
    client.on('token-privilege-will-expire', handleTokenWillExpire);

    const joinSession = async () => {
      setIsJoining(true);
      setErrorMessage('');
      hasRemoteJoinedRef.current = false;
      setRemoteVideoTrack(null);
      setRemoteAudioTrack(null);
      setRemoteState('waiting');

      try {
        const tokenData = await fetchTokenRef.current();
        await client.join(tokenData.appId, tokenData.channelName, tokenData.token, tokenData.uid);

        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

        if (!isMounted) {
          await stopTrack(microphoneTrack);
          await stopTrack(cameraTrack);
          return;
        }

        audioTrackRef.current = microphoneTrack;
        cameraTrackRef.current = cameraTrack;

        await client.publish([microphoneTrack, cameraTrack]);

        setLocalVideoTrack(cameraTrack);
        setIsMicEnabled(true);
        setIsCameraEnabled(true);
        setIsJoined(true);
      } catch (error) {
        if (!isMounted) return;

        await leave();
        setErrorMessage(getReadableAgoraError(error, 'Unable to start the Agora session.'));
      } finally {
        if (isMounted) {
          setIsJoining(false);
        }
      }
    };

    joinSession().catch(() => {});

    return () => {
      isMounted = false;
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
      client.off('token-privilege-will-expire', handleTokenWillExpire);
      leave().catch(() => {});
    };
  }, [allowScreenShare, enabled]);

  return {
    errorMessage,
    isJoining,
    isJoined,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    localVideoTrack,
    remoteAudioTrack,
    remoteVideoTrack,
    remoteState,
    leave,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
  };
};
