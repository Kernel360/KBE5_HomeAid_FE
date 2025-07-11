import React from 'react';
import { getDistributionTitle } from '../utils/statisticsUtils.js';
import {
  formatNumber,
  formatPercent,
  formatCurrency,
} from '../utils/statisticsUtils.js';

/**
 * 분포 범례 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.activeTab - 활성 탭
 * @param {Object} props.stats - 통계 데이터
 * @returns {JSX.Element|null} 분포 범례 컴포넌트
 */
const DistributionLegend = ({ activeTab, stats }) => {
  if (activeTab === '회원현황' && stats) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>활성 회원</span>
          <span className="ml-2 font-semibold text-blue-600">
            {formatNumber(stats.totalUsers - stats.withdrawCount)}명
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>탈퇴 회원</span>
          <span className="ml-2 font-semibold text-red-600">
            {formatNumber(stats.withdrawCount)}명
          </span>
        </div>
      </div>
    );
  } else if (activeTab === '정산' && stats) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>완료</span>
          <span className="ml-2 font-semibold text-green-600">
            {formatNumber(stats.paidCount)}건
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span>대기</span>
          <span className="ml-2 font-semibold text-orange-600">
            {formatNumber(stats.requestedCount - stats.paidCount)}건
          </span>
        </div>
      </div>
    );
  } else if (activeTab === '결제' && stats) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>카드</span>
          <span className="ml-2 font-semibold text-blue-600">
            {formatCurrency(stats.card)}
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>계좌이체</span>
          <span className="ml-2 font-semibold text-green-600">
            {formatCurrency(stats.transfer)}
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span>현금</span>
          <span className="ml-2 font-semibold text-orange-600">
            {formatCurrency(stats.cash)}
          </span>
        </div>
      </div>
    );
  } else if (activeTab === '예약관리' && stats) {
    const completedCount = stats.reservationCount - stats.cancelledCount;
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>완료</span>
          <span className="ml-2 font-semibold text-green-600">
            {formatNumber(completedCount)}건
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>취소</span>
          <span className="ml-2 font-semibold text-red-600">
            {formatNumber(stats.cancelledCount)}건
          </span>
        </div>
      </div>
    );
  } else if (activeTab === '매니저별점' && stats) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span>평균 평점</span>
          <span className="ml-2 font-semibold text-yellow-600">
            {stats.avgRating.toFixed(2)}점
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>리뷰 수</span>
          <span className="ml-2 font-semibold text-blue-600">
            {formatNumber(stats.reviewCount)}건
          </span>
        </div>
      </div>
    );
  } else if (activeTab === '매칭' && stats) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>성공</span>
          <span className="ml-2 font-semibold text-green-600">
            {formatNumber(stats.successCount)}건
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>실패/취소</span>
          <span className="ml-2 font-semibold text-red-600">
            {formatNumber(stats.failCount)}건
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * 분포 바 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.activeTab - 활성 탭
 * @param {Object} props.stats - 통계 데이터
 * @returns {JSX.Element|null} 분포 바 차트 컴포넌트
 */
const DistributionBars = ({ activeTab, stats }) => {
  if (activeTab === '회원현황' && stats) {
    return (
      <>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">활성 회원</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{
                width: `${((stats.totalUsers - stats.withdrawCount) / stats.totalUsers) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent(
              ((stats.totalUsers - stats.withdrawCount) / stats.totalUsers) *
                100
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">탈퇴 회원</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-red-500 h-4 rounded-full"
              style={{
                width: `${(stats.withdrawCount / stats.totalUsers) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((stats.withdrawCount / stats.totalUsers) * 100)}
          </div>
        </div>
      </>
    );
  } else if (activeTab === '정산' && stats) {
    return (
      <>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">완료</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{
                width: `${(stats.paidCount / stats.requestedCount) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((stats.paidCount / stats.requestedCount) * 100)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">대기</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-orange-500 h-4 rounded-full"
              style={{
                width: `${((stats.requestedCount - stats.paidCount) / stats.requestedCount) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent(
              ((stats.requestedCount - stats.paidCount) /
                stats.requestedCount) *
                100
            )}
          </div>
        </div>
      </>
    );
  } else if (activeTab === '결제' && stats) {
    const totalPayment = stats.card + stats.transfer + stats.cash;
    return (
      <>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">카드</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{
                width: `${(stats.card / totalPayment) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((stats.card / totalPayment) * 100)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">계좌이체</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{
                width: `${(stats.transfer / totalPayment) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((stats.transfer / totalPayment) * 100)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">현금</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-orange-500 h-4 rounded-full"
              style={{
                width: `${(stats.cash / totalPayment) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((stats.cash / totalPayment) * 100)}
          </div>
        </div>
      </>
    );
  } else if (activeTab === '예약관리' && stats) {
    const completedCount = stats.reservationCount - stats.cancelledCount;
    return (
      <>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">완료</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{
                width: `${(completedCount / stats.reservationCount) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((completedCount / stats.reservationCount) * 100)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">취소</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-red-500 h-4 rounded-full"
              style={{
                width: `${(stats.cancelledCount / stats.reservationCount) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent(
              (stats.cancelledCount / stats.reservationCount) * 100
            )}
          </div>
        </div>
      </>
    );
  } else if (activeTab === '매니저별점' && stats) {
    // 5점 만점 기준 평점 분포 시각화
    const ratingPercent = (stats.avgRating / 5) * 100;
    const reviewCountLevel =
      stats.reviewCount > 500 ? 100 : (stats.reviewCount / 500) * 100;

    return (
      <>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">평점</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-yellow-500 h-4 rounded-full"
              style={{
                width: `${ratingPercent}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent(ratingPercent)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">참여도</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{
                width: `${reviewCountLevel}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent(reviewCountLevel)}
          </div>
        </div>
      </>
    );
  } else if (activeTab === '매칭' && stats) {
    return (
      <>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">성공</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{
                width: `${(stats.successCount / stats.totalCount) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((stats.successCount / stats.totalCount) * 100)}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 text-sm text-gray-600">실패/취소</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
            <div
              className="bg-red-500 h-4 rounded-full"
              style={{
                width: `${(stats.failCount / stats.totalCount) * 100}%`,
              }}
            ></div>
          </div>
          <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
            {formatPercent((stats.failCount / stats.totalCount) * 100)}
          </div>
        </div>
      </>
    );
  }
  return null;
};

/**
 * 분포 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.activeTab - 활성 탭
 * @param {Object} props.stats - 통계 데이터
 * @param {boolean} props.loading - 로딩 상태
 * @returns {JSX.Element|null} 분포 차트 컴포넌트
 */
const DistributionChart = ({ activeTab, stats, loading }) => {
  // 전체 탭에서는 분포 차트를 표시하지 않음
  if (activeTab === '전체') {
    return null;
  }

  const distributionTitle = getDistributionTitle(activeTab);

  return (
    <div className="w-full mt-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {distributionTitle}
        </h3>
        {!loading && <DistributionLegend activeTab={activeTab} stats={stats} />}
      </div>

      {/* Bar chart */}
      <div className="space-y-4 w-full">
        {loading ? (
          <>
            <div className="flex items-center">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mr-4"></div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4 animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mr-4"></div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4 animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </>
        ) : stats ? (
          <DistributionBars activeTab={activeTab} stats={stats} />
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">
              데이터를 불러올 수 없습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributionChart;
