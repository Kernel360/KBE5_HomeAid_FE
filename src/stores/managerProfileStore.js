import { create } from 'zustand';

export const useManagerProfileStore = create((set) => ({
  formData: {
    // 예시 초기값, 실제로는 필요한 필드에 맞게 수정
    preferenceIds: [],
    area: '',
    availableDays: [],
    startTime: '',
    endTime: '',
    availabilities: [],
    // ...추가 필드
  },
  setFormData: (newData) =>
    set((state) => ({
      formData: { ...state.formData, ...newData },
    })),
  resetFormData: () =>
    set({
      formData: {
        preferenceIds: [],
        area: '',
        availableDays: [],
        startTime: '',
        endTime: '',
        availabilities: [],
        // ...추가 필드
      },
    }),
}));