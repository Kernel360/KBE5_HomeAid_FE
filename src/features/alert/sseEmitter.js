import { useAlertStore } from "@/stores/alertStore";
import { useAuthStore } from "@/stores/authStore";
import { EventSourcePolyfill } from "event-source-polyfill";
import apiService from "@/api";
import { refreshAccessToken } from "@/api/config/api";

const setAlerts = useAlertStore.getState().setNotificationAlert;

const sseEmitter = {
    eventSource: null, // 연결 인스턴스 저장

    connection: () => {
        const token = useAuthStore.getState().accessToken
        const user = useAuthStore.getState().user;

        if (!token || !user) {
            console.log('❌ 토큰 또는 사용자 정보가 없어 SSE 연결 취소');
            return null;
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        const eventSource = new EventSourcePolyfill(`${API_BASE_URL}/api/v1/alerts/connection`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
            },
            withCredentials: true,
            //기본 설정 45초동안 sse 액션이 없으면 연결종료 서버는 30초마다 ping 이벤트를 보냄 
        });

        eventSource.onopen = () => {
            console.log('✅ SSE 연결 성공!', new Date());
            sseEmitter.getUnreadAlerts();
        };

        eventSource.onerror = (error) => {
            if (error.status === 401) { //토큰 만료
                refreshAccessToken()
                    .then((newToken) => {
                        console.log('🔄 토큰 갱신 성공:', newToken);
                        useAuthStore.getState().setAccessToken(newToken);
                        localStorage.setItem('accessToken', newToken);
                        // 새 토큰으로 SSE 재연결
                        sseEmitter.disconnect();
                        sseEmitter.connection();
                    })
                    .catch((err) => {
                        console.error('❌ 토큰 갱신 실패:', err);
                    });
            }
        };

        eventSource.addEventListener('new-notification', (e) => {
            const { data: receivedConnectData } = e;
            useAlertStore.getState().addNotificationAlert(JSON.parse(receivedConnectData));
        });

        eventSource.addEventListener('disconnect', (e) => {
            console.log('🔌 서버에서 종료 신호 수신:', e.data);

            // 오류 핸들러 제거 후 안전하게 종료
            eventSource.onerror = null;
            eventSource.close();

            console.log('✅ 서버 요청에 따른 연결 종료 완료');
        });

        eventSource.addEventListener('ping', (e) => {
            // console.log('💬 서버로부터 ping 수신:', e.data);
        });

        // 연결 인스턴스 저장
        sseEmitter.eventSource = eventSource;
        return eventSource;
    },

    // 연결 종료
    disconnect: () => {
        if (sseEmitter.eventSource) {
            console.log('🔌 SSE 연결 수동 종료');

            // ✅ 핵심: onerror 핸들러 제거로 Access Denied 방지
            sseEmitter.eventSource.onerror = null;
            sseEmitter.eventSource.onopen = null;

            // 이벤트 리스너들도 제거
            sseEmitter.eventSource.removeEventListener('new-notification', null);
            sseEmitter.eventSource.removeEventListener('ping', null);

            // 연결 종료
            sseEmitter.eventSource.close();
            sseEmitter.eventSource = null;
        }
    },

    // 연결 상태 확인
    isConnected: () => {
        return sseEmitter.eventSource && sseEmitter.eventSource.readyState === EventSource.OPEN;
    },

    getUnreadAlerts: async () => {
        try {
            const alertResponse = await apiService.alert.getUnReadAlerts();
            setAlerts(alertResponse.data.data);
        } catch (error) {
            console.error('❌ 알림 목록 조회 실패:', error);
        }
    }
};

export default sseEmitter;