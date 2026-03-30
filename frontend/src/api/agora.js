import apiClient from './client';

export const agoraApi = {
  getToken: (bookingId) =>
    apiClient.post('/agora/token', { bookingId }),
};
