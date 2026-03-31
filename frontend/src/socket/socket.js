import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

const getSocketBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl.replace(/\/$/, '');
};

export const getSocket = () => socket;

export const connectDoctorSocket = () => {
  const { token, user, role } = useAuthStore.getState();
  if (!token || role !== 'doctor' || !user?.id) return null;

  if (socket?.connected) return socket;

  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      transports: ['websocket'],
      withCredentials: true,
      auth: { token },
    });
    console.log('Socket connected');

    socket.on('connect_error', (err) => {
      // Keep silent; UI can still work via polling.
      console.warn('Socket connect error:', err?.message || err);
    });
  }

  socket.connect();
  socket.emit('join-doctor', user.id);
  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  try {
    socket.disconnect();
  } catch (_) {}
};

