import React, { useState, useEffect } from 'react';
import { apiService } from '@/api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subValue, icon, iconBg }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px] flex flex-col">
    <div className="flex items-start justify-between mb-3 min-h-0">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
        <span className="text-xs text-gray-600 truncate flex-1">{title}</span>
      </div>
      <div
        className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ml-2`}
      >
        {icon}
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-center min-h-0">
      <div className="text-lg font-bold text-gray-900 mb-1 truncate">
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-gray-500">
          {subValue.split('\n').map((line, index) => (
            <div key={index} className="truncate">
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const MatchingManagement = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const [matchingData, setMatchingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 탭별 데이터 필터링
  const getFilteredData = () => {
    if (activeTab === '전체') return matchingData;

    const statusMap = {
      '매칭 필요': 'REQUESTED',
      '매칭 중': 'MATCHING',
      '매칭 완료': 'MATCHED',
      '서비스 완료': 'COMPLETED',
      취소됨: 'CANCELLED',
    };

    return matchingData.filter((item) => item.status === statusMap[activeTab]);
  };

  // 탭별 개수 계산
  const getTabCount = (tabName) => {
    if (tabName === '전체') return matchingData.length;

    const statusMap = {
      '매칭 필요': 'REQUESTED',
      '매칭 중': 'MATCHING',
      '매칭 완료': 'MATCHED',
      '서비스 완료': 'COMPLETED',
      취소됨: 'CANCELLED',
    };

    return matchingData.filter((item) => item.status === statusMap[tabName])
      .length;
  };

  // API에서 예약 데이터 가져오기
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 예약 데이터 가져오기 시작');

        const response = await apiService.reservation.getAll();
        console.log('✅ 예약 데이터 가져오기 성공!!!!!!!:', response);

        // API 응답 구조에 따라 데이터 추출
        const reservations =
          response.data?.data?.content ||
          response.data?.data ||
          response.data ||
          [];
        console.log('📋 추출된 예약 데이터:', reservations);

        setMatchingData(reservations);
      } catch (err) {
        console.error('❌ 예약 데이터 가져오기 실패:', err);
        setError('예약 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const tabs = [
    '전체',
    '매칭 필요',
    '매칭 중',
    '매칭 완료',
    '서비스 완료',
    '취소됨',
  ];

  // 실제 데이터를 기반으로 통계 계산
  const getStats = () => {
    if (!matchingData || matchingData.length === 0) {
      return [
        {
          title: '매칭 필요',
          value: '0',
          subValue: '매칭 대기중인 예약',
          icon: (
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
          iconBg: 'bg-yellow-100',
        },
        {
          title: '매칭 중',
          value: '0',
          subValue: '매칭 진행중인 예약',
          icon: (
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                clipRule="evenodd"
              />
            </svg>
          ),
          iconBg: 'bg-blue-100',
        },
        {
          title: '매칭 완료',
          value: '0',
          subValue: '매칭이 완료된 예약',
          icon: (
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          iconBg: 'bg-green-100',
        },
        {
          title: '서비스 완료',
          value: '0',
          subValue: '서비스가 완료된 예약',
          icon: (
            <svg
              className="w-5 h-5 text-purple-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          iconBg: 'bg-purple-100',
        },
      ];
    }

    const requestedCount = matchingData.filter(
      (item) => item.status === 'REQUESTED'
    ).length;
    const matchingCount = matchingData.filter(
      (item) => item.status === 'MATCHING'
    ).length;
    const matchedCount = matchingData.filter(
      (item) => item.status === 'MATCHED'
    ).length;
    const completedCount = matchingData.filter(
      (item) => item.status === 'COMPLETED'
    ).length;
    const cancelledCount = matchingData.filter(
      (item) => item.status === 'CANCELLED'
    ).length;

    // 매칭 성공률 계산 (MATCHED + COMPLETED) / (전체 - CANCELLED)
    const totalActive = matchingData.length - cancelledCount;
    const successCount = matchedCount + completedCount;
    const successRate =
      totalActive > 0 ? ((successCount / totalActive) * 100).toFixed(1) : 0;

    // 총 예약 금액 계산 (완료 건수 × 20,000원)
    const totalRevenue = completedCount * 20000;

    return [
      {
        title: '매칭 필요',
        value: requestedCount.toString(),
        subValue: '매칭 대기중인 예약',
        icon: (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        ),
        iconBg: 'bg-yellow-100',
      },
      {
        title: '매칭 중',
        value: matchingCount.toString(),
        subValue: '매칭 진행중인 예약',
        icon: (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              clipRule="evenodd"
            />
          </svg>
        ),
        iconBg: 'bg-blue-100',
      },
      {
        title: '매칭 완료',
        value: matchedCount.toString(),
        subValue: '매칭이 완료된 예약',
        icon: (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
        iconBg: 'bg-green-100',
      },
      {
        title: '서비스 완료',
        value: completedCount.toString(),
        subValue: `매칭 성공률: ${successRate}%`,
        icon: (
          <svg
            className="w-5 h-5 text-purple-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
        iconBg: 'bg-purple-100',
      },
      {
        title: '총 수익',
        value: `₩${totalRevenue.toLocaleString()}`,
        subValue: `완료된 ${completedCount}건의 서비스`,
        icon: (
          <svg
            className="w-5 h-5 text-green-600"
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
        ),
        iconBg: 'bg-green-100',
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-none space-y-6">
          {/* Stats Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {getStats().map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                subValue={stat.subValue}
                icon={stat.icon}
                iconBg={stat.iconBg}
              />
            ))}
          </div>

          {/* Tabs and Table */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-white" style={{ backgroundColor: 'white' }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent bg-white'
                  }`}
                  style={{ backgroundColor: 'white' }}
                >
                  {tab} ({getTabCount(tab)})
                </button>
              ))}
            </div>

            {/* 구분선 */}
            <div className="border-b border-gray-200 bg-white"></div>

            {/* Content */}
            <div className="w-full p-6 bg-white">
              {/* Table */}
              <div className="w-full overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">
                      예약 데이터를 불러오는 중...
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-red-500">{error}</div>
                  </div>
                ) : getFilteredData().length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">
                      {activeTab === '전체'
                        ? '등록된 예약이 없습니다.'
                        : `${activeTab} 상태의 예약이 없습니다.`}
                    </div>
                  </div>
                ) : (
                  <table className="w-full min-w-[1400px]">
                    <colgroup>
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '200px' }} />
                      <col style={{ width: '160px' }} />
                      <col style={{ width: '250px' }} />
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '120px' }} />
                    </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          예약 ID
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          고객
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          매니저
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          서비스
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          요청일
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          요금
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상세보기
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredData().map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-mono text-gray-900">
                            #{item.reservationId || item.id || index + 1}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.customerName || '고객명 없음'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.address || '주소 정보 없음'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.matchedManagerName || '배정 대기중'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.managerRating
                                  ? `평점 ${item.managerRating} ⭐`
                                  : '평점 없음'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.serviceOptionName || '서비스명 없음'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.customerMemo || '요청사항 없음'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === 'MATCHED'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : item.status === 'REQUESTED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : item.status == 'MATCHING'
                                        ? 'bg-white-100 text-black-800'
                                        : item.status === 'CANCELLED'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.status === 'COMPLETED'
                                ? '서비스 완료'
                                : item.status === 'MATCHED'
                                  ? '매칭 완료'
                                  : item.status === 'MATCHING'
                                    ? '매칭 중'
                                    : item.status === 'REQUESTED'
                                      ? '매칭 필요'
                                      : item.status === 'CANCELLED'
                                        ? '취소됨'
                                        : item.status || '상태 미확인'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {item.startTime || item.createdAt
                              ? new Date(
                                  item.startTime || item.createdAt
                                ).toLocaleDateString('ko-KR')
                              : '날짜 없음'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                            ₩20,000
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            <button
                              className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              onClick={() =>
                                navigate(
                                  `/admin/matches/reservations/${item.reservationId || item.id}/detail`
                                )
                              }
                            >
                              상세보기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
                <div className="text-sm text-gray-700">
                  총 142개 중 1-10개 표시
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    ‹
                  </button>
                  <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    2
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    3
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingManagement;
