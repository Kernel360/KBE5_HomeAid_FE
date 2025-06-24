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
        // 추천 매니저 API 연동
        const recRes = await apiService.matching.getRecommendedManagers(reservationId);
        const managerList = recRes.data?.data || [];
        
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

  const handleSelectManager = async (managerId) => {
    try {
      await apiService.matching.createMatching(Number(reservationId), managerId);
      alert('매칭이 성공적으로 생성되었습니다!');
      // 필요하다면 이동 또는 새로고침 등 추가
    } catch (error) {
      alert('매칭 생성에 실패했습니다.');
      console.error(error);
    }
  };

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
          {managers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">매칭된 매니저가 없습니다.</div>
          ) : (
            managers.map((m) => (
              <div key={m.managerId} className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
                  <span>👤</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{m.managerName}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50">프로필</button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    onClick={() => handleSelectManager(m.managerId)}
                  >
                    선택
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailWithManagerList; 