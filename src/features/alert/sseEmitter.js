import { useAlertStore } from "@/stores/alertStore";
import { useAuthStore } from "@/stores/authStore";
import { EventSourcePolyfill } from "event-source-polyfill";
import { refreshAccessToken } from "@/api/config/api"; // 토큰 재발급 함수

const sseEmitter = {
    eventSource: null, // 연결 인스턴스 저장
    reconnectAttempts: 0, // 연결 시도 횟수
    maxReconnects : 5, // 최대 재연결 시도 횟수

    connection: () => {
        const token = useAuthStore.getState().accessToken;
        const user = useAuthStore.getState().user;

        // 이미 연결되어 있다면 기존 연결 종료
        if (sseEmitter.eventSource) {
            // console.log('🔄 기존 SSE 연결 종료 후 재연결');
            // console.log(this);
            // sseEmitter.eventSource.close();
            console.log('🔄 기존 SSE 연결이 이미 존재합니다');
            return;
        }

        if (!token || !user) {
            console.log('❌ 토큰 또는 사용자 정보가 없어 SSE 연결 취소');
            return null;
        }

        console.log('=== SSE 연결 시도 START ===');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


        const eventSource = new EventSourcePolyfill(`${API_BASE_URL}/api/v1/alerts/connection`, {
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
            sseEmitter.reconnectAttempts = 0; // 재연결 시도 횟수 초기화
        };

        // 에러 처리 - 자동 재연결 로직 추가
        eventSource.onerror = async (error) => {
            sseEmitter.reconnectAttempts++;

            if (sseEmitter.reconnectAttempts > sseEmitter.maxReconnects) {
                console.log('재연결 시도 한계 초과, 연결 포기');
                eventSource.close();
                return;
            }
    
            console.log(`재연결 시도 ${sseEmitter.reconnectAttempts}/${sseEmitter.maxReconnects}`);

            // 스토어 비우기
            useAlertStore.getState().clearNotificationAlert();

            // SSE에서 401 에러 감지 - error 객체의 status 또는 readyState로 판단
            const is401Error = error.status === 401 || 
                             (error.target && error.target.status === 401) ||
                             (error.target && error.target.readyState === EventSource.CLOSED && 
                              sseEmitter.reconnectAttempts === 1); // 첫 번째 재연결 시도시 토큰 만료로 간주

            if (is401Error) {
                console.log('🔄 sse instance 토큰 만료');

                try {
                    // 토큰 재발급 시도
                    const newToken = await refreshAccessToken();
                    console.log('🔄 토큰 재발급 성공:', newToken);
                    sseEmitter.token = newToken; // 새로운 토큰 저장

                    console.log('✅ SSE 토큰 재발급 성공, 재연결 시도');
                    
                    // 기존 연결 종료
                    if (sseEmitter.eventSource) {
                        sseEmitter.eventSource.close();
                        sseEmitter.eventSource = null;
                    }
                    
                    // 새로운 토큰으로 재연결
                    setTimeout(() => {
                        sseEmitter.connection();
                    }, 1000);

                } catch (refreshError) {
                    console.error('❌ SSE 토큰 재발급 실패:', refreshError);
                    // 로그아웃 처리는 refreshAccessToken 함수에서 이미 처리됨
                }
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

        eventSource.addEventListener('disconnect', (e) => {
            console.log('🔌 서버에서 종료 신호 수신:', e.data);
            
            // 오류 핸들러 제거 후 안전하게 종료
            eventSource.onerror = null;
            eventSource.close();
            
            console.log('✅ 서버 요청에 따른 연결 종료 완료');
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
            
            // ✅ 핵심: onerror 핸들러 제거로 Access Denied 방지
            sseEmitter.eventSource.onerror = null;
            sseEmitter.eventSource.onopen = null;
            
            // 이벤트 리스너들도 제거
            sseEmitter.eventSource.removeEventListener('unread-notification', null);
            sseEmitter.eventSource.removeEventListener('new-notification', null);
            sseEmitter.eventSource.removeEventListener('ping', null);
            
            // 연결 종료
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