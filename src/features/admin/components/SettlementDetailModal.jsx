import React from 'react';

const SettlementDetailModal = ({
  isOpen,
  onClose,
  settlementDetail,
  loading,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    if (!amount) return '₩0';
    return `₩${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getSettlementStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: '승인대기', color: 'bg-yellow-100 text-yellow-800' };
      case 'CONFIRMED':
        return { text: '승인완료', color: 'bg-blue-100 text-blue-800' };
      case 'PAID':
        return { text: '지급완료', color: 'bg-green-100 text-green-800' };
      default:
        return { text: '미생성', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getManagerStatus = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { text: '활성', color: 'bg-green-100 text-green-800' };
      case 'INACTIVE':
        return { text: '비활성', color: 'bg-gray-100 text-gray-800' };
      case 'SUSPENDED':
        return { text: '정지', color: 'bg-red-100 text-red-800' };
      default:
        return { text: '알 수 없음', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl mx-4 max-h-[95vh] flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="relative p-8 border-b border-gray-100 flex-shrink-0">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">정산 상세 정보</h3>
            <p className="text-sm text-gray-500 mt-1">
              매니저 정산 내역 및 상세 정보
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">정산 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : settlementDetail ? (
            <div className="p-8 space-y-8">
              {/* 정산 기본 정보 및 매니저 정보 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 정산 기본 정보 */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                    <h4 className="text-lg font-bold text-gray-900">
                      정산 기본 정보
                    </h4>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        정산 ID
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        #{settlementDetail.id}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        정산 상태
                      </label>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          getSettlementStatus(settlementDetail.status).color
                        }`}
                      >
                        {getSettlementStatus(settlementDetail.status).text}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        정산 기간
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(settlementDetail.from)} ~{' '}
                        {formatDate(settlementDetail.to)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        정산 생성일
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDateTime(settlementDetail.settledAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 매니저 정보 */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                      <h4 className="text-lg font-bold text-gray-900">
                        매니저 정보
                      </h4>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        getManagerStatus(settlementDetail.managerStatus).color
                      }`}
                    >
                      {getManagerStatus(settlementDetail.managerStatus).text}
                    </span>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        매니저 ID
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        #{settlementDetail.managerId}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        매니저 이름
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {settlementDetail.managerName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        연락처
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {settlementDetail.managerPhone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        이메일
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {settlementDetail.managerEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 금액 정보 */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                  <h4 className="text-lg font-bold text-gray-900">금액 정보</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {formatCurrency(settlementDetail.totalAmount)}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      총 수익
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {formatCurrency(settlementDetail.managerAmount)}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      매니저 정산액 (80%)
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {formatCurrency(settlementDetail.adminAmount)}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      관리자 수수료 (20%)
                    </div>
                  </div>
                </div>
              </div>

              {/* 처리 상태 */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></div>
                  <h4 className="text-xl font-bold text-gray-900">처리 상태</h4>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    <div className="flex items-center relative">
                      <div className="relative z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900">
                            정산 생성
                          </h5>
                          <p className="text-sm text-gray-500">
                            정산 내역이 생성되었습니다
                          </p>
                        </div>
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                          {formatDateTime(settlementDetail.settledAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center relative">
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                          settlementDetail.confirmedAt
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 ${settlementDetail.confirmedAt ? 'text-white' : 'text-gray-500'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <h5
                            className={`text-lg font-semibold ${settlementDetail.confirmedAt ? 'text-gray-900' : 'text-gray-400'}`}
                          >
                            승인 완료
                          </h5>
                          <p
                            className={`text-sm ${settlementDetail.confirmedAt ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            관리자가 정산을 승인했습니다
                          </p>
                        </div>
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-lg ${
                            settlementDetail.confirmedAt
                              ? 'text-gray-600 bg-gray-100'
                              : 'text-gray-400 bg-gray-50'
                          }`}
                        >
                          {formatDateTime(settlementDetail.confirmedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center relative">
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                          settlementDetail.paidAt
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 ${settlementDetail.paidAt ? 'text-white' : 'text-gray-500'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <h5
                            className={`text-lg font-semibold ${settlementDetail.paidAt ? 'text-gray-900' : 'text-gray-400'}`}
                          >
                            지급 완료
                          </h5>
                          <p
                            className={`text-sm ${settlementDetail.paidAt ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            매니저에게 정산금이 지급되었습니다
                          </p>
                        </div>
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-lg ${
                            settlementDetail.paidAt
                              ? 'text-gray-600 bg-gray-100'
                              : 'text-gray-400 bg-gray-50'
                          }`}
                        >
                          {formatDateTime(settlementDetail.paidAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  정산 정보를 불러올 수 없습니다
                </h3>
                <p className="text-gray-500">다시 시도해주세요.</p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetailModal;
