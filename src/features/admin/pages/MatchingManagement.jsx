import React from 'react';

const MatchingManagement = () => {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">매칭 관리</h1>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>실시간 업데이트: 2024.01.15 14:32</span>
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
              placeholder="매칭 검색..."
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 whitespace-nowrap">
            + 새 매칭
          </button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* 진행중 매칭 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 truncate">
                  진행중 매칭
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 truncate">
                89
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="truncate">신규: 23건</div>
                <div className="truncate">진행: 66건</div>
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 매칭 요청 대기 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                매칭 요청 대기
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                34
              </div>
              <div className="flex items-center text-sm text-orange-600">
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
                <span className="truncate">+12건 오늘 신규</span>
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

        {/* 매칭 성공률 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                매칭 성공률
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                94.2%
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="truncate">성공: 1854건</div>
                <div className="truncate">실패: 108건</div>
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

        {/* 매칭 수수료 (이번달) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                매칭 수수료 (이번달)
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                ₩12,450,000
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
                <span className="truncate">+18.5% 지난달 대비</span>
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
      </div>

      {/* Filter Tabs - Responsive */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg whitespace-nowrap">
          전체 (234)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          대기중 (34)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          진행중 (89)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          완료 (108)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          실패 (3)
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
                  매칭ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  수요자
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  매니저
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  서비스
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  매칭일
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  상태
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  진행률
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  수수료
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
                  <div className="font-medium text-blue-600 whitespace-nowrap">
                    #M2024001
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      김철수
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      IT컨설팅 요청
                    </div>
                  </div>
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
                  2024.01.10
                </td>
                <td className="py-4 px-6">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    진행중
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      75%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-green-600 font-medium whitespace-nowrap">
                  ₩150,000
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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
                  <div className="font-medium text-blue-600 whitespace-nowrap">
                    #M2024002
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      이영희
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      마케팅 컨설팅
                    </div>
                  </div>
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
                  2024.01.12
                </td>
                <td className="py-4 px-6">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    대기중
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      0%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                  ₩200,000
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
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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
            총 1,234개 중 1-5개 표시
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

export default MatchingManagement;
