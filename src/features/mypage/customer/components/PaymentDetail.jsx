import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Receipt,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api/config/api';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';
import RefundRequestModal from './RefundRequestModal.jsx';
import RefundStatusModal from './RefundStatusModal.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PaymentDetail = ({ paymentId, onBack }) => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRefundStatusModalOpen, setIsRefundStatusModalOpen] = useState(false);
  const [refundData, setRefundData] = useState(null);
  const [hasRefundRequest, setHasRefundRequest] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 영수증 컴포넌트 참조
  const receiptRef = useRef(null);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetail();
      fetchRefundData();
    }
  }, [paymentId]);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 결제 상세 조회 시작:', paymentId);

      // 백엔드 API 호출: /api/v1/my/payments/detail/{paymentId}
      const response = await api.get(`/my/payments/detail/${paymentId}`);

      console.log('✅ 결제 상세 API 응답:', response);

      // CommonApiResponse<PaymentResponseDto> 구조 처리
      if (response.data?.success && response.data?.data) {
        const paymentDetail = response.data.data;
        console.log('✅ 결제 상세 데이터:', paymentDetail);
        setPayment(paymentDetail);
      } else {
        console.log('⚠️ 예상과 다른 응답 구조:', response.data);
        setError('결제 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('❌ 결제 상세 조회 실패:', err);

      // 에러 상세 정보 확인
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);

        if (err.response.status === 404) {
          setError('결제 정보를 찾을 수 없습니다.');
        } else if (err.response.status === 403) {
          setError('결제 정보 조회 권한이 없습니다.');
        } else {
          setError('결제 정보를 불러오는데 실패했습니다.');
        }
      } else {
        setError('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 환불 내역 조회 함수
  const fetchRefundData = async () => {
    try {
      console.log('🔍 환불 내역 조회 시작 - paymentId:', paymentId);

      // 백엔드 API 호출: GET /api/v1/my/refunds
      const response = await api.get('/my/refunds');
      console.log('✅ 환불 내역 API 응답:', response);

      // CommonApiResponse<List<RefundResponseDto>> 구조 처리
      if (response.data?.success && response.data?.data) {
        const refundList = response.data.data;
        console.log('✅ 환불 내역 데이터:', refundList);

        // 현재 결제에 해당하는 환불 내역 찾기
        const paymentRefund = refundList.find(
          (refund) => refund.paymentId === parseInt(paymentId)
        );

        if (paymentRefund) {
          console.log('✅ 해당 결제의 환불 내역 발견:', paymentRefund);
          setRefundData(paymentRefund);
          setHasRefundRequest(true);
        } else {
          console.log('ℹ️ 해당 결제의 환불 내역 없음');
          setRefundData(null);
          setHasRefundRequest(false);
        }
      } else {
        console.log(
          '⚠️ 환불 내역 없거나 예상과 다른 응답 구조:',
          response.data
        );
        setRefundData(null);
        setHasRefundRequest(false);
      }
    } catch (err) {
      console.error('❌ 환불 내역 조회 실패:', err);

      // 404는 환불 내역이 없다는 의미일 수 있으므로 에러로 처리하지 않음
      if (err.response?.status === 404) {
        console.log('ℹ️ 환불 내역 없음 (404)');
        setRefundData(null);
        setHasRefundRequest(false);
      } else {
        console.error('환불 내역 조회 에러:', err);
      }
    }
  };

  // 환불 요청 성공 시 호출되는 함수
  const handleRefundRequested = async (newRefundData) => {
    console.log('✅ 환불 요청 완료:', newRefundData);

    // 환불 내역 새로고침
    await fetchRefundData();

    // 성공 메시지 표시 (필요한 경우)
    alert('환불 요청이 성공적으로 접수되었습니다.');
  };

  // 영수증 PDF 생성 함수
  const generateReceiptPDF = async () => {
    if (!payment || !receiptRef.current) {
      alert('영수증 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // html2canvas로 영수증 영역을 이미지로 변환
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // 고해상도를 위한 스케일
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 400, // 영수증 너비
        height: 600, // 영수증 높이 (자동 조정됨)
      });

      // PDF 생성 (A4 크기)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // 캔버스 이미지를 PDF에 추가
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 150; // PDF에서의 이미지 너비 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 페이지 중앙에 배치
      const pageWidth = pdf.internal.pageSize.getWidth();
      const x = (pageWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', x, 20, imgWidth, imgHeight);

      // PDF 다운로드
      const fileName = `영수증_${payment.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      console.log('✅ 영수증 PDF 생성 완료:', fileName);
    } catch (error) {
      console.error('❌ 영수증 PDF 생성 실패:', error);
      alert('영수증 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 결제 상태에 따른 아이콘 반환
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'CANCELED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'PARTIAL_REFUNDED':
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case 'REFUNDED':
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-500" />;
    }
  };

  // 결제 상태에 따른 텍스트 반환
  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return '결제완료';
      case 'CANCELED':
        return '결제취소';
      case 'PARTIAL_REFUNDED':
        return '부분환불';
      case 'REFUNDED':
        return '전체환불';
      default:
        return '알 수 없음';
    }
  };

  // 결제 상태에 따른 색상 클래스 반환
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'CANCELED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PARTIAL_REFUNDED':
        return 'text-orange-600 bg-orange-50 border-orange-200';
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
          <p className="text-gray-600">결제 상세 정보를 불러오는 중...</p>
        </div>
        <Footer current="/customer/mypage" />
      </div>
    );
  }

  if (error || !payment) {
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

        <div className="px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900">결제 상세</h3>
        </div>

        <main className="px-6 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchPaymentDetail}
              className="mt-2 text-red-600 underline text-sm"
            >
              다시 시도
            </button>
          </div>
        </main>

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
        <h3 className="text-xl font-bold text-gray-900">결제 상세</h3>
      </div>

      <main className="px-6 py-2">
        {/* 결제 상태 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon(payment.status)}
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  결제 #{payment.id}
                </h2>
                <p className="text-sm text-gray-500">
                  {payment.reservationId &&
                    `예약번호: ${payment.reservationId}`}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColorClass(payment.status)}`}
            >
              {getStatusText(payment.status)}
            </span>
          </div>

          {/* 결제 금액 */}
          <div className="text-center py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">결제 금액</p>
            <p className="text-2xl font-bold text-gray-900">
              {payment.amount?.toLocaleString() || '0'}원
            </p>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            결제 정보
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">결제 방법</span>
              <span className="font-medium text-gray-900">
                {getPaymentMethodText(payment.paymentMethod)}
              </span>
            </div>

            {payment.paidAt && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">결제 일시</span>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Date(payment.paidAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.paidAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {payment.customerName && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">결제자</span>
                <span className="font-medium text-gray-900">
                  {payment.customerName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 예약 정보 (예약 ID가 있는 경우) */}
        {payment.reservationId && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              관련 예약 정보
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">예약 번호</span>
                <span className="font-medium text-gray-900">
                  #{payment.reservationId}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <button
                  className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  onClick={() => {
                    if (payment?.reservationId) {
                      console.log('예약 상세로 이동:', payment.reservationId);
                      navigate(
                        `/customer/reservations/${payment.reservationId}`
                      );
                    } else {
                      alert('예약 정보를 찾을 수 없습니다.');
                    }
                  }}
                >
                  예약 상세보기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        {payment.status === 'PAID' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              추가 기능
            </h3>

            <div className="space-y-3">
              <button
                onClick={generateReceiptPDF}
                disabled={isGeneratingPdf}
                className="w-full bg-gray-50 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    영수증 생성 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    영수증 다운로드
                  </>
                )}
              </button>

              {hasRefundRequest ? (
                <button
                  onClick={() => setIsRefundStatusModalOpen(true)}
                  className="w-full bg-blue-50 text-blue-600 py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  환불 상태 확인
                </button>
              ) : (
                <button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="w-full bg-red-50 text-red-600 py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  환불 요청
                </button>
              )}
            </div>
          </div>
        )}

        {/* 하단 여백 */}
        <div className="h-6"></div>
      </main>

      <Footer current="/customer/mypage" />

      {/* 환불 요청 모달 */}
      <RefundRequestModal
        payment={payment}
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onRefundRequested={handleRefundRequested}
      />

      {/* 영수증 컴포넌트 (PDF 생성용, 화면에 보이지 않음) */}
      <div
        ref={receiptRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          backgroundColor: '#ffffff',
          padding: '32px',
          width: '400px',
          fontSize: '14px',
          lineHeight: '1.4',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {payment && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* 영수증 헤더 */}
            <div
              style={{
                textAlign: 'center',
                borderBottom: '2px solid #1f2937',
                paddingBottom: '16px',
              }}
            >
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: '0 0 8px 0',
                }}
              >
                영수증
              </h1>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0',
                }}
              >
                Payment Receipt
              </p>
            </div>

            {/* 발행 정보 */}
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                }}
              >
                발행일시
              </p>
              <p
                style={{
                  fontWeight: '500',
                  margin: '0',
                  color: '#111827',
                }}
              >
                {new Date().toLocaleString('ko-KR')}
              </p>
            </div>

            {/* 결제 정보 */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <h3
                style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  borderBottom: '1px solid #d1d5db',
                  paddingBottom: '4px',
                  margin: '0',
                  color: '#111827',
                }}
              >
                결제 정보
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>결제 번호</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>
                  #{payment.id}
                </span>
              </div>

              {payment.reservationId && (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span style={{ color: '#6b7280' }}>예약 번호</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>
                    #{payment.reservationId}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>결제 방법</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>
                  {getPaymentMethodText(payment.paymentMethod)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>결제 상태</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>
                  {getStatusText(payment.status)}
                </span>
              </div>

              {payment.paidAt && (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span style={{ color: '#6b7280' }}>결제 일시</span>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontWeight: '500',
                        margin: '0',
                        color: '#111827',
                      }}
                    >
                      {new Date(payment.paidAt).toLocaleDateString('ko-KR')}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0',
                      }}
                    >
                      {new Date(payment.paidAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {payment.customerName && (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span style={{ color: '#6b7280' }}>결제자</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>
                    {payment.customerName}
                  </span>
                </div>
              )}
            </div>

            {/* 금액 정보 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderTop: '2px solid #1f2937',
                paddingTop: '16px',
              }}
            >
              <h3
                style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  margin: '0',
                  color: '#111827',
                }}
              >
                금액 정보
              </h3>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#111827' }}>
                  총 결제금액
                </span>
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '24px',
                    color: '#111827',
                  }}
                >
                  {payment.amount?.toLocaleString() || '0'}원
                </span>
              </div>
            </div>

            {/* 영수증 푸터 */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '11px',
                color: '#6b7280',
                borderTop: '1px solid #d1d5db',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <p style={{ margin: '0' }}>
                본 영수증은 결제 완료를 증명하는 문서입니다.
              </p>
              <p style={{ margin: '0' }}>
                문의사항이 있으시면 고객센터로 연락해 주세요.
              </p>
              <p
                style={{
                  fontWeight: '500',
                  margin: '0',
                  color: '#374151',
                }}
              >
                HomeAid 서비스
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 환불 상태 확인 모달 */}
      <RefundStatusModal
        refundData={refundData}
        isOpen={isRefundStatusModalOpen}
        onClose={() => setIsRefundStatusModalOpen(false)}
      />
    </div>
  );
};

export default PaymentDetail;
