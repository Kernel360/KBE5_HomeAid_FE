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
import { apiService } from '../../../../api/index.js';
import { useAuthStore } from '../../../../stores/authStore.js';

const SettlementHistory = ({ onBack }) => {
  const { user } = useAuthStore();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'detail'
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [stats, setStats] = useState({
    totalSettlement: 0,
    pendingSettlement: 0,
    completedSettlement: 0,
    totalServices: 0,
  });

  // 월별 주차 필터 상태 추가
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isMonthlyView, setIsMonthlyView] = useState(false);
  const [weeklySettlements, setWeeklySettlements] = useState([]);

  // 정산 내역 조회 (간단한 조회)
  const fetchSettlements = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗓️ 정산 내역 조회 시작:', {
        로그인사용자: user,
        사용자ID: user?.id,
        사용자유형: user?.userType,
        accessToken: localStorage.getItem('accessToken')
          ? '토큰 존재'
          : '토큰 없음',
      });

      // 최근 10주간의 정산 데이터를 수집
      const allSettlements = [];
      const weeksToFetch = getWeeksToFetch();

      console.log('📅 조회할 주간 목록:', weeksToFetch);

      // 각 주간별로 API 호출
      for (const weekStart of weeksToFetch) {
        try {
          console.log(`🔗 주간 정산 API 호출: ${weekStart}`);

          const response =
            await apiService.settlement.getMySettlements(weekStart);

          console.log(`📡 ${weekStart} 주간 응답:`, {
            status: response.status,
            dataLength: response?.data?.data?.length || 0,
            data: response?.data?.data,
          });

          if (response?.data?.data && Array.isArray(response.data.data)) {
            allSettlements.push(...response.data.data);
            console.log(`✅ ${weekStart} 주간: ${response.data.data.length}건`);
          }
        } catch (weekError) {
          console.warn(`⚠️ ${weekStart} 주간 조회 실패:`, weekError);
          // 개별 주간 실패는 무시하고 계속 진행
        }
      }

      console.log('📊 전체 정산 데이터 수집 완료:', {
        총데이터수: allSettlements.length,
        조회한주간수: weeksToFetch.length,
        전체데이터: allSettlements,
      });

      if (allSettlements.length > 0) {
        // 중복 제거 및 날짜순 정렬
        const uniqueSettlements = allSettlements
          .filter(
            (settlement, index, arr) =>
              arr.findIndex((s) => s.id === settlement.id) === index
          )
          .sort((a, b) => new Date(b.settledAt) - new Date(a.settledAt));

        setSettlements(uniqueSettlements);
        calculateStats(uniqueSettlements);
        console.log('✅ 정산 내역 조회 성공:', uniqueSettlements.length, '건');
      } else {
        setSettlements([]);
        console.log('📭 조회된 정산 내역 없음');
      }
    } catch (err) {
      console.error('❌ 정산 내역 조회 실패:', err);
      setError('정산 내역을 불러오는 중 오류가 발생했습니다.');

      // 에러 시 더미 데이터 표시
      const dummyData = generateDummyData();
      setSettlements(dummyData);
      calculateStats(dummyData);
    } finally {
      setLoading(false);
    }
  };

  // 특정 월의 주차별 정산 조회
  const fetchMonthlyWeeklySettlements = async (year, month) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📅 월별 주차 정산 조회 시작:', { year, month });

      // 백엔드 월별 정산 API 호출
      const response = await apiService.settlement.getMyMonthlySettlements(
        year,
        month
      );

      console.log('📡 월별 정산 API 응답:', {
        status: response.status,
        dataLength: response?.data?.data?.length || 0,
        data: response?.data?.data,
      });

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const settlements = response.data.data;

        // 해당 월의 주차 정보 계산
        const weeks = getWeeksInMonth(year, month);
        console.log('🗓️ 계산된 주차 정보:', weeks);

        // 정산 데이터를 주차별로 그룹핑
        const groupedByWeek = weeks.map((week) => {
          // 해당 주차에 해당하는 정산들을 찾기
          const weekSettlements = settlements.filter((settlement) => {
            const settlementStart = new Date(settlement.from);
            const settlementEnd = new Date(settlement.to);
            const weekStart = new Date(week.start);
            const weekEnd = new Date(week.end);

            // 정산 기간이 해당 주차와 겹치는지 확인
            return settlementStart <= weekEnd && settlementEnd >= weekStart;
          });

          // 주차 정보를 정산 데이터에 추가
          const settlementsWithWeek = weekSettlements.map((settlement) => ({
            ...settlement,
            weekInfo: week,
          }));

          return {
            ...week,
            settlements: settlementsWithWeek,
            totalAmount: settlementsWithWeek.reduce(
              (sum, s) => sum + s.totalAmount,
              0
            ),
            count: settlementsWithWeek.length,
          };
        });

        setWeeklySettlements(groupedByWeek);
        console.log('📊 주차별 그룹핑 완료:', groupedByWeek);

        // 전체 통계도 업데이트
        calculateStats(settlements);
      } else {
        console.log('📭 조회된 정산 내역 없음');
        setWeeklySettlements([]);
      }
    } catch (err) {
      console.error('❌ 월별 주차 정산 조회 실패:', err);
      setError('월별 정산 내역을 불러오는 중 오류가 발생했습니다.');

      // 에러 시 더미 주차 데이터 생성
      const dummyWeeklyData = generateDummyWeeklyData(year, month);
      setWeeklySettlements(dummyWeeklyData);
    } finally {
      setLoading(false);
    }
  };

  // 조회할 주간 목록 생성 (고정된 10주간)
  const getWeeksToFetch = () => {
    const now = new Date();
    const weeks = [];
    const weeksCount = 10; // 최근 10주

    // 각 주의 시작일을 계산
    for (let i = 0; i < weeksCount; i++) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const year = weekStart.getFullYear();
      const month = String(weekStart.getMonth() + 1).padStart(2, '0');
      const day = String(weekStart.getDate()).padStart(2, '0');
      weeks.push(`${year}-${month}-${day}`);
    }

    return weeks;
  };

  // 특정 월의 주차 계산
  const getWeeksInMonth = (year, month) => {
    const weeks = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    // 월의 첫째 주 시작일 (월요일 기준)
    const firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일은 6일 전이 월요일
    firstMonday.setDate(firstDayOfMonth.getDate() - daysToMonday);

    let currentWeekStart = new Date(firstMonday);
    let weekNumber = 1;

    // 해당 월에 포함되는 모든 주차 계산
    while (currentWeekStart <= lastDayOfMonth) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6); // 일요일까지

      // 주차가 해당 월과 겹치는지 확인
      const weekOverlapsMonth =
        currentWeekStart <= lastDayOfMonth && weekEnd >= firstDayOfMonth;

      if (weekOverlapsMonth) {
        weeks.push({
          weekNumber: weekNumber,
          start: formatDateForAPI(currentWeekStart),
          end: formatDateForAPI(weekEnd),
          startDate: new Date(currentWeekStart),
          endDate: new Date(weekEnd),
          label: `${month}월 ${weekNumber}주차`,
        });
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;

      // 무한 루프 방지 (최대 6주)
      if (weekNumber > 6) break;
    }

    return weeks;
  };

  // API용 날짜 포맷팅
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜 포맷팅 헬퍼 함수
  const formatKoreaDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatKoreaDateTime = (date) => {
    return date.toISOString();
  };

  // 더미 데이터 생성 (개발/테스트용)
  const generateDummyData = () => {
    const statuses = ['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED'];

    return Array.from({ length: 8 }, (_, index) => {
      const totalAmount = Math.floor(Math.random() * 500000) + 100000;
      const managerAmount = Math.round(totalAmount * 0.8);
      const adminAmount = totalAmount - managerAmount;

      // 현재 시간 기준으로 날짜 생성
      const now = Date.now();

      const fromDate = new Date(now - (index + 1) * 7 * 24 * 60 * 60 * 1000);
      const toDate = new Date(now - index * 7 * 24 * 60 * 60 * 1000);
      const settledDate = new Date(
        now - Math.random() * 30 * 24 * 60 * 60 * 1000
      );
      const confirmedDate =
        Math.random() > 0.5
          ? new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000)
          : null;
      const paidDate =
        Math.random() > 0.7
          ? new Date(now - Math.random() * 3 * 24 * 60 * 60 * 1000)
          : null;

      return {
        id: index + 1,
        managerId: 1,
        from: formatKoreaDate(fromDate),
        to: formatKoreaDate(toDate),
        totalAmount,
        managerAmount,
        adminAmount,
        settledAt: formatKoreaDateTime(settledDate),
        confirmedAt: confirmedDate ? formatKoreaDateTime(confirmedDate) : null,
        paidAt: paidDate ? formatKoreaDateTime(paidDate) : null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
    });
  };

  // 더미 주차별 데이터 생성
  const generateDummyWeeklyData = (year, month) => {
    const weeks = getWeeksInMonth(year, month);

    return weeks.map((week) => ({
      ...week,
      settlements: Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        (_, index) => {
          const totalAmount = Math.floor(Math.random() * 300000) + 50000;
          const managerAmount = Math.round(totalAmount * 0.8);
          const adminAmount = totalAmount - managerAmount;

          return {
            id: `${week.weekNumber}-${index + 1}`,
            managerId: 1,
            from: week.start,
            to: week.end,
            totalAmount,
            managerAmount,
            adminAmount,
            settledAt: new Date().toISOString(),
            status: ['PENDING', 'CONFIRMED', 'PAID'][
              Math.floor(Math.random() * 3)
            ],
            weekInfo: week,
          };
        }
      ),
      get totalAmount() {
        return this.settlements.reduce((sum, s) => sum + s.totalAmount, 0);
      },
      get count() {
        return this.settlements.length;
      },
    }));
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

    try {
      // YYYY-MM-DD 형식의 문자열인 경우 직접 파싱
      if (
        typeof dateString === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ) {
        const [year, month, day] = dateString.split('-');
        return `${year}.${month}.${day}`;
      }

      // ISO 문자열이나 다른 형식인 경우 Date 객체로 변환
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '날짜 오류';

      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error, dateString);
      return '날짜 오류';
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchSettlements();
  }, []);

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
    <div className="min-h-screen ">
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
                    아직 정산된 내역이 없습니다
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
