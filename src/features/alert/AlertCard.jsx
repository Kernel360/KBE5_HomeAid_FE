import apiService from "@/api";
import { useAlertStore } from "@/stores/alertStore";
import { X, Bell, Check } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const AlertCard = memo(({ onClose, isVisible = false }) => {
    const { notificationAlert, removeNotificationAlert } = useAlertStore();
    // const [alerts, setAlerts] = useState(notificationAlert);
    const navigate = useNavigate();
    const userRole = useAuthStore((state) => state.user?.role);


    // 보이지 않을 때는 null 반환
    if (!isVisible) {
        return null;
    }

    function handleNavigate(alertId, relatedEntityId, relatedEntityType, eventType) {
        console.log(userRole);
        console.log('알림 클릭:', alertId, relatedEntityId, relatedEntityType, eventType);
        removeNotificationAlert(alertId); // 알림 클릭 후 제거
        console.log(notificationAlert);
        const response = alertRead(alertId);
        console.log('알림 읽음 처리:', response);
        onClose();
        //Todo 권한과 엔티티에 따라 라우팅 되는 주소 설정
        switch (eventType) {
            case 'RESERVATION_CREATED':     //고객이 예약 할 시
                navigate(`/admin/matches/reservations/${relatedEntityId}/detail`);
                break;
            case 'MATCHING_CREATED':
                navigate('/matching/list');
                break;
            case 'MATCHING_ACCEPTED_BY_MANAGER':  //관리자가 맺어준 매칭 수락시
                if (userRole === 'ROLE_CUSTOMER') {
                    navigate(`/customer/reservations/${relatedEntityId}`);
                } else if (userRole === 'ROLE_ADMIN') {
                    //매칭의 아이디로는 이동할 페이지 당장은 없음 (서버에서 예약아이디 주는걸로 변경)
                    //예약 아이디로 매칭해주는 페이지로 가도 매칭 되었단 정보는 없음 매칭 선택 정보가 있다
                    navigate(`/admin/matches/reservations/${relatedEntityId}/detail`);
                }
                break;
            case 'MATCHING_REJECTED_BY_MANAGER':    //매니저가 매칭 거절
                navigate(`/admin/matches/reservations/${relatedEntityId}/detail`);
                break;
            case 'MATCHING_ACCEPTED_BY_CUSTOMER':  //고객 최종수락
                if (userRole === 'ROLE_MANAGER') {
                    navigate(`/customer/reservations/${relatedEntityId}`);
                } else if (userRole === 'ROLE_ADMIN') {
                    navigate(`/admin/matches/reservations/${relatedEntityId}/detail`);
                }
                break;
            case 'MATCHING_REJECTED_BY_CUSTOMER':   //고객이 매칭 거절
                if (userRole === 'ROLE_MANAGER') {
                    navigate(`/customer/reservations/${relatedEntityId}`);
                } else if (userRole === 'ROLE_ADMIN') {
                    navigate(`/admin/matches/reservations/${relatedEntityId}/detail`);
                }
                break;

            default:
                console.log('알 수 없는 이벤트 타입:', eventType);
                break;
        }
    }

    const alertRead = async (alertId) => {
        const response = await apiService.alert.updateReadStatus(alertId);
        console.log('read update', response);
    }

    return (
        <>
            {/* 배경 오버레이 */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 40
                }}
            />

            {/* 알림 카드 */}
            <div
                className="fixed z-50"
                style={{
                    position: 'fixed',
                    top: '64px', // 헤더 높이만큼 아래
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%', // 화면 너비의 90%
                    maxWidth: '475px', // 최대 너비 제한
                    height: '50vh', // 화면의 절반 높이
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Bell size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">알림</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* 알림 목록 */}
                <div className="flex-1 overflow-y-auto">
                    {userRole ? (
                        // 로그인한 사용자 - 기존 알림 컨텐츠
                        notificationAlert && notificationAlert.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {notificationAlert.map((noti, index) => (
                                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3" onClick={() =>
                                            handleNavigate(noti.alertId, noti.relatedEntityId, noti.relatedEntityType, noti.eventType)}>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {noti.message || '새로운 알림이 있습니다.'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {noti.createdAt || '방금 전'}
                                                </p>
                                            </div>
                                            <button className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full">
                                                <Check size={16} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <Bell size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">알림이 없습니다</h3>
                                <p className="text-sm text-gray-500">새로운 알림이 오면 여기에 표시됩니다.</p>
                            </div>
                        )
                    ) : (
                        // 로그인하지 않은 사용자 - 로그인 안내
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <Bell size={48} className="text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                알림을 확인하려면 먼저 로그인해주세요.
                            </p>
                            <button
                                onClick={() => navigate('/auth/signin')} // 로그인 페이지로 이동
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                로그인하기
                            </button>
                        </div>
                    )}
                </div>

                {/* 푸터 (선택사항) */}
                {/* <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button className="w-full text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        모든 알림 읽음 처리
                    </button>
                </div> */}
            </div>
        </>
    );

});

export default AlertCard