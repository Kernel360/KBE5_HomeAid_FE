import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import sseEmitter from './sseEmitter';

const SSEContext = createContext();

export const useSSE = () => {
    const context = useContext(SSEContext);
    if (!context) {
        throw new Error('useSSE must be used within SSEProvider');
    }
    return context;
};

export const SSEProvider = ({ children }) => {
    const { user, accessToken } = useAuthStore();
    const initializationRef = useRef({
        isSSEInitialized: false,
        initPromise: null,
        isManualDisconnect: false
    });

    // SSE 연결 초기화 함수
    const initializeSSE = useCallback(async () => {
        // 중복 초기화 방지
        if (initializationRef.current.initPromise) {
            console.log('🔄 SSE 초기화 이미 진행 중, 기다림');
            return initializationRef.current.initPromise;
        }

        // 이미 초기화되었고 연결 중인 경우
        if (initializationRef.current.isSSEInitialized && sseEmitter.isConnected()) {
            console.log('✅ SSE 이미 연결되어 있음');
            return Promise.resolve();
        }

        initializationRef.current.initPromise = (async () => {
            try {
                console.log('🚀 [SSEProvider] SSE 초기화 시작');

                // 사용자가 로그인되어 있는지 확인
                if (!user) {
                    console.log('❌ [SSEProvider] 사용자 정보 없음, SSE 연결 안함');
                    return;
                }

                // 토큰 상태 확인 (localStorage 우선)
                const currentToken = localStorage.getItem('accessToken') || accessToken;
                if (!currentToken) {
                    console.log('❌ [SSEProvider] 토큰 없음, SSE 연결 안함');
                    return;
                }

                // SSE 연결 시도
                await sseEmitter.connection();
                initializationRef.current.isSSEInitialized = true;
                initializationRef.current.isManualDisconnect = false;
                console.log('✅ [SSEProvider] SSE 초기화 완료');

            } catch (error) {
                console.error('❌ [SSEProvider] SSE 초기화 실패:', error);
                initializationRef.current.isSSEInitialized = false;
            } finally {
                initializationRef.current.initPromise = null;
            }
        })();

        return initializationRef.current.initPromise;
    }, [user, accessToken]);

    // SSE 연결 해제 함수
    const disconnectSSE = useCallback(() => {
        console.log('🔌 [SSEProvider] SSE 연결 해제 시작');
        
        initializationRef.current.isManualDisconnect = true;
        initializationRef.current.isSSEInitialized = false;
        initializationRef.current.initPromise = null;
        
        sseEmitter.disconnect();
        
        console.log('✅ [SSEProvider] SSE 연결 해제 완료');
    }, []);

    // 강제 재연결 함수
    const forceReconnect = useCallback(async () => {
        console.log('🔄 [SSEProvider] SSE 강제 재연결 시작');
        disconnectSSE();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        return initializeSSE();
    }, [initializeSSE, disconnectSSE]);

    // 연결 상태 확인 함수
    const isConnected = useCallback(() => {
        return sseEmitter.isConnected();
    }, []);

    // 사용자 상태 변경 감지
    useEffect(() => {
        if (user && (localStorage.getItem('accessToken') || accessToken)) {
            // 로그인 상태: SSE 연결 초기화
            console.log('👤 [SSEProvider] 사용자 로그인 감지, SSE 연결 초기화');
            initializeSSE();
        } else {
            // 로그아웃 상태: SSE 연결 해제
            console.log('👤 [SSEProvider] 사용자 로그아웃 감지, SSE 연결 해제');
            disconnectSSE();
        }
    }, [user, initializeSSE, disconnectSSE]); // accessToken 의존성 제거

    // 페이지 가시성 변경 처리
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('👁️ [SSEProvider] 페이지 숨김 (탭 전환)');
                // 필요시 연결 일시정지 로직 추가 가능
            } else {
                console.log('👁️ [SSEProvider] 페이지 표시 (탭 활성화)');
                // 페이지가 다시 활성화되었을 때 연결 상태 확인
                if (user && !sseEmitter.isConnected() && !initializationRef.current.isManualDisconnect) {
                    console.log('🔄 [SSEProvider] 페이지 활성화 시 SSE 재연결 시도');
                    initializeSSE();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, initializeSSE]);

    // 페이지 언로드 시 정리
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('🌐 [SSEProvider] 페이지 언로드, SSE 연결 정리');
            disconnectSSE();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            disconnectSSE(); // 컴포넌트 언마운트 시에도 정리
        };
    }, [disconnectSSE]);

    // Context 값
    const contextValue = {
        // 상태
        isConnected,
        isInitialized: initializationRef.current.isSSEInitialized,
        
        // 함수들
        connect: initializeSSE,
        disconnect: disconnectSSE,
        reconnect: forceReconnect,
        
        // 유틸리티
        getConnectionState: () => ({
            isConnected: isConnected(),
            isInitialized: initializationRef.current.isSSEInitialized,
            reconnectAttempts: sseEmitter.reconnectAttempts || 0,
            maxReconnectAttempts: sseEmitter.maxReconnectAttempts || 3
        })
    };

    return (
        <SSEContext.Provider value={contextValue}>
            {children}
        </SSEContext.Provider>
    );
};