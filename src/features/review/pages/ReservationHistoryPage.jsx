import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, WashingMachine, ChevronRight } from 'lucide-react';
import { format } from 'date-fns'; // 날짜 포맷팅 (npm install date-fns)
import { ko } from 'date-fns/locale'; // 한국어 로케일 임포트
import { getCustomerReservations } from '../ReservationApi';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';

const ReservationHistoryPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/customer/mypage');
  };

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
    // 리뷰 상세 페이지로 이동 (수요자 경로로 수정)
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
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={handleBack} />

      <main className="px-6 py-6" style={{ paddingTop: '80px' }}>
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">리뷰 관리</h2>
        </div>

        {loading && (
          <div className="text-center py-6">예약 내역을 불러오는 중...</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}
        {!loading && reservations.length === 0 && !error && (
          <div className="text-center py-6 text-gray-600">
            이용 내역이 없습니다.
          </div>
        )}

        {pendingReservations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">예약 완료</h3>
            {pendingReservations.map((reservation) => (
              <div
                key={reservation.id}
                onClick={() => handleItemClick(reservation.id)}
                className="bg-white rounded-xl p-5 mb-4 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">
                      {reservation.subOptionName || '서비스 이름 없음'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {formatDateTime(
                        reservation.requestedDate,
                        reservation.requestedTime,
                        reservation.totalDuration
                      )}
                    </p>
                    <p className="font-bold text-gray-900">
                      {formatPrice(reservation.totalPrice)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}

        {completedReservations.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">이용 완료</h3>
            {completedReservations.map((reservation) => (
              <div
                key={reservation.id}
                onClick={() => handleItemClick(reservation.id)}
                className="bg-white rounded-xl p-5 mb-4 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                    <WashingMachine className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">
                      {reservation.subOptionName || '서비스 이름 없음'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {formatDateTime(
                        reservation.requestedDate,
                        reservation.requestedTime,
                        reservation.totalDuration
                      )}
                    </p>
                    <p className="font-bold text-gray-900">
                      {formatPrice(reservation.totalPrice)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default ReservationHistoryPage;
