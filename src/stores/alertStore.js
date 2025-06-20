import { create } from'zustand';

export const useAlertStore = create((set) => ({
    notificationAlert: [],

    // 알림 리스트 전체 교체 (서버에서 전체 목록을 받을 때)
    setNotificationAlert: (newNotiList) => {
        console.log('🔵 스토어 - setNotificationAlert 호출됨:', newNotiList);
        set(() => {
            console.log('🔵 스토어 - 상태 업데이트 실행');
            return {
                notificationAlert: Array.isArray(newNotiList) ? newNotiList : [newNotiList]
            };
        });
    },

    // 기존 알림 목록에 새로운 알림들 추가 (실시간 알림 수신 시)
    addNotificationAlert: (newNoti) => set((prev) => ({
        notificationAlert: Array.isArray(newNoti) 
            ? [...prev.notificationAlert, ...newNoti]
            : [...prev.notificationAlert, newNoti]
    })),

    // 특정 알림 제거
    removeNotificationAlert: (alertId) => set((prev) => ({
        notificationAlert: prev.notificationAlert.filter(alert => alert.id !== alertId)
    })),

    // 모든 알림 읽음 처리
    markAllAsRead: () => set((prev) => ({
        notificationAlert: prev.notificationAlert.map(alert => ({ ...alert, isRead: true }))
    })),

    // 알림 목록 초기화
    clearNotificationAlert: () => set(() => ({
        notificationAlert: []
    }))
}))