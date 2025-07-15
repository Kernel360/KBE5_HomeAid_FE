import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { api } from '../../../api/config/api';

// 부분환불 모달 컴포넌트
const PartialRefundModal = ({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
  loading,
}) => {
  const [refundType, setRefundType] = useState('amount'); // 'amount' or 'percentage'
  const [refundAmount, setRefundAmount] = useState('');
  const [refundPercentage, setRefundPercentage] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [error, setError] = useState('');

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setRefundType('amount');
      setRefundAmount('');
      setRefundPercentage('');
      setAdminComment('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!adminComment.trim()) {
      setError('관리자 코멘트를 입력해주세요.');
      return;
    }

    let refundData = {
      adminComment: adminComment.trim(),
    };

    if (refundType === 'amount') {
      const amount = parseInt(refundAmount.replace(/[^0-9]/g, ''));
      if (isNaN(amount) || amount <= 0 || amount > maxAmount) {
        setError(
          `올바른 환불 금액을 입력해주세요. (최대: ₩${formatAmount(maxAmount)})`
        );
        return;
      }
      refundData.refundAmount = amount;
    } else {
      const percentage = parseInt(refundPercentage);
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        setError('올바른 환불 비율을 입력해주세요. (1-100%)');
        return;
      }
      refundData.refundPercentage = percentage;
    }

    onSubmit(refundData);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60] p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">부분 환불</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 환불 방식 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환불 방식
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="amount"
                  checked={refundType === 'amount'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm">금액으로 지정</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="percentage"
                  checked={refundType === 'percentage'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm">비율로 지정</span>
              </label>
            </div>
          </div>

          {/* 환불 금액 입력 */}
          {refundType === 'amount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 금액 (최대: ₩{formatAmount(maxAmount)})
              </label>
              <input
                type="text"
                value={refundAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setRefundAmount(value ? formatAmount(parseInt(value)) : '');
                }}
                placeholder="환불할 금액을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          )}

          {/* 환불 비율 입력 */}
          {refundType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 비율 (1-100%)
              </label>
              <input
                type="number"
                value={refundPercentage}
                onChange={(e) => setRefundPercentage(e.target.value)}
                placeholder="환불 비율을 입력하세요"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {refundPercentage && (
                <p className="text-xs text-gray-500 mt-1">
                  환불 예상 금액: ₩
                  {formatAmount(
                    Math.floor(
                      (maxAmount * (parseInt(refundPercentage) || 0)) / 100
                    )
                  )}
                </p>
              )}
            </div>
          )}

          {/* 관리자 코멘트 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 코멘트 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="환불 사유나 추가 설명을 입력하세요"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin mr-2" />}
              환불 처리
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPaymentDetail = ({ payment, isOpen, onClose, onRefresh }) => {
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [refundHistory, setRefundHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPartialRefundModal, setShowPartialRefundModal] = useState(false);

  // 결제 상세 정보 조회
  const fetchPaymentDetail = async (paymentId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 결제 상세 정보 조회:', paymentId);

      // 결제 상세 정보 조회 - 여러 엔드포인트 시도
      let paymentResponse = null;
      try {
        paymentResponse = await api.get(`/admin/payments/${paymentId}`);
      } catch (fetchErr) {
        console.log(
          '첫 번째 엔드포인트 실패, 다른 방법 시도...',
          fetchErr.message
        );
        // 다른 엔드포인트 시도 가능
        setPaymentDetail(payment); // 기본 정보 사용
      }

      if (paymentResponse?.data) {
        setPaymentDetail(paymentResponse.data.data || paymentResponse.data);
      } else {
        setPaymentDetail(payment);
      }

      // 환불 내역 조회
      await fetchRefundHistory(paymentId);
    } catch (err) {
      console.error('결제 상세 정보 조회 실패:', err);
      setError('결제 정보를 불러오는 중 오류가 발생했습니다.');
      setPaymentDetail(payment); // 기본 정보라도 표시
    } finally {
      setLoading(false);
    }
  };

  // 환불 내역 조회
  const fetchRefundHistory = async (paymentId) => {
    try {
      console.log('🔍 환불 내역 조회:', paymentId);

      // 전체 환불 내역을 조회한 후 해당 결제 ID로 필터링
      const refundResponse = await api.get('/admin/refunds', {
        params: { page: 0, size: 100 },
      });

      if (refundResponse?.data?.data) {
        const allRefunds =
          refundResponse.data.data.content || refundResponse.data.data;
        const paymentRefunds = allRefunds.filter(
          (refund) => refund.paymentId === paymentId
        );
        setRefundHistory(paymentRefunds);
        console.log('환불 내역:', paymentRefunds);
      }
    } catch (err) {
      console.error('환불 내역 조회 실패:', err);
      setRefundHistory([]);
    }
  };

  // 환불 승인 처리 (관리자 코멘트만 입력)
  const handleApproveRefund = async (refundId) => {
    const adminComment = prompt('승인 사유를 입력하세요:');
    if (!adminComment?.trim()) return;

    try {
      setLoading(true);
      console.log('환불 승인:', refundId, adminComment);

      const decisionRequest = {
        adminComment: adminComment.trim(),
      };

      const response = await api.post(
        `/admin/refunds/${refundId}/approve`,
        decisionRequest
      );

      console.log('환불 승인 응답:', response);

      if (response.data?.success !== false) {
        alert('환불이 승인되었습니다.');

        // 환불 내역 다시 조회
        await fetchRefundHistory(paymentDetail.id);
        // 부모 컴포넌트 데이터 새로고침
        if (onRefresh) onRefresh();
      } else {
        throw new Error(response.data?.message || '환불 승인에 실패했습니다.');
      }
    } catch (err) {
      console.error('환불 승인 실패:', err);

      let errorMessage = '환불 승인 중 오류가 발생했습니다.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 환불 거절 처리 (관리자 코멘트만 입력)
  const handleRejectRefund = async (refundId) => {
    const adminComment = prompt('거절 사유를 입력하세요:');
    if (!adminComment?.trim()) return;

    try {
      setLoading(true);
      console.log('환불 거절:', refundId, adminComment);

      const decisionRequest = {
        adminComment: adminComment.trim(),
      };

      const response = await api.post(
        `/admin/refunds/${refundId}/reject`,
        decisionRequest
      );

      console.log('환불 거절 응답:', response);

      if (response.data?.success !== false) {
        alert('환불이 거절되었습니다.');

        // 환불 내역 다시 조회
        await fetchRefundHistory(paymentDetail.id);
        // 부모 컴포넌트 데이터 새로고침
        if (onRefresh) onRefresh();
      } else {
        throw new Error(response.data?.message || '환불 거절에 실패했습니다.');
      }
    } catch (err) {
      console.error('환불 거절 실패:', err);

      let errorMessage = '환불 거절 중 오류가 발생했습니다.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 환불 상태 텍스트
  const getRefundStatusText = (status) => {
    const statusMap = {
      REQUESTED: '요청',
      APPROVED: '승인',
      REJECTED: '거절',
      COMPLETED: '완료',
      CANCELLED: '취소',
    };
    return statusMap[status] || status;
  };

  // 환불 상태 색상
  const getRefundStatusColor = (status) => {
    const colorMap = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // 환불 사유 텍스트
  const getRefundReasonText = (reason) => {
    const reasonMap = {
      CUSTOMER_DISSATISFACTION: '고객 불만족',
      BEFORE_7_DAYS: '예약 7일 전 이상 취소',
      BETWEEN_3_AND_7_DAYS: '예약 3~7일 전 취소',
      LESS_THAN_3_DAYS: '예약 72시간 미만 취소',
      AFTER_COMPLETION: '서비스 완료 후 환불',
      CUSTOMER_REQUEST: '고객이 환불을 요청했을 때',
      ADMIN_MANUAL_REFUND: '관리자가 수동으로 환불했을 때',
    };
    return reasonMap[reason] || reason;
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 전액 환불 처리
  const handleFullRefund = async () => {
    const confirmMessage = `${paymentDetail.customerName} 고객의 결제를 전액 환불하시겠습니까?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      console.log('전액 환불 처리:', paymentDetail.id);

      const decisionRequest = {
        adminComment: '관리자 전액 환불 처리',
      };

      const response = await api.post(
        `/admin/refunds/${paymentDetail.id}/full`,
        decisionRequest
      );

      if (response.data?.success !== false) {
        alert('전액 환불이 완료되었습니다.');
        // 환불 내역 다시 조회
        await fetchRefundHistory(paymentDetail.id);
        // 부모 컴포넌트 데이터 새로고침
        if (onRefresh) onRefresh();
      } else {
        throw new Error(response.data?.message || '환불 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('전액 환불 실패:', err);
      let errorMessage = '환불 처리 중 오류가 발생했습니다.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 부분 환불 처리 (모달 방식)
  const handlePartialRefund = () => {
    setShowPartialRefundModal(true);
  };

  // 부분 환불 모달에서 제출 처리
  const handlePartialRefundSubmit = async (refundData) => {
    try {
      setLoading(true);
      console.log('부분 환불 처리:', paymentDetail.id, refundData);

      const response = await api.post(
        `/admin/refunds/${paymentDetail.id}/partial`,
        refundData
      );

      if (response.data?.success !== false) {
        alert('부분 환불이 완료되었습니다.');
        setShowPartialRefundModal(false);
        // 환불 내역 다시 조회
        await fetchRefundHistory(paymentDetail.id);
        // 부모 컴포넌트 데이터 새로고침
        if (onRefresh) onRefresh();
      } else {
        throw new Error(response.data?.message || '환불 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('부분 환불 실패:', err);
      let errorMessage = '환불 처리 중 오류가 발생했습니다.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && payment?.id) {
      fetchPaymentDetail(payment.id);
    }
  }, [isOpen, payment?.id]);

  // 모달 닫기
  const handleClose = () => {
    setPaymentDetail(null);
    setRefundHistory([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-blue-500" />
            결제 상세 정보
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">데이터를 불러오는 중...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {paymentDetail && (
            <div className="space-y-6">
              {/* 결제 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  결제 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">결제 ID</p>
                    <p className="font-medium">#{paymentDetail.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">예약 ID</p>
                    <p className="font-medium">
                      #{paymentDetail.reservationId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">고객명</p>
                    <p className="font-medium">{paymentDetail.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">결제 상태</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(paymentDetail.status)}`}
                    >
                      {getPaymentStatusText(paymentDetail.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">결제 금액</p>
                    <p className="font-medium text-lg">
                      ₩
                      {formatAmount(
                        paymentDetail.netAmount || paymentDetail.amount
                      )}
                    </p>
                    {paymentDetail.refundedAmount &&
                      paymentDetail.refundedAmount > 0 && (
                        <p className="text-xs text-gray-500">
                          원래: ₩{formatAmount(paymentDetail.amount)} | 환불: ₩
                          {formatAmount(paymentDetail.refundedAmount)}
                        </p>
                      )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">결제 수단</p>
                    <p className="font-medium">
                      {paymentDetail.paymentMethodText || paymentDetail.method}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">결제 일시</p>
                    <p className="font-medium">{paymentDetail.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* 환불 내역 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  환불 내역
                </h3>
                {refundHistory.length > 0 ? (
                  <div className="space-y-3">
                    {refundHistory.map((refund) => (
                      <div
                        key={refund.refundId}
                        className="bg-white rounded-lg p-4 border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              환불 ID: #{refund.refundId}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRefundStatusColor(refund.status)}`}
                            >
                              {getRefundStatusText(refund.status)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {refund.status === 'REQUESTED' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveRefund(refund.refundId)
                                  }
                                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                                  disabled={loading}
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectRefund(refund.refundId)
                                  }
                                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                                  disabled={loading}
                                >
                                  거절
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">환불 금액</p>
                            <p className="font-medium">
                              {refund.refundAmount
                                ? formatAmount(refund.refundAmount)
                                : '미처리'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">환불 사유</p>
                            <p className="font-medium">
                              {refund.reason
                                ? getRefundReasonText(refund.reason)
                                : '미처리'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">요청 일시</p>
                            <p className="font-medium">{refund.requestedAt}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">처리 일시</p>
                            <p className="font-medium">
                              {refund.processedAt || '미처리'}
                            </p>
                          </div>
                        </div>
                        {refund.customerComment && (
                          <div className="mt-2">
                            <p className="text-gray-600 text-sm">고객 의견</p>
                            <p className="text-sm bg-gray-100 p-2 rounded">
                              {refund.customerComment}
                            </p>
                          </div>
                        )}
                        {refund.adminComment && (
                          <div className="mt-2">
                            <p className="text-gray-600 text-sm">관리자 의견</p>
                            <p className="text-sm bg-blue-100 p-2 rounded">
                              {refund.adminComment}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">환불 내역이 없습니다.</p>
                  </div>
                )}

                {/* 환불 관리 버튼들 */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    환불 관리
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {/* 환불 요청이 있는 경우 승인/거절 버튼 */}
                    {refundHistory.some(
                      (refund) => refund.status === 'REQUESTED'
                    ) ? (
                      <div className="w-full bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          <p className="text-sm text-purple-800 font-medium">
                            💡 고객의 환불 요청이 대기 중입니다
                          </p>
                        </div>
                        <p className="text-xs text-purple-700">
                          환불 승인/거절 버튼은 각 환불 내역에서 처리할 수
                          있습니다.
                        </p>
                      </div>
                    ) : null}

                    {/* 결제 상태별 환불 버튼들 */}
                    {paymentDetail.status === 'PAID' && (
                      <>
                        <button
                          onClick={() => handleFullRefund()}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#dc2626',
                          }}
                          disabled={loading}
                        >
                          전액 환불
                        </button>
                        <button
                          onClick={() => handlePartialRefund()}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#16a34a',
                          }}
                          disabled={loading}
                        >
                          부분 환불
                        </button>
                      </>
                    )}

                    {paymentDetail.status === 'PARTIAL_REFUNDED' && (
                      <>
                        <button
                          onClick={() => handleFullRefund()}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#1d4ed8',
                          }}
                          disabled={loading}
                        >
                          추가 환불
                        </button>
                        <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm">
                          부분환불 완료
                        </span>
                      </>
                    )}

                    {(paymentDetail.status === 'PENDING' ||
                      paymentDetail.status === 'FAILED' ||
                      paymentDetail.status === 'REFUNDED' ||
                      paymentDetail.status === 'CANCELED') && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                        환불 불가능한 상태
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 부분환불 모달 */}
      {showPartialRefundModal && (
        <PartialRefundModal
          isOpen={showPartialRefundModal}
          onClose={() => setShowPartialRefundModal(false)}
          onSubmit={handlePartialRefundSubmit}
          maxAmount={paymentDetail.netAmount || paymentDetail.amount}
          loading={loading}
        />
      )}
    </div>
  );
};

// 결제 상태 매핑 함수들
const getPaymentStatusText = (status) => {
  const statusMap = {
    PAID: '결제완료',
    PENDING: '결제대기',
    FAILED: '결제실패',
    PARTIAL_REFUNDED: '부분환불',
    REFUNDED: '환불완료',
    CANCELED: '결제취소',
  };
  return statusMap[status] || status;
};

const getPaymentStatusColor = (status) => {
  const colorMap = {
    PAID: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    FAILED: 'bg-red-100 text-red-800',
    PARTIAL_REFUNDED: 'bg-orange-100 text-orange-800',
    REFUNDED: 'bg-blue-100 text-blue-800',
    CANCELED: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export default AdminPaymentDetail;
