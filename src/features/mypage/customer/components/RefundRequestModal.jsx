import React, { useState } from 'react';
import { X, AlertCircle, CreditCard, MessageSquare } from 'lucide-react';
import api from '../../../../api/config/api';

const RefundRequestModal = ({
  payment,
  isOpen,
  onClose,
  onRefundRequested,
}) => {
  const [reason, setReason] = useState('');
  const [customerComment, setCustomerComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 환불 사유 옵션들 (백엔드 RefundReason enum에 맞춰 설정)
  const refundReasons = [
    { value: 'CUSTOMER_DISSATISFACTION', label: '고객 불만족' },
    { value: 'BEFORE_7_DAYS', label: '예약 7일 전 이상 취소' },
    { value: 'BETWEEN_3_AND_7_DAYS', label: '예약 3~7일 전 취소' },
    { value: 'LESS_THAN_3_DAYS', label: '예약 72시간 미만 취소' },
    { value: 'AFTER_COMPLETION', label: '서비스 완료 후 환불' },
  ];

  // 환불 사유에 따른 환불 비율 안내
  const getRefundRateInfo = () => {
    if (!reason) return null;

    switch (reason) {
      case 'BEFORE_7_DAYS':
        return {
          category: 'BEFORE_7_DAYS',
          rate: '100%',
          description: '예약 7일 전 이상 취소 - 전액 환불 가능',
          color: 'green',
        };
      case 'BETWEEN_3_AND_7_DAYS':
        return {
          category: 'BETWEEN_3_AND_7_DAYS',
          rate: '최대 50%',
          description: '예약 3~7일 전 취소 - 최대 50% 환불',
          color: 'yellow',
        };
      case 'LESS_THAN_3_DAYS':
        return {
          category: 'LESS_THAN_3_DAYS',
          rate: '최대 30%',
          description: '예약 72시간 미만 취소 - 최대 30% 환불',
          color: 'red',
        };
      case 'CUSTOMER_DISSATISFACTION':
        return {
          category: 'CUSTOMER_DISSATISFACTION',
          rate: '검토 후 결정',
          description: '고객 불만족 - 관리자 검토 후 환불 비율 결정',
          color: 'blue',
        };
      case 'AFTER_COMPLETION':
        return {
          category: 'AFTER_COMPLETION',
          rate: '검토 필요',
          description: '서비스 완료 후 환불 - 특별한 사유 검토 필요',
          color: 'orange',
        };
      default:
        return null;
    }
  };

  const refundRateInfo = getRefundRateInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      setError('환불 사유를 선택해주세요.');
      return;
    }

    if (!customerComment.trim()) {
      setError('환불 사유를 상세히 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('🔄 환불 요청 시작:', {
        paymentId: payment.id,
        reason,
        customerComment: customerComment.trim(),
      });

      // 백엔드 API 호출: POST /api/v1/my/refunds
      const response = await api.post('/my/refunds', {
        paymentId: payment.id,
        reason,
        customerComment: customerComment.trim(),
      });

      console.log('✅ 환불 요청 성공:', response.data);

      // 성공 시 부모 컴포넌트에 알림
      if (onRefundRequested) {
        onRefundRequested(response.data.data || response.data);
      }

      // 모달 닫기
      onClose();

      // 폼 초기화
      setReason('');
      setCustomerComment('');
    } catch (err) {
      console.error('❌ 환불 요청 실패:', err);

      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);

        if (err.response.status === 400) {
          setError('잘못된 요청입니다. 입력 정보를 확인해주세요.');
        } else if (err.response.status === 403) {
          setError('본인의 결제건이 아닙니다.');
        } else if (err.response.status === 404) {
          setError('결제 정보를 찾을 수 없습니다.');
        } else {
          setError('환불 요청 중 오류가 발생했습니다.');
        }
      } else {
        setError('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setReason('');
    setCustomerComment('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-red-500" />
            환불 요청
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 결제 정보 */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            환불 대상 결제
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">결제 번호:</span> #{payment?.id}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">결제 금액:</span>{' '}
              {payment?.amount?.toLocaleString()}원
            </p>
            {payment?.reservationId && (
              <p className="text-sm text-gray-900">
                <span className="font-medium">예약 번호:</span> #
                {payment.reservationId}
              </p>
            )}
          </div>
        </div>

        {/* 환불 요청 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* 환불 사유 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환불 사유 <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">환불 사유를 선택해주세요</option>
              {refundReasons.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 환불 사유 선택 시 환불 비율 정보 표시 */}
          {refundRateInfo && (
            <div
              className={`mb-4 p-4 rounded-lg border ${
                refundRateInfo.color === 'green'
                  ? 'bg-green-50 border-green-200'
                  : refundRateInfo.color === 'yellow'
                    ? 'bg-yellow-50 border-yellow-200'
                    : refundRateInfo.color === 'red'
                      ? 'bg-red-50 border-red-200'
                      : refundRateInfo.color === 'blue'
                        ? 'bg-blue-50 border-blue-200'
                        : refundRateInfo.color === 'orange'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center mb-2">
                <AlertCircle
                  className={`w-5 h-5 mr-2 ${
                    refundRateInfo.color === 'green'
                      ? 'text-green-500'
                      : refundRateInfo.color === 'yellow'
                        ? 'text-yellow-500'
                        : refundRateInfo.color === 'red'
                          ? 'text-red-500'
                          : refundRateInfo.color === 'blue'
                            ? 'text-blue-500'
                            : refundRateInfo.color === 'orange'
                              ? 'text-orange-500'
                              : 'text-gray-500'
                  }`}
                />
                <span className="font-medium text-sm">환불 비율 안내</span>
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-1">
                  예상 환불 비율:{' '}
                  <span
                    className={`${
                      refundRateInfo.color === 'green'
                        ? 'text-green-600'
                        : refundRateInfo.color === 'yellow'
                          ? 'text-yellow-600'
                          : refundRateInfo.color === 'red'
                            ? 'text-red-600'
                            : refundRateInfo.color === 'blue'
                              ? 'text-blue-600'
                              : refundRateInfo.color === 'orange'
                                ? 'text-orange-600'
                                : 'text-gray-600'
                    }`}
                  >
                    {refundRateInfo.rate}
                  </span>
                </p>
                <p className="text-gray-600">{refundRateInfo.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  * 최종 환불 금액은 관리자 검토 후 결정됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 상세 사유 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={customerComment}
              onChange={(e) => setCustomerComment(e.target.value)}
              placeholder="환불 사유를 상세히 입력해주세요..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              환불 처리를 위해 상세한 사유를 입력해주세요.
            </p>
          </div>

          {/* 안내 메시지 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <MessageSquare className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">환불 처리 안내</p>
                <ul className="text-xs space-y-1">
                  <li>• 환불 요청 후 관리자 검토를 거쳐 처리됩니다.</li>
                  <li>• 환불 처리에는 3-5일 정도 소요될 수 있습니다.</li>
                  <li>• 환불 정책에 따라 수수료가 차감될 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason || !customerComment.trim()}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리중...' : '환불 요청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundRequestModal;
