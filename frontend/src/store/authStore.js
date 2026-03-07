import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Can be admin or doctor
      role: null, // 'admin', 'doctor', or specific admin role
      token: null,
      isAuthenticated: false,

      login: (user, token, role) => {
        set({
          user,
          token,
          role: role || user.role,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          role: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

