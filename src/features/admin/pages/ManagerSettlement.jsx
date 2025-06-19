import React from 'react';

const ManagerSettlement = () => {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">매니저 정산</h1>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-2 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>2024년 1월 2주차 (1/8 - 1/14)</span>
          </div>
        </div>

        {/* Top toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            주간 선택
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-4 py-2 whitespace-nowrap">
            <svg
              className="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            정산서 다운로드
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 whitespace-nowrap">
            <svg
              className="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            일괄승인
          </button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* 이번주 총 정산금액 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                이번주 총 정산금액
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                ₩8,450,000
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="truncate">매니저 수: 23명</div>
                <div className="truncate">완료 건수: 45건</div>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 승인 대기 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 truncate">
                  승인 대기
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 truncate">
                12건
              </div>
              <div className="text-sm text-orange-600 truncate">
                ₩2,340,000 대기금액
              </div>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 승인 완료 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                승인 완료
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                33건
              </div>
              <div className="flex items-center text-sm text-green-600">
                <svg
                  className="w-4 h-4 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="truncate">₩6,110,000 승인금액</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 매니저당 평균 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                매니저당 평균
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                ₩367,391
              </div>
              <div className="flex items-center text-sm text-green-600">
                <svg
                  className="w-4 h-4 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                <span className="truncate">+15.2% 지난주 대비</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Responsive */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg whitespace-nowrap">
          전체 (45)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          승인대기 (12)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          승인완료 (33)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          지급완료 (28)
        </button>
      </div>

      {/* Table - Responsive */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  매니저
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  전문분야
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  완료건수
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  총 수수료
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  플랫폼 수수료
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  정산금액
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  상태
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  승인일
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      박민수
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      IT컨설팅
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  IT컨설팅
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  3건
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  ₩450,000
                </td>
                <td className="py-4 px-6 text-red-600 whitespace-nowrap">
                  ₩67,500
                </td>
                <td className="py-4 px-6 text-green-600 font-medium whitespace-nowrap">
                  ₩382,500
                </td>
                <td className="py-4 px-6">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    승인대기
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-500 whitespace-nowrap">-</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4"
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
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      김영수
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      마케팅 컨설팅
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  마케팅
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  5건
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  ₩750,000
                </td>
                <td className="py-4 px-6 text-red-600 whitespace-nowrap">
                  ₩112,500
                </td>
                <td className="py-4 px-6 text-green-600 font-medium whitespace-nowrap">
                  ₩637,500
                </td>
                <td className="py-4 px-6">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    대기중
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-500 whitespace-nowrap">-</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4"
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500 mb-4 sm:mb-0">
            총 45개 중 1-5개 표시
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              &lt;
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettlement;
