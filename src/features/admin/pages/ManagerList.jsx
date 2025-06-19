import React from 'react';

const ManagerList = () => {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">매니저 조회</h1>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            <span>승인 대기 12건 · 컨토 중 7건</span>
          </div>
        </div>

        {/* Top toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
              />
            </svg>
            <input
              type="text"
              placeholder="매니저 검색..."
              className="w-full sm:w-64 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            필터
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            일괄승인
          </button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
                12
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="truncate">신규 지원: 8건</div>
                <div className="truncate">재심사: 4건</div>
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

        {/* 컨토 중 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 truncate">
                  컨토 중
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 truncate">
                7
              </div>
              <div className="text-sm text-blue-600 truncate">
                평균 컨토시간: 1.5시간
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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
                23
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
                <span className="truncate">이번 주 +5명</span>
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

        {/* 반려 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                반려
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                3
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="truncate">서류 미비: 2건</div>
                <div className="truncate">자격 미달: 1건</div>
              </div>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-600"
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
          컨토중 (7)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          승인완료 (23)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          반려 (3)
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
                  경력
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  지원일
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  상태
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  서류검토
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  컨토일정
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        박
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        박민수
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        ID: M2024001
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="text-gray-900 whitespace-nowrap">
                      IT컨설팅
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      웹개발, DB설계
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      5년
                    </div>
                    <div className="text-xs text-gray-500">경력</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  2024.01.10
                </td>
                <td className="py-4 px-6">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    승인대기
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 whitespace-nowrap">
                      통과
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                  미정
                </td>
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        김
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        김영수
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        ID: M2024002
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="text-gray-900 whitespace-nowrap">
                      마케팅
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      디지털마케팅, SNS
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      3년
                    </div>
                    <div className="text-xs text-gray-500">경력</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  2024.01.12
                </td>
                <td className="py-4 px-6">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    컨토중
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 whitespace-nowrap">
                      통과
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm">
                    <div className="text-gray-900 whitespace-nowrap">
                      2024.01.16
                    </div>
                    <div className="text-gray-500 whitespace-nowrap">
                      14:00 - 15:00
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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

export default ManagerList;
