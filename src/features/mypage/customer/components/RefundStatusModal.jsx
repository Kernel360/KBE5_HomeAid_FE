import React from 'react';
import {
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
} from 'lucide-react';

const RefundStatusModal = ({ refundData, isOpen, onClose }) => {
  if (!isOpen || !refundData) return null;

  // 환불 상태에 따른 아이콘 반환
  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  // 환불 상태에 따른 텍스트 반환
  const getStatusText = (status) => {
    switch (status) {
      case 'REQUESTED':
        return '환불 요청됨';
      case 'APPROVED':
        return '환불 승인됨';
      case 'COMPLETED':
        return '환불 완료됨';
      case 'REJECTED':
        return '환불 거절됨';
      case 'CANCELLED':
        return '환불 취소됨';
      default:
        return '알 수 없음';
    }
  };

  // 환불 상태에 따른 색상 클래스 반환
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'REQUESTED':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'APPROVED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 환불 사유 텍스트 반환
  const getReasonText = (reason) => {
    switch (reason) {
      case 'CUSTOMER_DISSATISFACTION':
        return '고객 불만족';
      case 'BEFORE_7_DAYS':
        return '예약 7일 전 이상 취소';
      case 'BETWEEN_3_AND_7_DAYS':
        return '예약 3~7일 전 취소';
      case 'LESS_THAN_3_DAYS':
        return '예약 72시간 미만 취소';
      case 'AFTER_COMPLETION':
        return '서비스 완료 후 환불';
      default:
        return reason || '기타';
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
            환불 상태 확인
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 환불 상태 헤더 */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon(refundData.status)}
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  환불 요청 #{refundData.refundId}
                </h3>
                <p className="text-sm text-gray-500">
                  결제번호: #{refundData.paymentId}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColorClass(refundData.status)}`}
            >
              {getStatusText(refundData.status)}
            </span>
          </div>

          {/* 환불 금액 */}
          <div className="text-center py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">환불 요청 금액</p>
            <p className="text-2xl font-bold text-gray-900">
              {refundData.refundAmount?.toLocaleString() || '0'}원
            </p>
          </div>
        </div>

        {/* 환불 요청 정보 */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            환불 요청 정보
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">환불 사유</span>
              <span className="font-medium text-gray-900">
                {getReasonText(refundData.reason)}
              </span>
            </div>

            {refundData.customerComment && (
              <div className="py-2">
                <span className="text-gray-600 block mb-2">상세 사유</span>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-900 text-sm">
                    {refundData.customerComment}
                  </p>
                </div>
              </div>
            )}

            {refundData.requestedAt && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">요청 일시</span>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Date(refundData.requestedAt).toLocaleDateString(
                      'ko-KR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(refundData.requestedAt).toLocaleTimeString(
                      'ko-KR',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              </div>
            )}

            {refundData.processedAt && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">처리 일시</span>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Date(refundData.processedAt).toLocaleDateString(
                      'ko-KR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(refundData.processedAt).toLocaleTimeString(
                      'ko-KR',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 관리자 코멘트 */}
          {refundData.adminComment && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">관리자 메모</h4>
              <p className="text-blue-800 text-sm">{refundData.adminComment}</p>
            </div>
          )}

          {/* 상태별 안내 메시지 */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
              <div className="text-sm text-gray-700">
                {refundData.status === 'REQUESTED' && (
                  <>
                    <p className="font-medium mb-1">환불 검토 중</p>
                    <p>
                      관리자가 환불 요청을 검토하고 있습니다. 처리 완료까지
                      3-5일 정도 소요될 수 있습니다.
                    </p>
                  </>
                )}
                {refundData.status === 'APPROVED' && (
                  <>
                    <p className="font-medium mb-1">환불 승인됨</p>
                    <p>
                      환불이 승인되었습니다. 곧 환불 처리가 완료될 예정입니다.
                    </p>
                  </>
                )}
                {refundData.status === 'COMPLETED' && (
                  <>
                    <p className="font-medium mb-1">환불 완료</p>
                    <p>
                      환불이 완료되었습니다. 결제 수단에 따라 실제 환불까지
                      1-3일 정도 소요될 수 있습니다.
                    </p>
                  </>
                )}
                {refundData.status === 'REJECTED' && (
                  <>
                    <p className="font-medium mb-1">환불 거절됨</p>
                    <p>
                      환불 요청이 거절되었습니다. 자세한 사유는 관리자 메모를
                      확인해주세요.
                    </p>
                  </>
                )}
                {refundData.status === 'CANCELLED' && (
                  <>
                    <p className="font-medium mb-1">환불 취소됨</p>
                    <p>환불 요청이 취소되었습니다.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 닫기 버튼 */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundStatusModal;
