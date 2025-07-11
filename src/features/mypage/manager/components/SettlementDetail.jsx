import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { apiService } from '../../../../api/index.js';

const SettlementDetail = ({ settlement, onBack }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 정산 상세 결제 내역 조회
  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('정산 상세 조회:', settlement.id);

      const response = await apiService.settlement.getSettlementPayments(
        settlement.id
      );

      if (response?.data?.data) {
        setPaymentDetails(response.data.data);
      } else {
        throw new Error('정산 상세 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('정산 상세 조회 실패:', err);
      setError('정산 상세 정보를 불러오는 중 오류가 발생했습니다.');

      // 테스트용 더미 데이터
      const dummyPayments = generateDummyPayments();
      setPaymentDetails(dummyPayments);
    } finally {
      setLoading(false);
    }
  };

  // 더미 결제 데이터 생성 (테스트용)
  const generateDummyPayments = () => {
    const paymentMethods = ['CARD', 'TRANSFER', 'VIRTUAL_ACCOUNT'];
    const serviceTypes = [
      '청소 서비스',
      '요리 서비스',
      '베이비시터',
      '반려동물 돌봄',
    ];

    const payments = Array.from({ length: 8 }, (_, index) => {
      const amount = Math.floor(Math.random() * 100000) + 30000;
      // 20% 확률로 환불 발생
      const hasRefund = Math.random() < 0.2;
      const refundedAmount = hasRefund
        ? Math.floor(amount * (0.1 + Math.random() * 0.4))
        : 0; // 10~50% 환불
      const netAmount = amount - refundedAmount;

      return {
        id: index + 1,
        reservationId: 1000 + index,
        amount: amount,
        refundedAmount: refundedAmount,
        netAmount: netAmount,
        paymentMethod:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        customerName: `고객${index + 1}`,
        serviceName:
          serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        paidAt: (() => {
          const now = new Date();
          const koreaOffset = 9 * 60; // 한국은 UTC+9
          const utc = now.getTime() + now.getTimezoneOffset() * 60000;
          const koreaTimeNow = utc + koreaOffset * 60000;
          const paidDate = new Date(
            koreaTimeNow - Math.random() * 7 * 24 * 60 * 60 * 1000
          );
          return paidDate.toISOString().replace('Z', '+09:00');
        })(),
      };
    });

    // 백엔드 DTO 구조에 맞춰 총 금액 계산
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefundedAmount = payments.reduce(
      (sum, p) => sum + p.refundedAmount,
      0
    );
    const totalNetAmount = payments.reduce((sum, p) => sum + p.netAmount, 0);

    return {
      payments,
      totalAmount,
      totalRefundedAmount,
      totalNetAmount,
    };
  };

  // 정산 상태 텍스트
  const getStatusText = (status) => {
    const statusMap = {
      PENDING: '정산대기',
      CONFIRMED: '정산승인',
      PAID: '지급완료',
      CANCELLED: '정산취소',
    };
    return statusMap[status] || status;
  };

  // 정산 상태 색상
  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // 결제 수단 텍스트
  const getPaymentMethodText = (method) => {
    const methodMap = {
      CARD: '신용카드',
      TRANSFER: '계좌이체',
      VIRTUAL_ACCOUNT: '가상계좌',
    };
    return methodMap[method] || method;
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅 (한국 시간대 고려)
  const formatDate = (dateString) => {
    if (!dateString) return '미정';

    try {
      // YYYY-MM-DD 형식의 문자열인 경우 직접 파싱
      if (
        typeof dateString === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ) {
        const [year, month, day] = dateString.split('-');
        return `${year}.${month}.${day}`;
      }

      // ISO 문자열이나 다른 형식인 경우 한국 시간대로 변환
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '날짜 오류';

      const koreaOffset = 9 * 60; // 한국은 UTC+9
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const koreaDate = new Date(utc + koreaOffset * 60000);

      return koreaDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error, dateString);
      return '날짜 오류';
    }
  };

  // 날짜와 시간 포맷팅 (한국 시간대 고려)
  const formatDateTime = (dateString) => {
    if (!dateString) return '미정';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '날짜 오류';

      const koreaOffset = 9 * 60; // 한국은 UTC+9
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const koreaDate = new Date(utc + koreaOffset * 60000);

      return koreaDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('날짜 시간 포맷팅 오류:', error, dateString);
      return '날짜 오류';
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (settlement?.id) {
      fetchPaymentDetails();
    }
  }, [settlement?.id]);

  return (
    <div className="min-h-screen ">
      <div
        className="w-full bg-white h-screen flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}
      >
        <Header showBackButton={true} onBackClick={onBack} />

        <main
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ paddingBottom: '100px', paddingTop: '80px' }}
        >
          {/* 헤더 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              정산 상세 내역
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(settlement.from)} ~ {formatDate(settlement.to)} 정산
              내역
            </p>
          </div>

          {/* 정산 정보 카드 */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">정산 정보</h4>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(settlement.status)}`}
              >
                {getStatusText(settlement.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">정산 기간</span>
                <span className="font-medium">
                  {formatDate(settlement.from)} ~ {formatDate(settlement.to)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 결제 금액</span>
                <span className="font-medium">
                  ₩
                  {formatAmount(
                    paymentDetails?.totalAmount || settlement.totalAmount
                  )}
                </span>
              </div>

              {/* 환불 금액 표시 (환불이 있는 경우에만) */}
              {paymentDetails?.totalRefundedAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 환불 금액</span>
                  <span className="text-red-600">
                    -₩{formatAmount(paymentDetails.totalRefundedAmount)}
                  </span>
                </div>
              )}

              {/* 실제 결제 금액 표시 */}
              {paymentDetails?.totalNetAmount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">실제 결제 금액</span>
                  <span className="text-green-600 font-medium">
                    ₩{formatAmount(paymentDetails.totalNetAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600">플랫폼 수수료 (20%)</span>
                <span className="text-red-600">
                  -₩{formatAmount(settlement.adminAmount)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">
                    정산 예정 금액
                  </span>
                  <span className="text-blue-600 font-bold text-lg">
                    ₩{formatAmount(settlement.managerAmount)}
                  </span>
                </div>
              </div>

              {settlement.settledAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">정산 생성일</span>
                  <span className="font-medium">
                    {formatDateTime(settlement.settledAt)}
                  </span>
                </div>
              )}

              {settlement.confirmedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">승인일</span>
                  <span className="font-medium">
                    {formatDateTime(settlement.confirmedAt)}
                  </span>
                </div>
              )}

              {settlement.paidAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">지급일</span>
                  <span className="font-medium">
                    {formatDateTime(settlement.paidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                결제 내역을 불러오는 중...
              </span>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={fetchPaymentDetails}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 결제 내역 리스트 */}
          {!loading && paymentDetails && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  결제 내역
                </h4>
                <span className="text-sm text-gray-500">
                  총 {paymentDetails.payments?.length || 0}건
                </span>
              </div>

              <div className="space-y-3">
                {paymentDetails.payments &&
                paymentDetails.payments.length > 0 ? (
                  paymentDetails.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            결제 #{payment.id}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          예약 #{payment.reservationId}
                        </span>
                      </div>

                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900 mb-1">
                          {payment.serviceName || '홈케어 서비스'}
                        </h5>
                        <p className="text-sm text-gray-600">
                          고객: {payment.customerName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">원래 결제 금액</span>
                          <p className="font-medium text-gray-900">
                            ₩{formatAmount(payment.amount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">결제 수단</span>
                          <p className="font-medium text-gray-900">
                            {getPaymentMethodText(payment.paymentMethod)}
                          </p>
                        </div>
                      </div>

                      {/* 환불 금액이 있는 경우 표시 */}
                      {payment.refundedAmount > 0 && (
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-500">환불 금액</span>
                            <p className="font-medium text-red-600">
                              -₩{formatAmount(payment.refundedAmount)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              실제 결제 금액
                            </span>
                            <p className="font-bold text-green-600">
                              ₩
                              {formatAmount(
                                payment.netAmount ||
                                  payment.amount - payment.refundedAmount
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 환불이 없는 경우 실제 결제 금액 표시 */}
                      {(!payment.refundedAmount ||
                        payment.refundedAmount === 0) && (
                        <div className="mb-3 text-sm">
                          <span className="text-gray-500">실제 결제 금액</span>
                          <p className="font-bold text-green-600">
                            ₩{formatAmount(payment.netAmount || payment.amount)}
                          </p>
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="text-gray-500">결제 일시: </span>
                        <span className="font-medium text-gray-900">
                          {formatDateTime(payment.paidAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">결제 내역이 없습니다</p>
                    <p className="text-sm text-gray-400">
                      해당 기간에 결제된 내역이 없습니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
};

export default SettlementDetail;
