import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import api from '../../../../api/config/api';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';

const PaymentHistory = ({ onBack, onViewDetail }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, PAID, PENDING, FAILED, REFUNDED

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // 백엔드 API 구조에 맞춰 고객 결제 내역 조회
      const response = await api.get('/my/payments/list');

      console.log('✅ 결제 내역 API 응답:', response);

      // CommonApiResponse<List<PaymentResponseDto>> 구조 처리
      if (response.data?.success && response.data?.data) {
        const paymentList = response.data.data;
        console.log('✅ 결제 내역 데이터:', paymentList);
        setPayments(paymentList);
      } else if (response.data && Array.isArray(response.data)) {
        // 직접 배열이 반환되는 경우 처리
        setPayments(response.data);
      } else {
        console.log('⚠️ 예상과 다른 응답 구조:', response.data);
        setPayments([]);
      }
    } catch (err) {
      console.error('❌ 결제 내역 조회 실패:', err);

      // 에러 상세 정보 확인
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);

        if (err.response.status === 404) {
          setError('결제 내역을 찾을 수 없습니다.');
        } else if (err.response.status === 403) {
          setError('결제 내역 조회 권한이 없습니다.');
        } else {
          setError('결제 내역을 불러오는데 실패했습니다.');
        }
      } else {
        setError('네트워크 오류가 발생했습니다.');
      }

      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // 결제 상태에 따른 아이콘 반환 - 백엔드 PaymentStatus enum에 맞춰 수정
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'REFUNDED':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  // 결제 상태에 따른 텍스트 반환 - 백엔드 PaymentStatus enum에 맞춰 수정
  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return '결제완료';
      case 'PENDING':
        return '결제대기';
      case 'PROCESSING':
        return '결제처리중';
      case 'FAILED':
        return '결제실패';
      case 'CANCELLED':
        return '결제취소';
      case 'REFUNDED':
        return '환불완료';
      default:
        return '알 수 없음';
    }
  };

  // 결제 상태에 따른 색상 클래스 반환 - 백엔드 PaymentStatus enum에 맞춰 수정
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'REFUNDED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 결제 방법 텍스트 반환
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'CARD':
        return '신용카드';
      case 'BANK_TRANSFER':
        return '계좌이체';
      case 'VIRTUAL_ACCOUNT':
        return '가상계좌';
      case 'PHONE':
        return '휴대폰';
      case 'KAKAOPAY':
        return '카카오페이';
      case 'PAYCO':
        return '페이코';
      default:
        return method || '기타';
    }
  };

  // 필터 버튼들 - 백엔드 PaymentStatus enum에 맞춰 수정
  const filterButtons = [
    { key: 'ALL', label: '전체', count: payments.length },
    {
      key: 'PAID',
      label: '결제완료',
      count: payments.filter((p) => p.status === 'PAID').length,
    },
    {
      key: 'PENDING',
      label: '결제중',
      count: payments.filter(
        (p) => p.status === 'PENDING' || p.status === 'PROCESSING'
      ).length,
    },
    {
      key: 'FAILED',
      label: '실패/취소',
      count: payments.filter(
        (p) => p.status === 'FAILED' || p.status === 'CANCELLED'
      ).length,
    },
    {
      key: 'REFUNDED',
      label: '환불',
      count: payments.filter((p) => p.status === 'REFUNDED').length,
    },
  ];

  // 필터된 결제 내역 - 백엔드 PaymentStatus에 맞춰 수정
  const filteredPayments = payments.filter((payment) => {
    if (selectedFilter === 'ALL') return true;

    switch (selectedFilter) {
      case 'PAID':
        return payment.status === 'PAID';
      case 'PENDING':
        return payment.status === 'PENDING' || payment.status === 'PROCESSING';
      case 'FAILED':
        return payment.status === 'FAILED' || payment.status === 'CANCELLED';
      case 'REFUNDED':
        return payment.status === 'REFUNDED';
      default:
        return payment.status === selectedFilter;
    }
  });

  if (loading) {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center"
        style={{
          paddingTop: '64px',
          paddingBottom: '80px',
          maxWidth: '512px',
          margin: '0 auto',
        }}
      >
        <Header showBackButton={true} onBackClick={onBack} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 내역을 불러오는 중...</p>
        </div>
        <Footer current="/customer/mypage" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={onBack} />

      {/* 페이지 제목 */}
      <div className="px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900">결제 내역</h3>
      </div>

      <main className="px-6 py-2">
        {/* 에러 상태 */}
        {error && (
          <div className="mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={fetchPaymentHistory}
                className="mt-2 text-red-600 underline text-sm"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 필터 버튼들 */}
        <div className="bg-white p-4 mb-4 rounded-2xl shadow-sm">
          <div className="flex space-x-2 overflow-x-auto">
            {filterButtons.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* 결제 내역 리스트 */}
        <div className="mb-6">
          {filteredPayments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                결제 내역이 없습니다
              </h3>
              <p className="text-gray-500">
                {selectedFilter === 'ALL'
                  ? '아직 결제한 내역이 없습니다.'
                  : `${filterButtons.find((f) => f.key === selectedFilter)?.label} 내역이 없습니다.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  {/* 결제 정보 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        결제 #{payment.id}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(payment.status)}`}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </div>

                  {/* 예약 정보 */}
                  {payment.reservationId && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">
                        예약번호: {payment.reservationId}
                      </span>
                    </div>
                  )}

                  {/* 결제 금액 */}
                  <div className="mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {payment.amount?.toLocaleString() || '0'}원
                    </span>
                  </div>

                  {/* 결제 상세 정보 */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>결제 방법</span>
                      <span>{getPaymentMethodText(payment.paymentMethod)}</span>
                    </div>

                    {payment.paidAt && (
                      <div className="flex justify-between">
                        <span>결제 일시</span>
                        <span>
                          {new Date(payment.paidAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    )}

                    {payment.customerName && (
                      <div className="flex justify-between">
                        <span>결제자</span>
                        <span>{payment.customerName}</span>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {payment.createdAt &&
                          `생성일: ${new Date(payment.createdAt).toLocaleDateString('ko-KR')}`}
                      </div>

                      {/* 상태별 액션 버튼 */}
                      <div className="flex items-center space-x-2">
                        {/* 상세보기 버튼 - 모든 상태에 대해 표시 */}
                        <button
                          onClick={() =>
                            onViewDetail && onViewDetail(payment.id)
                          }
                          className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          상세보기
                        </button>

                        {/* 추가 액션 버튼 */}
                        {payment.status === 'FAILED' && (
                          <button className="text-red-600 text-sm font-medium">
                            재결제
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default PaymentHistory;
