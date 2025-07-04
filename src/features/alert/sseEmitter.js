// sseEmitter.js - 토큰 만료 시 올바른 처리
import { useAlertStore } from "@/stores/alertStore";
import { useAuthStore } from "@/stores/authStore";
import { EventSourcePolyfill } from "event-source-polyfill";
import { refreshAccessToken } from "@/api/config/api";
import apiService from "@/api";

const setAlerts = useAlertStore.getState().setNotificationAlert;

const sseEmitter = {
    eventSource: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 3,

    getCurrentToken: () => {
        const localStorageToken = localStorage.getItem('accessToken');
        const authStoreToken = useAuthStore.getState().accessToken;
        return localStorageToken || authStoreToken;
    },

    connection: async () => {
        const token = sseEmitter.getCurrentToken();
        const user = useAuthStore.getState().user;

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
            heartbeatTimeout: 2700000 // 45분 sse타임아웃이 40분보다 5분 여유로 강제종료
        });

        // 연결 성공
        eventSource.onopen = (event) => {
            console.log('✅ SSE 연결 성공!', event);
            sseEmitter.reconnectAttempts = 0;
            sseEmitter.getUnreadAlerts();
        };

        // 에러 처리 - 토큰 만료 상황 고려
        eventSource.onerror = async (error) => {
            console.log('❌ SSE 연결 에러:', error);
            
            // 연결 종료
            eventSource.close();
            
            // 401 에러 (토큰 만료) 처리
            if (sseEmitter.reconnectAttempts < sseEmitter.maxReconnectAttempts) {
                sseEmitter.reconnectAttempts++;
                console.log(`🔄 재연결 시도 ${sseEmitter.reconnectAttempts}/${sseEmitter.maxReconnectAttempts}`);
                
                try {
                    // 토큰 갱신 시도
                    console.log('🔄 토큰 갱신 시도');
                    const newToken = await refreshAccessToken();
                    useAuthStore.getState().setAccessToken(newToken);
                    localStorage.setItem('accessToken', newToken);
                    console.log('✅ 토큰 갱신 성공, 재연결 시도');
                    
                    // 재연결
                    setTimeout(() => {
                        sseEmitter.connection();
                    }, 3000 * sseEmitter.reconnectAttempts);
                    
                } catch (refreshError) {
                    console.error('❌ 토큰 갱신 실패:', refreshError);
                    
                    // REFRESH_TOKEN도 만료된 경우
                    if (refreshError.response?.status === 401 || 
                        refreshError.response?.data?.error === 'REFRESH_TOKEN_EXPIRED') {
                        
                        console.log('🚪 REFRESH_TOKEN 만료, 로그아웃 처리');
                        
                        // 로그아웃 처리
                        useAuthStore.getState().logout();
                        localStorage.removeItem('accessToken');
                        
                        // SSE 연결 완전 종료
                        sseEmitter.eventSource = null;
                        sseEmitter.reconnectAttempts = 0;
                        
                        // 알림 스토어 정리
                        useAlertStore.getState().clearNotificationAlert();
                        
                        // 로그인 페이지로 리다이렉트 (선택사항)
                        console.log('🔄 로그인 페이지로 리다이렉트 필요');
                        // window.location.href = '/auth/signin';
                        
                        return; // 더 이상 재연결 시도 안함
                    }
                    
                    // 다른 에러는 재연결 시도
                    setTimeout(() => {
                        sseEmitter.connection();
                    }, 5000 * sseEmitter.reconnectAttempts);
                }
            } else {
                console.log('❌ 최대 재연결 시도 횟수 초과');
                sseEmitter.eventSource = null;
            }
        };

        // 이벤트 리스너들
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
            
            eventSource.onerror = null;
            eventSource.close();
            sseEmitter.eventSource = null;
            
            console.log('✅ 서버 요청에 따른 연결 종료 완료');
        });

        console.log('=== SSE 연결 시도 END ===');
        sseEmitter.eventSource = eventSource;
        return eventSource;
    },

    disconnect: () => {
        if (sseEmitter.eventSource) {
            console.log('🔌 SSE 연결 수동 종료');
            
            sseEmitter.eventSource.onerror = null;
            sseEmitter.eventSource.onopen = null;
            sseEmitter.eventSource.close();
            sseEmitter.eventSource = null;
            sseEmitter.reconnectAttempts = 0;

            useAlertStore.getState().clearNotificationAlert();
            console.log('🗑️ SSE 연결 종료로 인한 알림 스토어 초기화');
        }
    },

    isConnected: () => {
        return sseEmitter.eventSource && sseEmitter.eventSource.readyState === EventSource.OPEN;
    },

    getUnreadAlerts: async () => {
        try {
            const alertResponse = await apiService.alert.getUnReadAlerts();
            console.log('알림 목록:', alertResponse.data);
            setAlerts(alertResponse.data.data);
        } catch (error) {
            console.error('❌ 알림 목록 조회 실패:', error);
        }
    }
};

export default sseEmitter;