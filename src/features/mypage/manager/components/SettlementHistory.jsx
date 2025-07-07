import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SettlementDetail from './SettlementDetail.jsx';
import { api } from '../../../../api/config/api';

const SettlementHistory = ({ onBack }) => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'detail'
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [stats, setStats] = useState({
    totalSettlement: 0,
    pendingSettlement: 0,
    completedSettlement: 0,
    totalServices: 0,
  });

  // 정산 내역 조회
  const fetchSettlements = async () => {
    try {
      setLoading(true);
      setError(null);

      // 기간에 따른 시작 날짜 계산
      const startDate = getStartDateForPeriod(selectedPeriod);

      console.log('정산 내역 조회:', startDate);

      // 매니저 정산 내역 API 호출 (백엔드 API 스펙에 맞춤)
      const response = await api.get('/my/settlement/weekly', {
        params: {
          start: startDate,
        },
      });

      if (response?.data?.data) {
        const settlementsData = response.data.data;
        setSettlements(settlementsData);
        calculateStats(settlementsData);
        console.log('정산 내역 조회 성공:', settlementsData.length, '건');
      } else {
        setSettlements([]);
      }
    } catch (err) {
      console.error('정산 내역 조회 실패:', err);
      setError('정산 내역을 불러오는 중 오류가 발생했습니다.');
      // 테스트용 더미 데이터
      const dummyData = generateDummyData();
      setSettlements(dummyData);
      calculateStats(dummyData);
    } finally {
      setLoading(false);
    }
  };

  // 기간에 따른 시작 날짜 계산
  const getStartDateForPeriod = (period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        // 'all'인 경우 3개월 전부터
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    return startDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  };

  // 더미 데이터 생성 (개발/테스트용)
  const generateDummyData = () => {
    const statuses = ['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED'];

    return Array.from({ length: 8 }, (_, index) => {
      const totalAmount = Math.floor(Math.random() * 500000) + 100000;
      const managerAmount = Math.round(totalAmount * 0.8);
      const adminAmount = totalAmount - managerAmount;

      return {
        id: index + 1,
        managerId: 1,
        from: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        to: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        totalAmount,
        managerAmount,
        adminAmount,
        settledAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        confirmedAt:
          Math.random() > 0.5
            ? new Date(
                Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
              ).toISOString()
            : null,
        paidAt:
          Math.random() > 0.7
            ? new Date(
                Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000
              ).toISOString()
            : null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
    });
  };

  // 정산 상세 보기
  const handleSettlementClick = (settlement) => {
    setSelectedSettlement(settlement);
    setCurrentView('detail');
  };

  // 정산 목록으로 돌아가기
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedSettlement(null);
  };

  // 통계 계산 (백엔드 데이터 구조에 맞춤)
  const calculateStats = (settlementsData) => {
    const totalSettlement = settlementsData
      .filter((s) => s.status === 'PAID')
      .reduce((sum, s) => sum + s.managerAmount, 0);

    const pendingSettlement = settlementsData
      .filter((s) => s.status === 'PENDING' || s.status === 'CONFIRMED')
      .reduce((sum, s) => sum + s.managerAmount, 0);

    const completedSettlement = settlementsData
      .filter((s) => s.status === 'PAID')
      .reduce((sum, s) => sum + s.managerAmount, 0);

    const totalServices = settlementsData.length;

    setStats({
      totalSettlement,
      pendingSettlement,
      completedSettlement,
      totalServices,
    });
  };

  // 정산 상태 텍스트 (백엔드 스펙에 맞춤)
  const getStatusText = (status) => {
    const statusMap = {
      PENDING: '정산대기',
      CONFIRMED: '정산승인',
      PAID: '지급완료',
      CANCELLED: '정산취소',
    };
    return statusMap[status] || status;
  };

  // 정산 상태 색상 (백엔드 스펙에 맞춤)
  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // 상태 아이콘 (백엔드 스펙에 맞춤)
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'CONFIRMED':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '미정';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchSettlements();
  }, [selectedPeriod]);

  // 정산 상세 보기 렌더링
  if (currentView === 'detail' && selectedSettlement) {
    return (
      <SettlementDetail
        settlement={selectedSettlement}
        onBack={handleBackToList}
      />
    );
  }

  // 정산 목록 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="w-full bg-white h-screen flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}
      >
        <Header showBackButton={true} onBackClick={onBack} />

        <main
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ paddingBottom: '100px', paddingTop: '80px' }}
        >
          {/* 헤더 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">정산 내역</h3>
            <p className="text-sm text-gray-500">
              서비스 제공에 따른 정산 현황을 확인하세요
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">지급완료 정산액</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ₩{formatAmount(stats.totalSettlement)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-600">정산 대기 금액</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ₩{formatAmount(stats.pendingSettlement)}
              </p>
            </div>
          </div>

          {/* 기간 필터 */}
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[
                { value: 'all', label: '전체' },
                { value: 'week', label: '최근 1주' },
                { value: 'month', label: '최근 1개월' },
                { value: 'quarter', label: '최근 3개월' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                정산 내역을 불러오는 중...
              </span>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={fetchSettlements}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 정산 내역 리스트 */}
          {!loading && !error && (
            <div className="space-y-3">
              {settlements.length > 0 ? (
                settlements.map((settlement) => (
                  <div
                    key={settlement.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSettlementClick(settlement)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(settlement.status)}
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                            settlement.status
                          )}`}
                        >
                          {getStatusText(settlement.status)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        정산 ID: #{settlement.id}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">
                        주간 정산 내역
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(settlement.from)} ~{' '}
                        {formatDate(settlement.to)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">정산 생성일</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(settlement.settledAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">지급일</span>
                        <p className="font-medium text-gray-900">
                          {settlement.paidAt
                            ? formatDate(settlement.paidAt)
                            : '미지급'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">총 결제 금액</span>
                        <span className="font-medium">
                          ₩{formatAmount(settlement.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">
                          플랫폼 수수료 (20%)
                        </span>
                        <span className="text-red-600">
                          -₩{formatAmount(settlement.adminAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-900">정산 예정 금액</span>
                        <span className="text-blue-600 text-lg">
                          ₩{formatAmount(settlement.managerAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">정산 내역이 없습니다</p>
                  <p className="text-sm text-gray-400">
                    해당 기간에 정산된 내역이 없습니다
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
};

export default SettlementHistory;
