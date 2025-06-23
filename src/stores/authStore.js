// src/stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { userId, role, ... }
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage', // localStorage에 저장될 키 이름
      getStorage: () => localStorage, // 사용할 스토리지 (기본값 localStorage)
    }
  )
);
