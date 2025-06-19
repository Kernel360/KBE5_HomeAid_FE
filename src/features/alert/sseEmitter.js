import { useAlertStore } from "@/stores/alertStore";
import { useAuthStore } from "@/stores/authStore";
import { EventSourcePolyfill } from "event-source-polyfill";

const sseEmitter = {

    connection: () => {
        const token = useAuthStore.getState().accessToken;

        console.log('=== SSE 연결 시도 START ===');

        const eventSource = new EventSourcePolyfill('http://localhost:8080/api/v1/alerts/connection'
            , {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                },
                withCredentials: true,
                heartbeatTimeout: 86400000 // 24시간
            }
        );

        // 연결 성공
        eventSource.onopen = (event) => {
            console.log('✅ SSE 연결 성공!', event);
        };

        // 메시지 수신
        // eventSource.onmessage = (event) => {
        //     console.log('📨 SSE 메시지 수신:', event.data);
        //     try {
        //         useAlertStore.getState().setNotificationAlert(JSON.parse(event.data));
        //     } catch (error) {
        //         console.error('메시지 파싱 에러:', error);
        //     }
        // };

        // 에러 처리
        eventSource.onerror = (error) => {
            if (error.status === 403) {
                console.error('🚫 403 Forbidden - 토큰 문제일 가능성');
                // console.log('현재 토큰:', token ? '있음' : '없음');
            }
        };

        eventSource.addEventListener('unread-notification', (e) => {
            console.log('unread-notification 메세지 수신')
            const { data: receivedConnectData } = e;  
            console.log("count event data",receivedConnectData);  
            useAlertStore.getState().setNotificationAlert(JSON.parse(receivedConnectData))
        })

        console.log('=== SSE 연결 시도 END ===');

        return eventSource;
    }
}

export default sseEmitter;