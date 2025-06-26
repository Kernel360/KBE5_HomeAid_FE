import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../api/index.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

const ManagerSettlementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // 매니저 정산 데이터 가져오기
  const fetchSettlements = async (page = 0) => {
    if (!user || user.role !== 'ROLE_MANAGER') {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.settlement.getMySettlements({
        page,
        size: pagination.size,
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          setSettlements(data);
          setPagination((prev) => ({
            ...prev,
            page,
            totalElements: data.length,
            totalPages: Math.ceil(data.length / prev.size),
          }));
        } else if (data && data.content) {
          setSettlements(data.content);
          setPagination((prev) => ({
            ...prev,
            page,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
          }));
        }
      }
    } catch (error) {
      console.error('정산 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [user]);

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    if (!amount) return '₩0';
    return `₩${amount.toLocaleString()}`;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 정산 상태 표시 함수
  const getSettlementStatus = (settlement) => {
    if (settlement.paidAt)
      return { text: '지급완료', color: 'bg-green-100 text-green-800' };
    if (settlement.confirmedAt)
      return { text: '승인완료', color: 'bg-blue-100 text-blue-800' };
    return { text: '승인대기', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg relative bg-white">
        <Header showBackButton={true} />

        <main
          className="px-6 py-6 min-h-screen pb-24"
          style={{ marginTop: '64px' }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">정산 내역</h1>
            <p className="text-gray-600">매니저 정산 현황을 확인하세요</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">정산 내역을 불러오는 중...</p>
            </div>
          ) : settlements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">정산 내역이 없습니다</p>
              <p className="text-gray-400 text-sm">
                서비스 완료 후 정산 내역이 생성됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.map((settlement, index) => {
                const status = getSettlementStatus(settlement);
                return (
                  <div
                    key={settlement.id || index}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatCurrency(settlement.managerAmount)}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">정산 기간</span>
                        <span className="text-sm font-medium text-gray-900">
                          {settlement.from && settlement.to
                            ? `${formatDate(settlement.from)} ~ ${formatDate(settlement.to)}`
                            : formatDate(settlement.createdAt)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">총 수익</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(settlement.totalAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          관리자 수수료
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(
                            (settlement.totalAmount || 0) -
                              (settlement.managerAmount || 0)
                          )}
                        </span>
                      </div>

                      {settlement.confirmedAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">승인일</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(settlement.confirmedAt)}
                          </span>
                        </div>
                      )}

                      {settlement.paidAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">지급일</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(settlement.paidAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ManagerSettlementPage;
