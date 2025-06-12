import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, WashingMachine, User, Star, ArrowLeft } from 'lucide-react';
import { getReservationById } from '../ReservationApi';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale'; // 한국어 로케일 임포트
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';

const ReservationDetailPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await getReservationById(reservationId);
        if (response && response.data) {
          setReservation({
            id: response.data.reservationId,
            status: response.data.status,
            totalPrice: response.data.totalPrice || 0,
            totalDuration: response.data.totalDuration || 0,
            subOptionName: response.data.subOptionName,
            requestedDate: response.data.requestedDate || null,
            requestedTime: response.data.requestedTime || null,
            customerId: response.data.customerId,
            managerId: response.data.managerId,
          });
          console.log('예약 상세 조회 성공:', response.data);
        } else {
          setReservation(null);
          console.warn(
            '예약 상세 데이터 형식이 올바르지 않거나 비어 있습니다.',
            response.data
          );
          setError('예약 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('예약 상세 조회 에러:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            '예약 상세 정보를 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      fetchReservation();
    } else {
      setError('예약 ID가 제공되지 않았습니다.');
      setLoading(false);
    }
  }, [reservationId]);

  const formatDateTime = (dateString, timeString, duration) => {
    if (!dateString || !timeString) {
      return '날짜/시간 정보 없음';
    }

    try {
      const dateTimeString = `${dateString}T${timeString}`; // LocalTime이 초 정보를 포함하지 않을 수 있음
      const date = new Date(dateTimeString); // ISO 8601 형식으로 파싱

      if (isNaN(date.getTime())) {
        console.error('날짜/시간 포맷팅 오류: Invalid Date object created.');
        return `${dateString} / ${timeString} (총 ${duration || 0}분)`;
      }

      const formattedDate = format(date, 'yyyy.M.d(EEE)', { locale: ko });
      const formattedTime = format(date, 'HH:mm');

      const safeDuration = duration || 0;
      const durationHours = safeDuration / 60;

      const endTime = new Date(date.getTime() + safeDuration * 60 * 1000); // 분을 밀리초로 변환하여 더함
      const formattedEndTime = format(endTime, 'HH:mm');

      return `${formattedDate} / ${formattedTime}~${formattedEndTime}(${durationHours}시간)`;
    } catch (e) {
      console.error('날짜/시간 포맷팅 오류:', e);
      return `${dateString} / ${timeString} (총 ${duration || 0}분)`;
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return '가격 정보 없음';
    }
    return `${price.toLocaleString()}원`;
  };

  // const handleReviewWriteClick = () => {
  //   // 디버깅: 현재 reservationId 확인
  //   console.log('리뷰 쓰기 버튼 클릭 - reservationId:', reservationId);
  //   console.log(
  //     '리뷰 쓰기 이동 URL:',
  //     `/customer/review/write?reservationId=${reservationId}`
  //   );

  //   // 리뷰 작성 페이지로 이동 (예약 ID와 함께)
  //   // navigate(`/customer/review/write?reservationId=${reservationId}`);
  //   navigate(
  //     `/customer/review/write?reservationId=${reservationId}&targetId=${reservation.managerId}&customerId=${reservation.customerId}`
  //   );
  // };
  const handleReviewWriteClick = () => {
    navigate(`/customer/review/write`, { state: { reservation } });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        예약 상세 정보를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
          padding: '20px',
          borderRadius: '8px',
          margin: '40px auto',
          maxWidth: '720px',
          textAlign: 'center',
        }}
      >
        {error}
      </div>
    );
  }

  if (!reservation) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        예약 정보를 찾을 수 없습니다.
      </div>
    );
  }

  // 상태에 따른 아이콘 및 섹션 제목 결정
  const isCompleted = reservation.status === 'COMPLETED'; // 백엔드 상태명에 따라 변경

  // 디버깅: 예약 상태 확인
  console.log('예약 상태 디버깅:', {
    reservationStatus: reservation.status,
    isCompleted: isCompleted,
    reservation: reservation,
  });

  const icon = isCompleted ? (
    <WashingMachine size={28} color="#247cff" />
  ) : (
    <Home size={28} color="#247cff" />
  );
  const statusText = isCompleted ? '방문 완료' : '예약 완료';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        title="예약 상세 보기"
      />

      <div
        style={{
          paddingTop: '64px', // 헤더 높이만큼 패딩
          paddingBottom: '80px', // 푸터 높이만큼 패딩
          maxWidth: '512px', // 모바일 최대 너비
          margin: '0 auto', // 중앙 정렬
          minHeight: '100vh',
          backgroundColor: '#f8f8f8',
        }}
      >
        <div
          style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Alert Message */}
          {!isCompleted && (
            <div
              style={{
                backgroundColor: '#e0f0ff',
                color: '#247cff',
                padding: '15px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '30px',
                fontSize: '14px',
              }}
            >
              <img
                src="https://www.gstatic.com/images/icons/material/system/2x/info_outline_black_24dp.png"
                alt="info"
                style={{
                  width: '20px',
                  height: '20px',
                  filter:
                    'invert(36%) sepia(85%) saturate(3015%) hue-rotate(204deg) brightness(102%) contrast(101%)',
                }}
              />
              <span>예약한 시간에 도우미가 연락 후 찾아갑니다.</span>
            </div>
          )}

          {/* Reservation Info Section */}
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
              <h3
                style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}
              >
                {statusText}
              </h3>
              <span style={{ fontSize: '13px', color: '#888' }}>
                {/* paymentDate 필드가 DTO에 없으므로 표시하지 않음 */}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: '#e0f0ff',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                }}
              >
                {icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '5px',
                  }}
                >
                  {/* serviceName 필드가 DTO에 없으므로 subOptionName만 표시 */}
                  {reservation.subOptionName || '서비스 이름 없음'}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                  }}
                >
                  {formatDateTime(
                    reservation.requestedDate,
                    reservation.requestedTime,
                    reservation.totalDuration
                  )}
                </p>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#222',
                  }}
                >
                  {formatPrice(reservation.totalPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Service Price Section */}
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px',
              }}
            >
              서비스 금액
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <span style={{ color: '#555' }}>
                기본금액({reservation.totalDuration / 60}시간)
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {/* basePrice 필드가 DTO에 없으므로 총 가격 표시 */}
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {formatPrice(reservation.totalPrice)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <span style={{ color: '#555' }}>청소도구 준비</span>
              <span style={{ fontWeight: 'bold' }}>
                {/* materialFee 필드가 DTO에 없으므로 표시하지 않음 */}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <span style={{ color: '#555' }}>결제 수단</span>
              <span style={{ fontWeight: 'bold' }}>
                {/* paymentMethod 필드가 DTO에 없으므로 표시하지 않음 */}
              </span>
            </div>
            <div
              style={{
                borderTop: '1px solid #eee',
                paddingTop: '15px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}
              >
                총 서비스 금액
              </span>
              <span
                style={{ fontSize: '18px', fontWeight: 'bold', color: '#222' }}
              >
                {formatPrice(reservation.totalPrice)}
              </span>
            </div>
          </div>

          {/* Ant Worker Section */}
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px',
              }}
            >
              앤트워커
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: '#e0f0ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                }}
              >
                <User size={28} color="#247cff" />
              </div>
              <div>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '5px',
                  }}
                >
                  {/* managerName 필드가 DTO에 없으므로 '정보 없음' 처리 */}
                  매니저 정보 없음
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  <Star
                    size={16}
                    color="#FFD700"
                    fill="#FFD700"
                    style={{ marginRight: '5px' }}
                  />
                  <span>
                    {/* managerRating, managerReviewCount 필드가 DTO에 없으므로 표시하지 않음 */}
                    N/A
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              style={{
                flex: 1,
                padding: '15px',
                background: '#e0e0e0',
                color: '#555',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              예약 정보
            </button>
            <button
              style={{
                flex: 1,
                padding: '15px',
                background: '#ffe0e0',
                color: '#cc0000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              예약 취소
            </button>
            {/* 임시로 모든 상태에서 리뷰 쓰기 버튼 표시 (디버깅용) */}
            <button
              onClick={handleReviewWriteClick}
              style={{
                flex: 1,
                padding: '15px',
                background: isCompleted ? '#000' : '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              리뷰 쓰기 {!isCompleted && '(테스트)'}
            </button>
          </div>
        </div>
      </div>

      <Footer current="/customer/review" />
    </div>
  );
};

export default ReservationDetailPage;
