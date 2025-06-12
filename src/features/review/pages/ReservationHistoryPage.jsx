import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, WashingMachine, ChevronRight } from 'lucide-react';
import { format } from 'date-fns'; // 날짜 포맷팅 (npm install date-fns)
import { ko } from 'date-fns/locale'; // 한국어 로케일 임포트
import { getCustomerReservations } from '../ReservationApi';

const ReservationHistoryPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await getCustomerReservations();
        if (response && response.data && Array.isArray(response.data.content)) {
          // DTO 필드에 맞게 데이터 처리
          setReservations(
            response.data.content.map((res) => {
              console.log('Processing reservation DTO:', res); // DTO 처리 과정 로그 추가
              return {
                id: res.reservationId, // reservationId를 id로 매핑
                status: res.status,
                totalPrice: res.totalPrice || 0, // Default to 0 if null
                totalDuration: res.totalDuration || 0, // Default to 0 if null
                subOptionName: res.subOptionName,
                requestedDate: res.requestedDate || null, // Ensure it's explicitly null if missing
                requestedTime: res.requestedTime || null, // Ensure it's explicitly null if missing
              };
            })
          );
          console.log('예약 내역 조회 성공:', response.data.content);
        } else {
          setReservations([]);
          console.warn(
            '예약 내역 데이터 형식이 올바르지 않거나 비어 있습니다.',
            response.data
          );
        }
      } catch (err) {
        console.error('예약 내역 조회 에러:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            '예약 내역을 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const formatDateTime = (dateString, timeString, duration) => {
    console.log('formatDateTime input:', { dateString, timeString, duration }); // 함수 입력 값 로그 추가

    // 필수 데이터가 없으면 기본 문자열 반환
    if (!dateString || !timeString) {
      console.log(
        'formatDateTime: dateString or timeString is missing, returning default message.'
      ); // Added log
      return '날짜/시간 정보 없음';
    }

    try {
      const dateTimeString = `${dateString}T${timeString}`; // LocalTime이 초 정보를 포함하지 않을 수 있음
      console.log('dateTimeString:', dateTimeString); // 생성된 dateTimeString 로그 추가
      const date = new Date(dateTimeString); // ISO 8601 형식으로 파싱
      console.log(
        'Date object:',
        date,
        'isNaN(date.getTime()):',
        isNaN(date.getTime())
      ); // Date 객체 및 유효성 로그 추가

      // 유효하지 않은 Date 객체인 경우 (예: 잘못된 dateTimeString)
      if (isNaN(date.getTime())) {
        console.error('날짜/시간 포맷팅 오류: Invalid Date object created.');
        return `${dateString} / ${timeString} (총 ${duration ? duration : 0}분)`;
      }

      const formattedDate = format(date, 'yyyy.M.d(EEE)', { locale: ko }); // 한글 요일
      const formattedTime = format(date, 'HH:mm');

      // duration이 유효하지 않으면 0으로 처리
      const safeDuration = duration || 0;
      const durationHours = safeDuration / 60;

      const endTime = new Date(date.getTime() + safeDuration * 60 * 1000); // 분을 밀리초로 변환하여 더함
      console.log(
        'endTime object before formatting:',
        endTime,
        'isNaN(endTime.getTime()):',
        isNaN(endTime.getTime())
      ); // Added log for endTime
      const formattedEndTime = format(endTime, 'HH:mm');

      return `${formattedDate} / ${formattedTime}~${formattedEndTime}(${durationHours}시간)`;
    } catch (e) {
      console.error('날짜/시간 포맷팅 오류 (catch 블록):', e); // Modified log
      return `${dateString} / ${timeString} (총 ${duration ? duration : 0}분)`; // 오류 발생 시 대체 텍스트
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return '가격 정보 없음';
    }
    return `${price.toLocaleString()}원`;
  };

  const handleItemClick = (reservationId) => {
    // 리뷰 상세 페이지로 이동
    navigate(`/customer/review/detail/${reservationId}`);
  };

  const completedReservations = reservations.filter(
    (res) => res.status === 'COMPLETED'
  );
  const pendingReservations = reservations.filter(
    (res) => res.status !== 'COMPLETED'
  );

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '720px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        background: '#f8f8f8',
        minHeight: '100vh',
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '30px',
          textAlign: 'left',
          color: '#333',
        }}
      >
        이용 내역
      </h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          예약 내역을 불러오는 중...
        </div>
      )}
      {error && (
        <div
          style={{
            backgroundColor: '#ffe6e6',
            color: '#cc0000',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}
      {!loading && reservations.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          이용 내역이 없습니다.
        </div>
      )}

      {pendingReservations.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#333',
            }}
          >
            예약 완료
          </h3>
          {pendingReservations.map((reservation) => (
            <div
              key={reservation.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => handleItemClick(reservation.id)}
            >
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
                  <Home size={28} color="#247cff" />
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
              <div
                style={{
                  textAlign: 'right',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ChevronRight size={20} color="#888" />
              </div>
            </div>
          ))}
        </div>
      )}

      {completedReservations.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#333',
            }}
          >
            방문 완료
          </h3>
          {completedReservations.map((reservation) => (
            <div
              key={reservation.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => handleItemClick(reservation.id)}
            >
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
                  <WashingMachine size={28} color="#247cff" />
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
              <div
                style={{
                  textAlign: 'right',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ChevronRight size={20} color="#888" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationHistoryPage;
