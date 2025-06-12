import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, User } from 'lucide-react';
import * as reviewApi from '../api';
import { useAuthStore } from '../../../stores/authStore';
import { useCustomerReservation } from '../../reservation/hooks/useCustomerAPI.js';
import { format } from 'date-fns';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';

const ReviewWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { getReservationById } = useCustomerReservation();

  const queryParams = new URLSearchParams(location.search);
  const initialReservationId = queryParams.get('reservationId') || '';
  const initialTargetId = queryParams.get('targetId') || '';

  const [targetId, setTargetId] = useState(
    initialTargetId ? Number(initialTargetId) : null
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reservationId] = useState(
    initialReservationId ? Number(initialReservationId) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservationDetails, setReservationDetails] = useState(null);

  // UserReservationDetail과 동일한 서비스 이름 매핑 함수
  const getServiceName = (subOptionId, subOptionName, backendData) => {
    // 1. 백엔드에서 받은 subOptionName 우선 사용
    if (subOptionName) return subOptionName;

    // 2. backendData에서 서비스 이름 찾기
    if (backendData?.subOptionName) return backendData.subOptionName;
    if (backendData?.serviceName) return backendData.serviceName;
    if (backendData?.type) return backendData.type;

    // 3. subOptionId로 매핑
    const serviceMapping = {
      1: '빨래/세탁',
      2: '청소',
      3: '육아',
    };

    if (subOptionId && serviceMapping[subOptionId]) {
      return serviceMapping[subOptionId];
    }

    return '청소';
  };

  // UserReservationDetail과 동일한 시간 포맷팅 함수
  const formatTimeRange = (startTime, durationMinutes = 180) => {
    if (!startTime) return '09:00 ~ 12:00';

    const timeStr = startTime.includes(':')
      ? startTime.substring(0, 5)
      : startTime;

    if (!durationMinutes) return timeStr;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;

    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    return `${timeStr} ~ ${endTime}`;
  };

  useEffect(() => {
    const fetchReservationDetails = async () => {
      if (!reservationId) {
        setError('예약 ID가 제공되지 않았습니다.');
        return;
      }

      // 기본 예약 정보를 먼저 설정 (즉시 UI 표시)
      const defaultReservation = {
        id: reservationId,
        serviceName: '청소',
        requestedDate: new Date().toISOString().split('T')[0],
        requestedTime: '09:00 ~ 12:00',
        managerName: '매니저', // TODO: 실제 매니저 이름으로 변경 필요
        customerId: 1,
        managerId: 13, // TODO: 실제 매니저 ID로 변경 필요 (현재 임시값)
        customerName: '고객님', // TODO: 실제 고객 이름으로 변경 필요
      };
      setReservationDetails(defaultReservation);

      // 기본 targetId 설정
      // 백엔드에서 실제 매니저 ID를 받아올 예정
      if (user?.role === 'ROLE_CUSTOMER') {
        // 고객이 매니저를 평가하는 경우 - 백엔드에서 받아올 때까지 임시값
        setTargetId(13);
      } else if (user?.role === 'ROLE_MANAGER') {
        // 매니저가 고객을 평가하는 경우
        setTargetId(initialTargetId ? Number(initialTargetId) : 1);
      }

      try {
        // 백그라운드에서 실제 데이터 로딩
        const backendReservation = await getReservationById(reservationId);

        if (backendReservation) {
          // 실제 데이터로 업데이트
          const transformedReservation = {
            id:
              backendReservation.id ||
              backendReservation.reservationId ||
              reservationId,
            serviceName: getServiceName(
              backendReservation.subOptionId,
              backendReservation.subOptionName,
              backendReservation
            ),
            requestedDate:
              backendReservation.requestedDate ||
              backendReservation.date ||
              defaultReservation.requestedDate,
            requestedTime: formatTimeRange(
              backendReservation.requestedTime || backendReservation.time,
              backendReservation.totalDuration || 180
            ),
            managerName: backendReservation.managerName || '매니저',
            customerId: backendReservation.customerId || 1,
            managerId: backendReservation.managerId || 13,
            customerName: backendReservation.customerName || '고객님',
          };

          setReservationDetails(transformedReservation);

          // 실제 targetId 업데이트
          if (user?.role === 'ROLE_CUSTOMER' && backendReservation.managerId) {
            // 고객이 매니저를 평가하는 경우 - 백엔드에서 받은 실제 매니저ID 사용
            setTargetId(backendReservation.managerId);
          } else if (
            user?.role === 'ROLE_MANAGER' &&
            backendReservation.customerId
          ) {
            // 매니저가 고객을 평가하는 경우
            setTargetId(backendReservation.customerId);
          }
        }
      } catch (err) {
        console.error('예약 상세 조회 에러:', err);
        // 에러가 발생해도 기본 데이터로 계속 진행
        // 심각한 에러가 아닌 경우 사용자에게 알리지 않음
        if (err.message.includes('401') || err.message.includes('403')) {
          setError('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
        }
      }
    };

    fetchReservationDetails();
  }, [reservationId, user, getReservationById, initialTargetId]);

  const formatServiceDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) {
      return '정보 없음';
    }
    try {
      // 시간 범위가 포함된 경우 시작 시간만 추출
      const startTime = timeString.includes('~')
        ? timeString.split('~')[0].trim()
        : timeString;
      const dateTimeString = `${dateString}T${startTime}:00`;
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        return `${dateString} ${timeString}`;
      }
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (e) {
      console.error('서비스 날짜/시간 포맷팅 오류:', e);
      return `${dateString} ${timeString}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 빠른 validation 체크
    if (!targetId) {
      setError('리뷰 대상자를 입력해주세요.');
      return;
    }
    if (rating === 0) {
      setError('평점을 선택해주세요.');
      return;
    }
    if (comment.length < 10) {
      setError('리뷰 내용은 10자 이상 작성해주세요.');
      return;
    }
    if (!reservationId) {
      setError('예약 ID는 필수입니다.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reviewData = {
        targetId,
        rating,
        comment,
        reservationId,
      };

      await reviewApi.createReview(reviewData);
      setSuccess('리뷰가 성공적으로 작성되었습니다!');

      // 성공 시 페이지 이동 시간 단축 (1.5초 → 1초)
      setTimeout(() => {
        navigate('/customer/reservations');
      }, 1000);
    } catch (err) {
      console.error('리뷰 작성 에러:', err);

      // 인증 에러인 경우 로그인 페이지로 리다이렉트
      if (
        err.message.includes('JWT_TOKEN_INVALID') ||
        err.message.includes('BACKEND_AUTH_ERROR') ||
        err.message.includes('401') ||
        err.message.includes('403')
      ) {
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        setTimeout(() => {
          navigate('/auth/signin');
        }, 1500); // 인증 에러 시에도 시간 단축
        return;
      }

      setError(err.message || '리뷰 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reservationDetails) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          position: 'relative',
        }}
      >
        <Header
          showBackButton={true}
          onBackClick={() => navigate(-1)}
          title="리뷰 작성"
        />
        <div
          style={{
            paddingTop: '80px',
            textAlign: 'center',
            padding: '80px 20px 20px 20px',
            fontSize: '16px',
            color: '#666',
          }}
        >
          처리 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: '#fff3f3',
          color: '#dc3545',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '25px',
          textAlign: 'center',
          fontWeight: 'bold',
          border: '1px solid #f5c6cb',
        }}
      >
        {error}
      </div>
    );
  }

  if (success) {
    return (
      <div
        className="review-write-page"
        style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}
      >
        <Header showBackButton={true} />
        <div
          className="page-content-wrapper"
          style={{ paddingTop: '64px', paddingBottom: '80px' }}
        >
          <div
            className="review-container"
            style={{ maxWidth: '512px', margin: '0 auto', padding: '20px' }}
          >
            <div
              style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #c3e6cb',
                fontSize: '16px',
              }}
            >
              ✅ {success}
            </div>
            <div
              style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}
            >
              잠시 후 예약 목록 페이지로 이동합니다...
            </div>
          </div>
        </div>
        <Footer current="/customer/review/write" />
      </div>
    );
  }

  // UI 렌더링
  const renderCustomerReviewUI = () => (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        maxWidth: '100%',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <h3
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        서비스 리뷰 작성
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: '#6c757d',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        서비스 완료 후 서비스에 대한 평가를 남겨주세요
      </p>

      {/* 서비스 정보 (Figma Mobile View 참조) */}
      <div
        style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e0e0e0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#555', fontWeight: 'normal' }}>
            매니저명
          </p>
          <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
            {reservationDetails?.managerName || '매니저 정보 없음'}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#555', fontWeight: 'normal' }}>
            서비스 유형
          </p>
          <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
            {reservationDetails?.serviceName || '서비스 정보 없음'}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '16px', color: '#555', fontWeight: 'normal' }}>
            서비스 일시
          </p>
          <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
            {formatServiceDateTime(
              reservationDetails?.requestedDate,
              reservationDetails?.requestedTime
            ) || '2023-06-15 14:00'}
          </p>
        </div>
      </div>

      {/* 서비스 만족도 평가 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '25px',
        }}
      >
        <label
          style={{
            marginBottom: '15px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '18px',
          }}
        >
          서비스 만족도 평가
        </label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={40}
              fill={rating >= star ? '#FFC107' : 'none'}
              color="#FFC107"
              onClick={() => setRating(star)}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            />
          ))}
        </div>
        {/* <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{rating.toFixed(1)} / 5.0</p> */}
      </div>

      {/* 서비스 코멘트 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '40px',
        }}
      >
        <label
          htmlFor="comment"
          style={{
            marginBottom: '15px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '18px',
          }}
        >
          서비스 코멘트
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="6"
          required
          minLength="10"
          style={{
            padding: '15px',
            border: '1px solid #ced4da',
            borderRadius: '8px',
            fontSize: '16px',
            resize: 'vertical',
            minHeight: '150px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
            borderColor: error.includes('리뷰 내용은') ? '#dc3545' : '#ced4da',
            outline: 'none',
            transition:
              'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            backgroundColor: '#f8f9fa',
          }}
          placeholder="서비스에 대한 코멘트를 남겨주세요."
        ></textarea>
      </div>

      {/* 예약 ID, 리뷰 대상자 ID (숨김) */}
      <input type="hidden" value={reservationId || ''} />
      <input type="hidden" value={targetId || ''} />

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '16px 25px',
          backgroundColor: '#247cff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'background-color 0.3s ease, transform 0.2s ease-in-out',
          width: '100%',
          marginTop: '0',
        }}
        onMouseEnter={(e) =>
          !loading && (e.currentTarget.style.backgroundColor = '#1a6cdb')
        }
        onMouseLeave={(e) =>
          !loading && (e.currentTarget.style.backgroundColor = '#247cff')
        }
      >
        {loading ? '평가 제출 중...' : '평가 제출하기'}
      </button>
    </form>
  );

  const renderManagerReviewUI = () => (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        maxWidth: '100%',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <h3
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        고객 리뷰 작성
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: '#6c757d',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        서비스 완료 후 고객에 대한 평가를 남겨주세요
      </p>

      {/* 고객 정보 (Figma Customer Rating 참조) */}
      <div
        style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e0e0e0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#555', fontWeight: 'normal' }}>
            고객명
          </p>
          <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
            {reservationDetails?.customerName || '고객 정보 없음'}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#555', fontWeight: 'normal' }}>
            서비스 유형
          </p>
          <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
            {reservationDetails?.serviceName || '서비스 정보 없음'}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '16px', color: '#555', fontWeight: 'normal' }}>
            서비스 일시
          </p>
          <p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
            {formatServiceDateTime(
              reservationDetails?.requestedDate,
              reservationDetails?.requestedTime
            ) || '2023-06-15 14:00'}
          </p>
        </div>
      </div>

      {/* 고객 만족도 평가 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '25px',
        }}
      >
        <label
          style={{
            marginBottom: '15px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '18px',
          }}
        >
          고객 만족도 평가
        </label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={40}
              fill={rating >= star ? '#FFC107' : 'none'}
              color="#FFC107"
              onClick={() => setRating(star)}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            />
          ))}
        </div>
        {/* <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{rating.toFixed(1)} / 5.0</p> */}
      </div>

      {/* 코멘트 (비공개) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '40px',
        }}
      >
        <label
          htmlFor="comment"
          style={{
            marginBottom: '15px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '18px',
          }}
        >
          코멘트 (비공개)
          <span
            style={{
              fontSize: '14px',
              fontWeight: 'normal',
              color: '#6c757d',
              marginLeft: '10px',
            }}
          >
            관리자만 볼 수 있음
          </span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="6"
          required
          minLength="10"
          style={{
            padding: '15px',
            border: '1px solid #ced4da',
            borderRadius: '8px',
            fontSize: '16px',
            resize: 'vertical',
            minHeight: '150px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
            borderColor: error.includes('리뷰 내용은') ? '#dc3545' : '#ced4da',
            outline: 'none',
            transition:
              'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            backgroundColor: '#f8f9fa',
          }}
          placeholder="고객에 대한 코멘트를 남겨주세요. 이 내용은 다른 매니저만 볼 수 있습니다."
        ></textarea>
      </div>

      {/* 예약 ID, 리뷰 대상자 ID (숨김) */}
      <input type="hidden" value={reservationId || ''} />
      <input type="hidden" value={targetId || ''} />

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '16px 25px',
          backgroundColor: '#247cff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'background-color 0.3s ease, transform 0.2s ease-in-out',
          width: '100%',
          marginTop: '0',
        }}
        onMouseEnter={(e) =>
          !loading && (e.currentTarget.style.backgroundColor = '#1a6cdb')
        }
        onMouseLeave={(e) =>
          !loading && (e.currentTarget.style.backgroundColor = '#247cff')
        }
      >
        {loading ? '평가 제출 중...' : '평가 제출하기'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen">
      <Header
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        title="리뷰 작성"
      />
      <div
        style={{
          paddingTop: '64px', // 헤더 높이만큼 패딩
          paddingBottom: '80px', // 푸터 높이만큼 패딩
          maxWidth: '512px', // 모바일 최대 너비
          margin: '0 auto', // 중앙 정렬
          minHeight: '100vh',
          backgroundColor: '#ffffff', // 회색에서 화이트로 변경
          boxSizing: 'border-box',
        }}
      >
        <div style={{ padding: '20px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fff3f3',
                color: '#dc3545',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '25px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #f5c6cb',
              }}
            >
              {error}
            </div>
          )}

          {/* 예약 정보가 없고 심각한 에러가 있는 경우에만 UI 차단 */}
          {!reservationDetails &&
          error &&
          error.includes('예약 ID가 제공되지 않았습니다') ? (
            <div
              style={{
                textAlign: 'center',
                color: '#cc0000',
                padding: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              잘못된 접근입니다. 예약 목록에서 다시 시도해주세요.
            </div>
          ) : (
            <>
              {user?.role === 'ROLE_CUSTOMER' && renderCustomerReviewUI()}
              {user?.role === 'ROLE_MANAGER' && renderManagerReviewUI()}
              {(!user?.role ||
                (user?.role !== 'ROLE_CUSTOMER' &&
                  user?.role !== 'ROLE_MANAGER')) && (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#cc0000',
                    padding: '30px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  리뷰 작성 권한이 없습니다.
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer current="/customer/review" />
    </div>
  );
};

export default ReviewWritePage;
