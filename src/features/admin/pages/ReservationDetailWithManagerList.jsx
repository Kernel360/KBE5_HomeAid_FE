import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '@/api';

const ReservationDetailWithManagerList = () => {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 예약 상세 정보 가져오기
        const res = await apiService.reservation.getById(reservationId);
        setReservation(res.data?.data || res.data);
        // 매칭 가능한 매니저 리스트 가져오기 (여기선 더미)
        const managerList = [
          {
            id: 1,
            name: '김서현',
            username: 'manager_8901',
            rating: 4.8,
            reviewCount: 127,
            experience: '3년 2개월',
            distance: 2.3,
            address: '인천 연수구 거주',
            tags: ['홈케어', '반려동물 케어', '야간 서비스'],
            availableTime: '오후 6시 ~ 10시',
          },
          {
            id: 2,
            name: '박민준',
            username: 'manager_7654',
            rating: 4.6,
            reviewCount: 89,
            experience: '2년 8개월',
            distance: 5.1,
            address: '인천 남동구 거주',
            tags: ['홈케어', '청소 서비스'],
            availableTime: '오후 7시 ~ 11시',
          },
          {
            id: 3,
            name: '이수진',
            username: 'manager_3456',
            rating: 4.9,
            reviewCount: 203,
            experience: '5년 1개월',
            distance: 1.8,
            address: '인천 연수구 거주',
            tags: ['홈케어'],
            availableTime: '오후 6시 ~ 9시',
          },
        ];
        setManagers(managerList);
      } catch (error) {
        console.error(error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reservationId]);

  if (loading) return <div className="p-8 text-center">불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!reservation) return <div className="p-8 text-center">예약 정보 없음</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 bg-gray-50 min-h-screen">
      {/* 예약 상세 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-6 w-full md:w-1/3 min-w-[320px]">
        <h2 className="text-lg font-bold mb-4">예약 상세정보</h2>
        <div className="mb-6">
          <div className="text-xs text-gray-400 mb-1">수요자 정보</div>
          <div className="mb-2 flex justify-between"><span>이름</span><span>{reservation.customerName || '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>사용자 ID</span><span>{reservation.customerId || '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>연락처</span><span>{reservation.customerPhone || '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>이메일</span><span>{reservation.customerEmail || '-'}</span></div>
        </div>
        <div className="mb-6">
          <div className="text-xs text-gray-400 mb-1">예약 정보</div>
          <div className="mb-2 flex justify-between"><span>예약 날짜</span><span>{reservation.requestedDate || '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>시간대</span><span>{reservation.requestedTime || '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>지역</span><span>{reservation.address || '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>상세 주소</span><span>{reservation.addressDetail || '-'}</span></div>
        </div>
        <div className="mb-6">
          <div className="text-xs text-gray-400 mb-1">서비스 정보</div>
          <div className="mb-2 flex justify-between"><span>서비스 유형</span><span>{reservation.serviceOptionName || '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>예상 소요시간</span><span>{reservation.totalDuration ? `${reservation.totalDuration}시간` : '-'}</span></div>
          <div className="mb-2 flex justify-between"><span>서비스 금액</span><span>{reservation.totalPrice ? `${reservation.totalPrice.toLocaleString()}원` : '-'}</span></div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">특이사항</div>
          <div className="text-xs text-gray-700 bg-gray-100 rounded p-2 min-h-[48px]">
            {reservation.customerMemo || '없음'}
          </div>
        </div>
      </div>

      {/* 매니저 추천 리스트 */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">추천 매니저 목록</h2>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1 text-sm">
              <option>거리순</option>
              <option>평점순</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm">
              <option>전체</option>
              <option>전문분야</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          {managers.map((m) => (
            <div key={m.id} className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
                <span>👤</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">{m.name}</span>
                  <span className="text-xs text-gray-500">{m.username}</span>
                  <span className="ml-2 text-yellow-500 font-bold flex items-center text-sm">
                    ★ {m.rating} <span className="ml-1 text-xs text-gray-500">({m.reviewCount}경력)</span>
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{m.experience}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">{m.address}</div>
                <div className="flex gap-2 mb-1 flex-wrap">
                  {m.tags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{m.distance}km</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">가능 시간: {m.availableTime}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50">프로필</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">선택</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailWithManagerList; 