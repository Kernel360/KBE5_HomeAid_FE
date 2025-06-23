import { create } from 'zustand';

export const useManagerProfileStore = create((set) => ({
    formData: {
      preferenceIds: [],
      availabilities: [
        {
          weekday: 1, // 예시
          startTime: '09:00',
          endTime: '18:00',
          preferRegions: [
            { sido: '서울특별시', sigungu: '강남구' },
          ],
        },
      ],
    },
    setFormData: (newData) =>
      set((state) => ({
        formData: {
          ...state.formData,
          ...newData,
        },
      })),
    resetFormData: () =>
      set({
        formData: {
          preferenceIds: [],
          availabilities: [],
        },
      }),
  }));