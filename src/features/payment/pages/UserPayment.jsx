import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserPayment.css';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import useReservationStore from '../../../stores/reservationStore.js';
import { usePaymentData } from '../../reservation/hooks/useLocalStorage.js';
import { api } from '../../../api/config/api.js';
import { useAuthStore } from '../../../stores/authStore.js';

const UserPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  // zustand store에서 예약 데이터 가져오기
  const { reservationData, getSelectedServicesWithDetails } =
    useReservationStore();
  const selectedServices = getSelectedServicesWithDetails();

  // localStorage에서 결제 데이터 가져오기
  const { paymentData: savedPaymentData } = usePaymentData();

  // URL state에서 예약 정보 가져오기 (예약 상세에서 전달받은 경우)
  const reservationFromDetail = location.state?.reservation || null;

  // 결제 데이터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (
      !savedPaymentData &&
      reservationData.selectedServices.length === 0 &&
      !reservationFromDetail
    ) {
      alert('결제 정보가 없습니다.');
      navigate('/');
    }
  }, [savedPaymentData, reservationData, navigate, reservationFromDetail]);

  // 실제 예약 정보 상태 관리
  const [actualReservationData, setActualReservationData] = useState(null);
  const [managerInfo, setManagerInfo] = useState(null);

  // 매니저 정보 조회
  const fetchManagerInfo = async (managerId) => {
    if (!managerId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:8080';

      if (!token) {
        console.warn('토큰이 없어 매니저 정보 조회 불가');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/managers/${managerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ 매니저 정보 조회 성공:', result.data);
          setManagerInfo(result.data);
          return result.data;
        }
      } else {
        console.warn('매니저 정보 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('매니저 정보 조회 에러:', error);
    }
    return null;
  };

  // 실제 예약 정보 조회
  const fetchReservationData = async (reservationId) => {
    if (!reservationId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:8080';

      if (!token) {
        console.warn('토큰이 없어 예약 정보 조회 불가');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/reservations/${reservationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ 실제 예약 정보 조회 성공:', result.data);
          setActualReservationData(result.data);

          // 매니저 ID가 있으면 매니저 정보도 조회
          if (result.data.managerId) {
            await fetchManagerInfo(result.data.managerId);
          }
        }
      } else {
        console.warn('예약 정보 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('예약 정보 조회 에러:', error);
    }
  };

  // 예약 ID가 있을 때 실제 예약 정보 조회
  useEffect(() => {
    const reservationId =
      reservationFromDetail?.id ||
      reservationData.reservationId ||
      location.state?.reservation?.id ||
      location.state?.reservation?.reservationId;

    if (reservationId) {
      console.log('🔍 예약 정보 조회 시작:', reservationId);
      fetchReservationData(reservationId);
    }
  }, [reservationFromDetail, reservationData, location.state]);

  // ⭐️ 디버깅용: 전달받은 데이터 확인
  useEffect(() => {
    console.log('🔍 UserPayment 페이지 데이터 확인:');
    console.log('📋 예약 상세에서 전달받은 데이터:', reservationFromDetail);
    console.log('🏪 Zustand 스토어 데이터:', {
      reservationData,
      selectedServices,
    });
    console.log('💾 localStorage 저장된 데이터:', savedPaymentData);
    console.log('🎯 실제 조회된 예약 데이터:', actualReservationData);
  }, [
    reservationFromDetail,
    reservationData,
    selectedServices,
    savedPaymentData,
    actualReservationData,
  ]);

  // Card formatting functions
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field, value) => {
    setCardInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ⭐️ 결제 데이터 생성 (useMemo로 최적화)
  const paymentData = useMemo(
    () => ({
      serviceInfo: {
        dateTime: (() => {
          // 다양한 소스에서 날짜와 시간 데이터 찾기
          console.log('🔍 날짜/시간 데이터 소스 확인:', {
            actualReservationData: actualReservationData,
            reservationFromDetail: reservationFromDetail,
            reservationData: reservationData,
            savedPaymentData: savedPaymentData,
            locationState: location.state,
          });

          // 0. 실제 백엔드 예약 데이터 최우선 확인 (startTime 우선 처리)
          if (actualReservationData) {
            console.log('🔍 백엔드 예약 데이터 전체:', actualReservationData);

            // startTime 우선 확인 (ISO 8601 형식으로 날짜+시간 모두 포함)
            if (actualReservationData.startTime) {
              const startTime = actualReservationData.startTime;
              console.log('🎯 백엔드 startTime 발견:', startTime);

              // startTime이 ISO 8601 형식인 경우 (예: "2025-07-14T10:00:00")
              if (startTime.includes('T')) {
                const dateObj = new Date(startTime);
                if (!isNaN(dateObj.getTime())) {
                  const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
                  const formattedTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                  console.log(
                    '🎯 백엔드 startTime ISO 형식 처리 결과:',
                    `${formattedDate} ${formattedTime}`
                  );
                  return `${formattedDate} ${formattedTime}`;
                }
              }
              // startTime이 시간만 있는 경우 (예: "14:00")
              else if (startTime.includes(':')) {
                let timeStr = startTime;
                if (timeStr.includes('~')) {
                  timeStr = timeStr.split('~')[0].trim();
                }

                // 날짜 정보를 다른 곳에서 찾아서 조합
                const reservedDate =
                  actualReservationData.scheduledDate ||
                  actualReservationData.serviceDate ||
                  actualReservationData.reservationDate ||
                  actualReservationData.date ||
                  actualReservationData.selectedDate;

                if (reservedDate) {
                  const dateObj = new Date(reservedDate);
                  if (!isNaN(dateObj.getTime())) {
                    const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
                    console.log(
                      '🎯 백엔드 시간+날짜 조합 결과:',
                      `${formattedDate} ${timeStr}`
                    );
                    return `${formattedDate} ${timeStr}`;
                  }
                }

                // 날짜 정보가 없으면 오늘 날짜로 처리
                const today = new Date();
                const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
                console.log(
                  '🎯 백엔드 오늘 날짜 + 시간 조합:',
                  `${todayStr} ${timeStr}`
                );
                return `${todayStr} ${timeStr}`;
              }
            }

            // 기존 방식: 별도의 date, time 필드 확인
            const date =
              actualReservationData.scheduledDate ||
              actualReservationData.serviceDate ||
              actualReservationData.reservationDate ||
              actualReservationData.date ||
              actualReservationData.requestedDate ||
              actualReservationData.selectedDate ||
              actualReservationData.workDate;

            const time =
              actualReservationData.scheduledTime ||
              actualReservationData.serviceTime ||
              actualReservationData.reservationTime ||
              actualReservationData.time ||
              actualReservationData.requestedTime ||
              actualReservationData.selectedTime ||
              actualReservationData.workTime ||
              actualReservationData.appointmentTime;

            console.log('🔍 백엔드 예약 데이터에서 별도 날짜/시간 필드:', {
              date,
              time,
            });

            if (date && time) {
              let formattedDate = date;
              if (typeof date === 'string' && date.includes('-')) {
                const dateObj = new Date(date + 'T00:00:00');
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = `${dateObj.getFullYear()}년 ${
                    dateObj.getMonth() + 1
                  }월 ${dateObj.getDate()}일`;
                }
              }

              let timeStr = String(time);
              if (timeStr.includes('~')) {
                timeStr = timeStr.split('~')[0].trim();
              }

              console.log(
                '🎯 백엔드 별도 필드 조합 결과:',
                `${formattedDate} ${timeStr}`
              );
              return `${formattedDate} ${timeStr}`;
            }

            if (date) {
              let formattedDate = date;
              if (typeof date === 'string' && date.includes('-')) {
                const dateObj = new Date(date + 'T00:00:00');
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = `${dateObj.getFullYear()}년 ${
                    dateObj.getMonth() + 1
                  }월 ${dateObj.getDate()}일`;
                }
              }
              console.log(
                '🎯 백엔드 날짜만 있는 경우:',
                `${formattedDate} 시간 미정`
              );
              return `${formattedDate} 시간 미정`;
            }
          }

          // 1. 예약 상세 페이지에서 전달받은 데이터 확인 (startTime 우선 처리)
          if (reservationFromDetail) {
            console.log(
              '🔍 예약 상세에서 전달받은 모든 데이터:',
              reservationFromDetail
            );

            // startTime 필드 우선 확인 (예약 상세에서 가장 정확한 시간 정보)
            if (reservationFromDetail.startTime) {
              const startTime = reservationFromDetail.startTime;
              console.log('🎯 startTime 발견:', startTime);

              // startTime이 ISO 8601 형식인 경우 (예: "2024-01-15T14:00:00")
              if (startTime.includes('T')) {
                const dateObj = new Date(startTime);
                if (!isNaN(dateObj.getTime())) {
                  const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
                  const formattedTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                  console.log(
                    '🎯 ISO 형식 처리 결과:',
                    `${formattedDate} ${formattedTime}`
                  );
                  return `${formattedDate} ${formattedTime}`;
                }
              }
              // startTime이 시간만 있는 경우 (예: "14:00")
              else if (startTime.includes(':')) {
                let timeStr = startTime;
                if (timeStr.includes('~')) {
                  timeStr = timeStr.split('~')[0].trim();
                }

                // 날짜 정보를 다른 곳에서 찾아서 조합
                const reservedDate =
                  reservationFromDetail.createdAt ||
                  reservationFromDetail.date ||
                  reservationFromDetail.serviceDate ||
                  reservationFromDetail.reservationDate ||
                  reservationFromDetail.scheduledDate ||
                  reservationFromDetail.backendData?.reservedDate ||
                  reservationFromDetail.backendData?.serviceDate;

                if (reservedDate) {
                  const dateObj = new Date(reservedDate);
                  if (!isNaN(dateObj.getTime())) {
                    const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
                    console.log(
                      '🎯 시간+날짜 조합 결과:',
                      `${formattedDate} ${timeStr}`
                    );
                    return `${formattedDate} ${timeStr}`;
                  }
                }

                // 날짜 정보가 없으면 오늘 날짜로 처리
                const today = new Date();
                const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
                console.log(
                  '🎯 오늘 날짜 + 시간 조합:',
                  `${todayStr} ${timeStr}`
                );
                return `${todayStr} ${timeStr}`;
              }
            }

            // 백엔드 데이터에서 startTime 확인
            if (reservationFromDetail.backendData?.startTime) {
              const startTime = reservationFromDetail.backendData.startTime;
              console.log('🎯 백엔드 데이터의 startTime 발견:', startTime);

              if (startTime.includes('T')) {
                const dateObj = new Date(startTime);
                if (!isNaN(dateObj.getTime())) {
                  const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
                  const formattedTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                  console.log(
                    '🎯 백엔드 ISO 형식 처리 결과:',
                    `${formattedDate} ${formattedTime}`
                  );
                  return `${formattedDate} ${formattedTime}`;
                }
              } else if (startTime.includes(':')) {
                let timeStr = startTime;
                if (timeStr.includes('~')) {
                  timeStr = timeStr.split('~')[0].trim();
                }

                const reservedDate =
                  reservationFromDetail.backendData.reservedDate ||
                  reservationFromDetail.backendData.serviceDate ||
                  reservationFromDetail.createdAt;

                if (reservedDate) {
                  const dateObj = new Date(reservedDate);
                  if (!isNaN(dateObj.getTime())) {
                    const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
                    console.log(
                      '🎯 백엔드 시간+날짜 조합 결과:',
                      `${formattedDate} ${timeStr}`
                    );
                    return `${formattedDate} ${timeStr}`;
                  }
                }

                const today = new Date();
                const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
                console.log(
                  '🎯 백엔드 오늘 날짜 + 시간 조합:',
                  `${todayStr} ${timeStr}`
                );
                return `${todayStr} ${timeStr}`;
              }
            }

            // 기존 방식: 별도의 date, time 필드 확인
            const date =
              reservationFromDetail.date ||
              reservationFromDetail.serviceDate ||
              reservationFromDetail.reservationDate ||
              reservationFromDetail.scheduledDate;
            const time =
              reservationFromDetail.time ||
              reservationFromDetail.serviceTime ||
              reservationFromDetail.reservationTime ||
              reservationFromDetail.scheduledTime;

            console.log('🔍 기존 방식 날짜/시간 확인:', {
              date,
              time,
            });

            if (date && time) {
              let formattedDate = date;
              if (typeof date === 'string' && date.includes('-')) {
                const dateObj = new Date(date + 'T00:00:00');
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = `${dateObj.getFullYear()}년 ${
                    dateObj.getMonth() + 1
                  }월 ${dateObj.getDate()}일`;
                }
              }

              let timeStr = String(time);
              if (timeStr.includes('~')) {
                timeStr = timeStr.split('~')[0].trim();
              }

              console.log('🎯 기존 방식 결과:', `${formattedDate} ${timeStr}`);
              return `${formattedDate} ${timeStr}`;
            }

            if (date) {
              let formattedDate = date;
              if (typeof date === 'string' && date.includes('-')) {
                const dateObj = new Date(date + 'T00:00:00');
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = `${dateObj.getFullYear()}년 ${
                    dateObj.getMonth() + 1
                  }월 ${dateObj.getDate()}일`;
                }
              }
              console.log('🎯 날짜만 있는 경우:', `${formattedDate} 시간 미정`);
              return `${formattedDate} 시간 미정`;
            }
          }

          // 1. location.state에서 직접 전달된 날짜/시간 확인
          if (
            location.state?.reservation?.date &&
            location.state?.reservation?.time
          ) {
            const date = location.state.reservation.date;
            const time = location.state.reservation.time;

            console.log('🔍 location.state.reservation에서 날짜/시간:', {
              date,
              time,
            });

            let formattedDate = date;
            if (typeof date === 'string' && date.includes('-')) {
              const dateObj = new Date(date + 'T00:00:00');
              if (!isNaN(dateObj.getTime())) {
                formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
              }
            }

            let timeStr = String(time);
            if (timeStr.includes('~')) {
              timeStr = timeStr.split('~')[0].trim();
            }

            return `${formattedDate} ${timeStr}`;
          }

          if (location.state?.date && location.state?.time) {
            const date = location.state.date;
            const time = location.state.time;

            console.log('🔍 location.state에서 날짜/시간:', { date, time });

            let formattedDate = date;
            if (typeof date === 'string' && date.includes('-')) {
              const dateObj = new Date(date + 'T00:00:00');
              if (!isNaN(dateObj.getTime())) {
                formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
              }
            }

            let timeStr = String(time);
            if (timeStr.includes('~')) {
              timeStr = timeStr.split('~')[0].trim();
            }

            return `${formattedDate} ${timeStr}`;
          }

          // 2. reservationData 확인 (예약 페이지에서 직접 전달된 데이터)
          if (reservationData.selectedDate && reservationData.selectedTime) {
            const date = reservationData.selectedDate;
            const time = reservationData.selectedTime;

            console.log('🔍 reservationData에서 날짜/시간:', { date, time });

            let formattedDate = date;
            if (typeof date === 'string' && date.includes('-')) {
              const dateObj = new Date(date + 'T00:00:00');
              if (!isNaN(dateObj.getTime())) {
                formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
              }
            }

            let timeStr = String(time);
            if (timeStr.includes('~')) {
              timeStr = timeStr.split('~')[0].trim();
            }

            return `${formattedDate} ${timeStr}`;
          }

          // 3. 예약 상세에서 전달받은 기타 데이터 확인
          if (reservationFromDetail) {
            // 백엔드 데이터에서 날짜/시간 정보 확인
            const backendData = reservationFromDetail.backendData?.data;
            if (backendData) {
              console.log('🔍 백엔드 데이터 확인:', backendData);
              // 백엔드에서 가능한 날짜/시간 필드들 확인
              const date =
                backendData.reservationDate ||
                backendData.serviceDate ||
                backendData.date ||
                backendData.startDate;
              const time =
                backendData.reservationTime ||
                backendData.serviceTime ||
                backendData.time ||
                backendData.startTime;

              if (date && time) {
                const timeStr = time.includes('~') ? time.split('~')[0] : time;
                return `${date} ${timeStr}`;
              }
              if (date) {
                return `${date} 시간 미정`;
              }
            }

            // 프론트엔드 데이터에서 날짜/시간 정보 확인
            const date =
              reservationFromDetail.date ||
              reservationFromDetail.reservationDate ||
              reservationFromDetail.serviceDate;
            const time =
              reservationFromDetail.time ||
              reservationFromDetail.startTime || // startTime 추가
              reservationFromDetail.reservationTime ||
              reservationFromDetail.serviceTime;

            if (date && time && time !== undefined) {
              const timeStr = time.includes('~') ? time.split('~')[0] : time;
              return `${date} ${timeStr}`;
            }
            if (date) {
              return `${date} 시간 미정`;
            }

            // createdAt을 이용해 생성일 표시 (서비스 날짜가 없는 경우)
            if (reservationFromDetail.createdAt) {
              const createdDate = new Date(reservationFromDetail.createdAt);
              const formattedDate = createdDate.toLocaleDateString('ko-KR');
              return `${formattedDate}`;
            }
          }

          // 2. reservationData에서 날짜와 시간 찾기
          if (
            reservationData.reservationDate &&
            reservationData.reservationTime
          ) {
            return `${reservationData.reservationDate} ${reservationData.reservationTime}`;
          }
          if (reservationData.selectedDate && reservationData.selectedTime) {
            return `${reservationData.selectedDate} ${reservationData.selectedTime}`;
          }
          if (reservationData.date && reservationData.time) {
            return `${reservationData.date} ${reservationData.time}`;
          }

          // 3. savedPaymentData에서 날짜와 시간 찾기
          if (
            savedPaymentData?.serviceInfo?.date &&
            savedPaymentData?.serviceInfo?.time
          ) {
            return `${savedPaymentData.serviceInfo.date} ${savedPaymentData.serviceInfo.time}`;
          }
          if (savedPaymentData?.date && savedPaymentData?.time) {
            return `${savedPaymentData.date} ${savedPaymentData.time}`;
          }

          // 4. location.state에서 추가 데이터 확인
          if (location.state?.date && location.state?.time) {
            return `${location.state.date} ${location.state.time}`;
          }

          // 5. 기본값 반환
          console.warn('⚠️ 날짜/시간 데이터를 찾을 수 없어 기본값 사용');
          return '서비스 일정 미정';
        })(),
        serviceType: (() => {
          // 다양한 소스에서 서비스 타입 찾기
          console.log('🔍 서비스 타입 데이터 소스 확인:', {
            actualReservationData: actualReservationData,
            'reservationFromDetail?.type': reservationFromDetail?.type,
            'reservationData.serviceTitle': reservationData.serviceTitle,
            'reservationData.selectedSubOption':
              reservationData.selectedSubOption,
            'savedPaymentData?.serviceInfo': savedPaymentData?.serviceInfo,
          });

          // 0. 실제 백엔드 예약 데이터 우선 사용
          if (actualReservationData) {
            const serviceType =
              actualReservationData.serviceName ||
              actualReservationData.serviceType ||
              actualReservationData.title ||
              actualReservationData.name;
            if (serviceType) return serviceType;

            // 서비스 목록에서 첫 번째 서비스 이름 가져오기
            if (
              actualReservationData.services &&
              actualReservationData.services.length > 0
            ) {
              return (
                actualReservationData.services[0].serviceName ||
                actualReservationData.services[0].name
              );
            }
          }

          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          if (reservationFromDetail?.type) return reservationFromDetail.type;
          if (reservationFromDetail?.serviceType)
            return reservationFromDetail.serviceType;
          if (reservationFromDetail?.serviceName)
            return reservationFromDetail.serviceName;

          // 2. reservationData에서 서비스 타입 찾기
          if (reservationData.serviceTitle) return reservationData.serviceTitle;
          if (reservationData.selectedSubOption?.name)
            return reservationData.selectedSubOption.name;
          if (reservationData.serviceName) return reservationData.serviceName;
          if (reservationData.serviceType) return reservationData.serviceType;

          // 3. savedPaymentData에서 서비스 타입 찾기
          if (savedPaymentData?.serviceInfo?.type)
            return savedPaymentData.serviceInfo.type;
          if (savedPaymentData?.serviceInfo?.subOptionName)
            return savedPaymentData.serviceInfo.subOptionName;
          if (savedPaymentData?.serviceInfo?.serviceName)
            return savedPaymentData.serviceInfo.serviceName;

          // 4. location.state에서 추가 데이터 확인
          if (location.state?.serviceType) return location.state.serviceType;
          if (location.state?.type) return location.state.type;

          // 5. 기본값 반환
          console.warn('⚠️ 서비스 타입 데이터를 찾을 수 없어 기본값 사용');
          return '청소 서비스';
        })(),
        manager: (() => {
          console.log('🔍 매니저 정보 소스 확인:', {
            reservationData: reservationData,
            locationState: location.state,
            actualReservationData: actualReservationData,
            managerInfo: managerInfo,
          });

          // 0. reservationData와 location.state에서 매니저 정보 우선 확인
          if (reservationData.managerName) {
            return reservationData.managerName;
          }

          if (location.state?.managerName) {
            return location.state.managerName;
          }

          if (location.state?.manager?.name) {
            return location.state.manager.name;
          }

          // 1. API로 조회한 매니저 정보 확인 (가장 정확한 정보)
          if (managerInfo) {
            const fetchedManagerName =
              managerInfo.name ||
              managerInfo.userName ||
              managerInfo.managerName ||
              managerInfo.fullName ||
              managerInfo.realName;

            if (fetchedManagerName) {
              return fetchedManagerName;
            }
          }

          // 2. 실제 예약 데이터에서 매니저 정보 조회
          if (actualReservationData) {
            // 매니저 이름 확인 (다양한 필드명 지원)
            const managerName =
              actualReservationData.managerName ||
              actualReservationData.manager?.name ||
              actualReservationData.manager?.userName ||
              actualReservationData.manager?.realName ||
              actualReservationData.assignedManagerName ||
              actualReservationData.matchedManagerName ||
              actualReservationData.acceptedManagerName;

            if (managerName) {
              return managerName;
            }

            // 매니저 ID만 있는 경우 (API 조회가 안된 경우의 대체값)
            if (actualReservationData.managerId) {
              return `매니저님`;
            }

            // 매칭 상태 확인
            if (
              actualReservationData.status === 'MATCHED' ||
              actualReservationData.status === 'ACCEPTED' ||
              actualReservationData.matchingStatus === 'MATCHED' ||
              actualReservationData.matchingStatus === 'ACCEPTED'
            ) {
              return '매니저 배정 완료';
            }

            return '매니저 배정 예정';
          }

          // 기존 로직 유지
          return '매니저 배정 예정';
        })(),
        reservationId: (() => {
          // 다양한 소스에서 예약 ID 찾기
          console.log('🔍 예약 ID 데이터 소스 확인:', {
            'reservationFromDetail?.id': reservationFromDetail?.id,
            'reservationFromDetail?.backendData?.data':
              reservationFromDetail?.backendData?.data,
            'savedPaymentData?.reservationId': savedPaymentData?.reservationId,
          });

          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          if (reservationFromDetail?.id) return reservationFromDetail.id;

          // 2. 백엔드 데이터에서 예약 ID 확인
          const backendData = reservationFromDetail?.backendData?.data;
          if (backendData?.id) return backendData.id;
          if (backendData?.reservationId) return backendData.reservationId;

          // 3. savedPaymentData에서 예약 ID 확인
          if (savedPaymentData?.reservationId)
            return savedPaymentData.reservationId;

          // 4. location.state에서 예약 ID 확인
          if (location.state?.reservationId)
            return location.state.reservationId;
          if (location.state?.id) return location.state.id;

          return null;
        })(),
        status: (() => {
          // 다양한 소스에서 상태 정보 찾기
          console.log('🔍 상태 데이터 소스 확인:', {
            'reservationFromDetail?.status': reservationFromDetail?.status,
            'reservationFromDetail?.backendData?.data':
              reservationFromDetail?.backendData?.data,
            'savedPaymentData?.status': savedPaymentData?.status,
          });

          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          if (reservationFromDetail?.status)
            return reservationFromDetail.status;

          // 2. 백엔드 데이터에서 상태 확인
          const backendData = reservationFromDetail?.backendData?.data;
          if (backendData?.status) return backendData.status;

          // 3. savedPaymentData에서 상태 확인
          if (savedPaymentData?.status) return savedPaymentData.status;

          // 4. 기본값
          return 'PENDING';
        })(),
        duration:
          reservationData.totalDuration || savedPaymentData?.duration || 180,
        // 추가 정보 (예약 상세에서 전달받은 경우)
        address: (() => {
          // 다양한 소스에서 주소 정보 찾기
          console.log('🔍 주소 데이터 소스 확인:', {
            actualReservationData: actualReservationData,
            'reservationFromDetail?.address': reservationFromDetail?.address,
            'reservationFromDetail?.backendData?.data':
              reservationFromDetail?.backendData?.data,
            'reservationData.address': reservationData.address,
          });

          // 0. 실제 백엔드 예약 데이터 우선 사용
          if (actualReservationData) {
            const address =
              actualReservationData.address ||
              actualReservationData.serviceAddress ||
              actualReservationData.location;
            if (address) return address;
          }

          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          if (reservationFromDetail?.address)
            return reservationFromDetail.address;

          // 2. 백엔드 데이터에서 주소 확인
          const backendData = reservationFromDetail?.backendData?.data;
          if (backendData?.address) return backendData.address;

          // 3. reservationData에서 주소 확인
          if (reservationData.address) return reservationData.address;

          return null;
        })(),
        addressDetail: (() => {
          // 다양한 소스에서 상세 주소 정보 찾기
          console.log('🔍 상세 주소 데이터 소스 확인:', {
            'reservationFromDetail?.addressDetail':
              reservationFromDetail?.addressDetail,
            'reservationFromDetail?.backendData?.data':
              reservationFromDetail?.backendData?.data,
            'reservationData.addressDetail': reservationData.addressDetail,
          });

          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          if (reservationFromDetail?.addressDetail)
            return reservationFromDetail.addressDetail;

          // 2. 백엔드 데이터에서 상세 주소 확인
          const backendData = reservationFromDetail?.backendData?.data;
          if (backendData?.addressDetail) return backendData.addressDetail;

          // 3. reservationData에서 상세 주소 확인
          if (reservationData.addressDetail)
            return reservationData.addressDetail;

          return null;
        })(),
      },
      priceList: (() => {
        // 다양한 소스에서 가격 목록 찾기
        console.log('🔍 가격 목록 데이터 소스 확인:', {
          actualReservationData: actualReservationData,
          reservationFromDetail: reservationFromDetail,
          'reservationData.serviceDetails': reservationData.serviceDetails,
          'selectedServices.length': selectedServices.length,
          'savedPaymentData?.priceList': savedPaymentData?.priceList,
        });

        // 0. 실제 백엔드 예약 데이터 우선 사용
        if (actualReservationData) {
          // 서비스 목록이 있는 경우
          if (
            actualReservationData.services &&
            actualReservationData.services.length > 0
          ) {
            return actualReservationData.services.map((service) => ({
              name: service.serviceName || service.name || '서비스',
              price: service.price || service.amount || 0,
            }));
          }

          // 단일 서비스 정보로 가격 목록 생성
          const serviceName =
            actualReservationData.serviceName ||
            actualReservationData.serviceType ||
            actualReservationData.title ||
            '서비스';
          const servicePrice =
            actualReservationData.totalPrice ||
            actualReservationData.price ||
            actualReservationData.amount ||
            0;

          if (serviceName && servicePrice > 0) {
            return [{ name: serviceName, price: servicePrice }];
          }
        }

        // 1. 예약 상세에서 전달받은 데이터가 있으면 단일 항목으로 표시
        if (reservationFromDetail) {
          const serviceName =
            reservationFromDetail.type ||
            reservationFromDetail.serviceType ||
            reservationFromDetail.serviceName ||
            '서비스';
          const servicePrice =
            reservationFromDetail.price ||
            reservationFromDetail.amount ||
            reservationFromDetail.totalAmount ||
            0;

          return [
            {
              name: serviceName,
              price: servicePrice,
            },
          ];
        }

        // 2. reservationData에서 서비스 상세 정보 사용
        if (
          reservationData.serviceDetails &&
          reservationData.serviceDetails.length > 0
        ) {
          return reservationData.serviceDetails.map((service) => ({
            name: service.name || service.serviceName || '서비스',
            price: service.price || service.amount || 0,
          }));
        }

        // 3. selectedServices 사용
        if (selectedServices.length > 0) {
          return selectedServices.map((service) => ({
            name: service.name || service.serviceName || '서비스',
            price: service.price || service.amount || 0,
          }));
        }

        // 4. savedPaymentData에서 가격 목록 사용
        if (
          savedPaymentData?.priceList &&
          savedPaymentData.priceList.length > 0
        ) {
          return savedPaymentData.priceList;
        }

        // 5. location.state에서 가격 목록 확인
        if (location.state?.priceList && location.state.priceList.length > 0) {
          return location.state.priceList;
        }

        // 6. 단일 서비스 정보로 가격 목록 생성
        if (reservationData.serviceTitle || reservationData.serviceName) {
          const serviceName =
            reservationData.serviceTitle || reservationData.serviceName;
          const servicePrice =
            reservationData.totalPrice || reservationData.amount || 0;

          return [
            {
              name: serviceName,
              price: servicePrice,
            },
          ];
        }

        // 7. 기본값 사용
        console.warn('⚠️ 가격 목록 데이터를 찾을 수 없어 기본값 사용');
        return [
          { name: '기본 요금', price: 80000 },
          { name: '찬대 물기기', price: 10000 },
          { name: '찬장 먼지 제거', price: 20000 },
          { name: '일반 배출', price: 20000 },
          { name: '음식물 배출', price: 25000 },
        ];
      })(),
      totalAmount: (() => {
        // 다양한 소스에서 총 금액 찾기
        console.log('🔍 총 금액 데이터 소스 확인:', {
          actualReservationData: actualReservationData,
          'reservationFromDetail?.price': reservationFromDetail?.price,
          'reservationData.totalPrice': reservationData.totalPrice,
          'savedPaymentData?.amount': savedPaymentData?.amount,
          'location.state?.amount': location.state?.amount,
        });

        // 0. 실제 백엔드 예약 데이터 우선 사용
        if (actualReservationData) {
          const amount =
            actualReservationData.totalPrice ||
            actualReservationData.price ||
            actualReservationData.amount ||
            actualReservationData.cost;
          if (amount) return amount;
        }

        // 1. 예약 상세에서 전달받은 데이터 우선 사용
        if (reservationFromDetail?.price) return reservationFromDetail.price;
        if (reservationFromDetail?.totalAmount)
          return reservationFromDetail.totalAmount;
        if (reservationFromDetail?.amount) return reservationFromDetail.amount;

        // 2. reservationData에서 총 가격 찾기
        if (reservationData.totalPrice) return reservationData.totalPrice;
        if (reservationData.totalAmount) return reservationData.totalAmount;
        if (reservationData.amount) return reservationData.amount;

        // 3. savedPaymentData에서 금액 찾기
        if (savedPaymentData?.amount) return savedPaymentData.amount;
        if (savedPaymentData?.totalAmount) return savedPaymentData.totalAmount;
        if (savedPaymentData?.price) return savedPaymentData.price;

        // 4. location.state에서 추가 데이터 확인
        if (location.state?.amount) return location.state.amount;
        if (location.state?.totalAmount) return location.state.totalAmount;
        if (location.state?.price) return location.state.price;

        // 5. selectedServices에서 계산된 총 가격
        if (selectedServices.length > 0) {
          const calculatedTotal = selectedServices.reduce(
            (sum, service) => sum + (service.price || 0),
            0
          );
          if (calculatedTotal > 0) return calculatedTotal;
        }

        // 6. 기본값 반환
        console.warn('⚠️ 총 금액 데이터를 찾을 수 없어 기본값 사용');
        return 155000;
      })(),
    }),
    [
      actualReservationData,
      managerInfo,
      reservationFromDetail,
      reservationData,
      savedPaymentData,
      selectedServices,
    ]
  );

  // 약관 동의 상태 관리
  const [agreements, setAgreements] = useState({
    terms: false,
    service: false,
    privacy: false,
    marketing: false,
  });

  // 모두선택 상태 계산
  const allRequired =
    agreements.terms && agreements.service && agreements.privacy;
  const allSelected = allRequired && agreements.marketing;

  // 개별 체크박스 변경 핸들러
  const handleAgreementChange = (key) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 모두선택 핸들러
  const handleSelectAll = () => {
    const newValue = !allSelected;
    setAgreements({
      terms: newValue,
      service: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  };

  const handlePayment = async () => {
    // 결제 확인 창 표시
    const confirmPayment = window.confirm('결제하시겠습니까?');
    if (!confirmPayment) {
      return; // 취소 클릭 시 함수 종료
    }

    try {
      // 인증 상태 확인
      const localStorageToken = localStorage.getItem('accessToken');
      const authStoreToken = useAuthStore.getState().accessToken;
      const currentUser = useAuthStore.getState().user;

      console.log('🔐 인증 상태 확인:');
      console.log(
        '- localStorage token:',
        localStorageToken ? '존재함' : '없음'
      );
      console.log('- authStore token:', authStoreToken ? '존재함' : '없음');
      console.log('- 현재 사용자:', currentUser);

      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!localStorageToken && !authStoreToken) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/auth/signin');
        return;
      }

      // 결제 요청 데이터 준비
      const reservationId = parseInt(
        location.state?.reservation?.reservationId ||
          reservationData.reservationId ||
          location.state?.reservation?.id ||
          paymentData.serviceInfo.reservationId
      );

      // 결제 수단 매핑 (프론트엔드 값 → 백엔드 enum 값)
      const paymentMethodMapping = {
        card: 'CARD',
        bank: 'TRANSFER',
      };

      const paymentRequestData = {
        reservationId: reservationId,
        amount: parseInt(paymentData.totalAmount),
        paymentMethod:
          paymentMethodMapping[selectedPaymentMethod] ||
          selectedPaymentMethod.toUpperCase(),
      };

      console.log('📤 결제 요청:', paymentRequestData);
      console.log('🔍 예약 상태 확인:', {
        reservationId,
        reservationFromDetail: location.state?.reservation,
        reservationData: reservationData,
        paymentData: paymentData.serviceInfo,
      });

      // 결제 API 호출 (백엔드 엔드포인트에 맞춤)
      const response = await api.post('/my/payments/', paymentRequestData);

      if (response.data?.data) {
        const paymentResult = response.data.data;
        console.log('✅ 결제 성공:', paymentResult);

        // 결제 완료 정보를 localStorage에 저장 (다른 페이지에서 참조용)
        const paymentCompletionInfo = {
          reservationId: paymentResult.reservationId,
          paymentId: paymentResult.id,
          completedAt: new Date().toISOString(),
          amount: paymentResult.amount,
          paymentMethod: paymentResult.paymentMethod,
        };
        localStorage.setItem(
          'recentPaymentCompletion',
          JSON.stringify(paymentCompletionInfo)
        );

        // 결제 완료 페이지로 이동 (라우팅 경로에 맞춤)
        navigate('/customer/payment-complete', {
          state: {
            paymentResult: {
              id: paymentResult.id,
              reservationId: paymentResult.reservationId,
              amount: paymentResult.amount,
              paymentMethod: paymentResult.paymentMethod,
              status: paymentResult.status,
              paidAt: paymentResult.paidAt,
              customerName: paymentResult.customerName,
            },
            serviceInfo: paymentData.serviceInfo,
            totalAmount: paymentData.totalAmount,
          },
        });
      }
    } catch (error) {
      console.error('❌ 결제 실패:', error);
      console.error('❌ 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
      });

      let errorMessage = '결제 처리 중 오류가 발생했습니다.';

      if (error.response?.status === 403) {
        errorMessage = '결제 권한이 없습니다. 로그인 상태를 확인해주세요.';
        // 403 에러의 경우 로그인 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        // 401 에러의 경우 로그인 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <div className="user-payment-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="user-payment-container">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">결제하기</h1>
            <p className="page-subtitle">서비스 결제를 진행해주세요</p>
          </div>

          {/* 서비스 정보 섹션 */}
          <div className="service-info-section">
            <h3 className="section-title">서비스 정보</h3>
            <div className="info-card">
              {/* ⭐️ 예약 번호 정보 (예약 상세에서 온 경우 우선 표시) */}
              {(reservationFromDetail?.id ||
                paymentData.serviceInfo.reservationId) && (
                <div className="info-item highlight">
                  <span className="label">예약 번호</span>
                  <span className="value reservation-id">
                    #
                    {reservationFromDetail?.id ||
                      paymentData.serviceInfo.reservationId}
                  </span>
                </div>
              )}

              <div className="info-item">
                <span className="label">서비스 유형</span>
                <span className="value service-type">
                  {paymentData.serviceInfo.serviceType}
                </span>
              </div>

              <div className="info-item">
                <span className="label">예약 날짜 및 시간</span>
                <span className="value">
                  {paymentData.serviceInfo.dateTime}
                </span>
              </div>

              <div className="info-item">
                <span className="label">결제 날짜</span>
                <span className="value">
                  {(() => {
                    const today = new Date();
                    return `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
                  })()}
                </span>
              </div>

              {paymentData.serviceInfo.duration && (
                <div className="info-item">
                  <span className="label">예상 소요시간</span>
                  <span className="value">
                    {paymentData.serviceInfo.duration}분
                  </span>
                </div>
              )}

              {/* ⭐️ 서비스 주소 (예약 상세에서 전달받은 정보 우선) */}
              {(reservationFromDetail?.address ||
                paymentData.serviceInfo.address ||
                reservationData.address ||
                savedPaymentData?.serviceInfo?.address) && (
                <div className="info-item">
                  <span className="label">서비스 주소</span>
                  <span className="value">
                    {(() => {
                      // 1. 예약 상세에서 전달받은 주소 정보 우선 사용
                      if (reservationFromDetail?.address) {
                        return `${reservationFromDetail.address}${
                          reservationFromDetail.addressDetail
                            ? ` ${reservationFromDetail.addressDetail}`
                            : ''
                        }`;
                      }

                      // 2. paymentData 서비스 주소
                      if (paymentData.serviceInfo.address) {
                        return paymentData.serviceInfo.address;
                      }

                      // 3. reservationData에서 위도,경도 정보 확인
                      if (
                        reservationData.addressDetail &&
                        reservationData.addressDetail.includes('위도:')
                      ) {
                        return reservationData.addressDetail;
                      }
                      if (
                        reservationData.address &&
                        reservationData.address.includes('위도:')
                      ) {
                        return reservationData.address;
                      }

                      // 4. savedPaymentData에서 위도,경도 정보 확인
                      if (
                        savedPaymentData?.serviceInfo?.address?.detail &&
                        savedPaymentData.serviceInfo.address.detail.includes(
                          '위도:'
                        )
                      ) {
                        return savedPaymentData.serviceInfo.address.detail;
                      }

                      // 5. 그 외의 경우 일반 주소 표시
                      if (savedPaymentData?.serviceInfo?.address) {
                        return `${savedPaymentData.serviceInfo.address.main}${
                          savedPaymentData.serviceInfo.address.detail
                            ? ` ${savedPaymentData.serviceInfo.address.detail}`
                            : ''
                        }`;
                      }

                      // 6. 마지막으로 reservationData 주소 표시
                      return `${reservationData.address}${
                        reservationData.addressDetail
                          ? ` ${reservationData.addressDetail}`
                          : ''
                      }`;
                    })()}
                  </span>
                </div>
              )}

              <div className="info-item">
                <span className="label">매니저</span>
                <span className="value">{paymentData.serviceInfo.manager}</span>
              </div>

              {/* ⭐️ 고객 요청사항 (예약 상세에서 전달받은 정보 우선) */}
              {(reservationFromDetail?.customerNote ||
                reservationData.customerNote) && (
                <div className="info-item">
                  <span className="label">고객 요청사항</span>
                  <span className="value">
                    {reservationFromDetail?.customerNote ||
                      reservationData.customerNote}
                  </span>
                </div>
              )}

              {/* ⭐️ 예약 상태 (예약 상세에서 온 경우 표시) */}
              {reservationFromDetail?.status && (
                <div className="info-item">
                  <span className="label">예약 상태</span>
                  <span
                    className={`value status-${reservationFromDetail.status}`}
                  >
                    {reservationFromDetail.status === 'pending' && '예약중'}
                    {reservationFromDetail.status === 'completed' && '예약완료'}
                    {reservationFromDetail.status === 'visited' && '방문완료'}
                    {reservationFromDetail.status === 'cancelled' && '취소완료'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 결제 정보 섹션 */}
          <div className="payment-info-section">
            <h3 className="section-title">결제 정보</h3>
            <div className="payment-card">
              <div className="price-list">
                {paymentData.priceList.map((item, index) => (
                  <div key={index} className="price-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      {item.price.toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
              <div className="total-amount">
                <div className="total-row">
                  <span className="total-label">총 결제 금액</span>
                  <span className="total-price">
                    {paymentData.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 수단 섹션 */}
          <div className="payment-method-section">
            <h3 className="section-title">결제 수단</h3>
            <div className="payment-methods">
              {/* 신용카드 옵션 주석처리 */}
              <label className="payment-method-item">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <i className="fas fa-credit-card method-icon"></i>
                  <span className="method-text">신용카드/체크카드</span>
                </div>
              </label>

              <label className="payment-method-item">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={selectedPaymentMethod === 'bank'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <i className="fas fa-university method-icon"></i>
                  <span className="method-text">계좌이체</span>
                </div>
              </label>
            </div>
          </div>

          {/* 카드 정보 입력 섹션 주석처리 */}
          {selectedPaymentMethod === 'card' && (
            <div className="card-info-section">
              <h3 className="section-title">카드 정보</h3>
              <div className="card-inputs">
                <div className="input-group">
                  <label>카드번호</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardInfo.number}
                    onChange={(e) =>
                      handleCardInputChange(
                        'number',
                        formatCardNumber(e.target.value)
                      )
                    }
                    maxLength="19"
                  />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>유효기간</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={(e) =>
                        handleCardInputChange(
                          'expiry',
                          formatExpiry(e.target.value)
                        )
                      }
                      maxLength="5"
                    />
                  </div>
                  <div className="input-group">
                    <label>CVC</label>
                    <input
                      type="text"
                      placeholder="000"
                      value={cardInfo.cvc}
                      onChange={(e) =>
                        handleCardInputChange(
                          'cvc',
                          e.target.value.replace(/[^0-9]/g, '')
                        )
                      }
                      maxLength="3"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>카드소지자명</label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={cardInfo.name}
                    onChange={(e) =>
                      handleCardInputChange('name', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 무통장입금 정보 */}
          {selectedPaymentMethod === 'bank' && (
            <div className="bank-info-section">
              <h3 className="section-title">입금 정보</h3>
              <div className="bank-details">
                <p>은행: 국민은행</p>
                <p>계좌번호: 123-456-789012</p>
                <p>예금주: (주)홈에이드</p>
                <p className="bank-note">
                  * 입금 후 확인까지 1-2시간 정도 소요될 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 버튼 섹션 */}
          <div className="button-section">
            {/* TODO: 백엔드 예약 상태 관리 시스템이 완성되면 아래 주석을 해제하여 실제 상태별 버튼 제어 */}
            {/* 현재는 프론트엔드 개발 및 테스트를 위해 항상 결제 버튼 활성화 */}

            {/* ⭐️ 예약 상태에 따른 결제 버튼 제어 (TODO: 백엔드 상태 관리 완성 후 활성화)
            {(() => {
              // ⭐️ 백엔드 데이터에서 실제 상태값 가져오기 (Spring Boot ReservationStatus)
              const backendStatus = reservationFromDetail?.backendData?.status;
              const frontendStatus = reservationFromDetail?.status;

              // 백엔드 상태를 우선으로 사용하고, 없으면 프론트엔드 상태 사용
              const actualStatus = backendStatus || frontendStatus;

              console.log('🔍 결제 버튼 상태 확인:', {
                backendStatus,
                frontendStatus,
                actualStatus,
              });

              if (actualStatus) {
                // ⭐️ Spring Boot ReservationStatus에 따른 결제 버튼 제어
                switch (actualStatus) {
                  case 'REQUESTED':
                  case 'MATCHING':
                  case 'pending': // 프론트엔드 매핑
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          매니저 매칭 대기 중...
                        </button>
                        <div className="payment-notice">
                          <p>💡 매니저 매칭이 완료되면 결제가 가능합니다.</p>
                        </div>
                      </>
                    );

                  case 'MATCHED':
                  case 'completed': // 프론트엔드 매핑 (MATCHED = 예약완료)
                    return (
                      <button
                        className="payment-button"
                        onClick={handlePayment}
                      >
                        {paymentData.totalAmount.toLocaleString()}원 결제하기
                      </button>
                    );

                  case 'COMPLETED':
                  case 'visited': // 프론트엔드 매핑 (COMPLETED = 방문완료)
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          서비스 완료됨
                        </button>
                        <div className="payment-notice">
                          <p>✅ 이미 서비스가 완료된 예약입니다.</p>
                        </div>
                      </>
                    );

                  case 'CANCELLED':
                  case 'cancelled': // 프론트엔드 매핑
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          취소된 예약
                        </button>
                        <div className="payment-notice">
                          <p>❌ 취소된 예약은 결제할 수 없습니다.</p>
                        </div>
                      </>
                    );

                  default:
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          결제 불가
                        </button>
                        <div className="payment-notice">
                          <p>⚠️ 알 수 없는 예약 상태입니다.</p>
                        </div>
                      </>
                    );
                }
              } else {
                // 예약 상세에서 오지 않은 경우 기본 결제 버튼
                return (
                  <button className="payment-button" onClick={handlePayment}>
                    {paymentData.totalAmount.toLocaleString()}원 결제하기
                  </button>
                );
              }
            })()}
            */}

            {/* ⭐️ 임시 결제 버튼 (항상 활성화 - TODO: 백엔드 상태 관리 완성 후 제거) */}
            <button
              className="payment-button"
              onClick={handlePayment}
              disabled={!allRequired}
              style={{
                backgroundColor: allRequired ? '#007bff' : '#cccccc',
                cursor: allRequired ? 'pointer' : 'not-allowed',
                opacity: allRequired ? 1 : 0.6,
              }}
            >
              {paymentData.totalAmount.toLocaleString()}원 결제하기
            </button>

            <button className="cancel-button" onClick={handleCancel}>
              취소하기
            </button>
          </div>

          {/* 안내 문구 */}
          <div className="notice-section">
            <p className="notice-text">
              매칭 확정 후에는 취소 시 수수료가 발생할 수 있습니다.
            </p>
          </div>

          {/* 하단 이미지 섹션 */}
          <div
            className="bottom-image-section"
            style={{
              marginTop: '30px',
              marginBottom: '20px',
              textAlign: 'left',
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
            >
              {/* 약관전체동의 체크박스 */}
              <div
                style={{
                  width: '100%',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #e0e0e0',
                  marginBottom: '15px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>약관전체동의</span>
                </label>
              </div>

              {/* 약관 동의 체크박스들 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  width: '100%',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={() => handleAgreementChange('terms')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(필수) 홈에이드 이용약관 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.service}
                    onChange={() => handleAgreementChange('service')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(필수) 서비스 이용약관 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={() => handleAgreementChange('privacy')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(필수) 개인정보 수집 및 이용 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.marketing}
                    onChange={() => handleAgreementChange('marketing')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(선택) 광고성 정보 수신 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
              </div>

              {/* 안내 텍스트 */}
              <p
                style={{
                  fontSize: '12px',
                  color: '#999',
                  textAlign: 'left',
                  lineHeight: '1.4',
                  marginTop: '15px',
                }}
              >
                위의 약관에 동의하시면 서비스 이용이 가능합니다. 자세한 내용은
                각 약관을 확인해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer current="/customer/payment" />
    </div>
  );
};

export default UserPayment;
