import { useAlertStore } from "@/stores/alertStore";
import { useAuthStore } from "@/stores/authStore";
import { EventSourcePolyfill } from "event-source-polyfill";

const sseEmitter = {
    eventSource: null, // 연결 인스턴스 저장

    connection: () => {
        const token = useAuthStore.getState().accessToken;
        const user = useAuthStore.getState().user;

        // 이미 연결되어 있다면 기존 연결 종료
        if (sseEmitter.eventSource) {
            console.log('🔄 기존 SSE 연결 종료 후 재연결');
            sseEmitter.eventSource.close();
        }

        if (!token || !user) {
            console.log('❌ 토큰 또는 사용자 정보가 없어 SSE 연결 취소');
            return null;
        }

        console.log('=== SSE 연결 시도 START ===');

        const eventSource = new EventSourcePolyfill('http://localhost:8080/api/v1/alerts/connection', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
            },
            withCredentials: true,
            heartbeatTimeout: 86400000 // 24시간
        });

        // 연결 성공
        eventSource.onopen = (event) => {
            console.log('✅ SSE 연결 성공!', event);
        };

        // 에러 처리 - 자동 재연결 로직 추가
        eventSource.onerror = (error) => {
            console.error('❌ SSE 연결 에러:', error);
            
            // 스토어 비우기
            useAlertStore.getState().clearNotificationAlert();
            
            if (error.status === 403) {
                console.error('🚫 403 Forbidden - 토큰 문제일 가능성');
            } else {
                // 3초 후 자동 재연결 시도
                console.log('🔄 3초 후 SSE 재연결 시도...');
                setTimeout(() => {
                    const currentToken = useAuthStore.getState().accessToken;
                    const currentUser = useAuthStore.getState().user;
                    
                    if (currentToken && currentUser) {
                        sseEmitter.connection();
                    }
                }, 3000);
            }
        };

        eventSource.addEventListener('unread-notification', (e) => {
            const { data: receivedConnectData } = e;  
            
            try {
                const parsedData = JSON.parse(receivedConnectData);
                useAlertStore.getState().setNotificationAlert(parsedData);
            } catch (error) {
                console.error('🟢 SSE - 파싱 에러:', error);
            }
        });

        eventSource.addEventListener('new-notification', (e) => {
            console.log('🔔 new-notification 스케쥴러 메세지 수신');
            const { data: receivedConnectData } = e;  
            console.log("새로운 알림 데이터:", receivedConnectData);  
            useAlertStore.getState().addNotificationAlert(JSON.parse(receivedConnectData));
        });

        eventSource.addEventListener('ping', (e) => {
            console.log('서버 하트비트 수신:', e.data);
        });

        console.log('=== SSE 연결 시도 END ===');

        // 연결 인스턴스 저장
        sseEmitter.eventSource = eventSource;
        return eventSource;
    },

    // 연결 종료
    disconnect: () => {
        if (sseEmitter.eventSource) {
            console.log('🔌 SSE 연결 수동 종료');
            sseEmitter.eventSource.close();
            sseEmitter.eventSource = null;
            
            // 연결 종료 시 스토어도 비우기
            useAlertStore.getState().clearNotificationAlert();
            console.log('🗑️ SSE 연결 종료로 인한 알림 스토어 초기화');
        }
    },

    // 연결 상태 확인
    isConnected: () => {
        return sseEmitter.eventSource && sseEmitter.eventSource.readyState === EventSource.OPEN;
    }
};

export default sseEmitter;