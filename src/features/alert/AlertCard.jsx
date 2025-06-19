import { useAlertStore } from "@/stores/alertStore";
import { X, Bell, Check } from 'lucide-react';

const AlertCard = ({ onClose }) => {
    const { notificationAlert } = useAlertStore();

    console.log('알림 아이콘 클릭')
    console.log(notificationAlert)

    return(
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
                className="fixed top-16 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-b-lg shadow-2xl z-50"
                style={{
                    position: 'fixed',
                    top: '64px', // 헤더 높이만큼 아래
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '512px',
                    height: '50vh', // 화면의 절반 높이
                    backgroundColor: 'white',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
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
                    {notificationAlert && notificationAlert.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {notificationAlert.map((noti, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                {noti.eventType || '알림'}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {noti.message || noti.content || '새로운 알림이 있습니다.'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {noti.timestamp || noti.createdAt || '방금 전'}
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
                    )}
                </div>

                {/* 푸터 (선택사항) */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button className="w-full text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        모든 알림 읽음 처리
                    </button>
                </div>
            </div>
        </>
    );

}

export default AlertCard