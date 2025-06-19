import React from 'react';

const Inquiries = () => {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">1:1 게시판 관리</h1>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            <span>미답변 23건 · 긴급 문의 3건</span>
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
              placeholder="문의 검색..."
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
            일괄처리
          </button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* 전체 문의 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                전체 문의
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                127건
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="truncate">오늘 신규: 8건</div>
                <div className="truncate">이번주: 34건</div>
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

        {/* 미답변 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 truncate">
                  미답변
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 truncate">
                23건
              </div>
              <div className="text-sm text-red-600 truncate">
                평균 대기시간: 4.2시간
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 답변완료 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                답변완료
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                104건
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
                <span className="truncate">평균 응답시간: 2.1시간</span>
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

        {/* 문의 응답률 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600 truncate block">
                문의 응답률
              </span>
              <div className="text-2xl font-bold text-gray-900 my-1 truncate">
                분석
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="truncate">이번 주: 94.2%</div>
                <div className="truncate">지난 주: 91.8%</div>
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-purple-600"
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
          전체조회 (127)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          회원문의 (89)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          매니저문의 (35)
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
          긴급문의 (3)
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
                  문의번호
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  문의자
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  제목
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  분류
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  긴급도
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  등록일
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  상태
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 whitespace-nowrap">
                  담당자
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
                    #Q2024001
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      김철수
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      수요자
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 truncate">
                      매칭 서비스 이용 중 오류 발생
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      매니저와 연결이 안 되는 문제...
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    기술문의
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    긴급
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  2024.01.15
                </td>
                <td className="py-4 px-6">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    미답변
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-500 whitespace-nowrap">-</td>
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
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
                    #Q2024002
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      박민수
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      매니저
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 truncate">
                      정산 관련 문의
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      이번 주 정산 금액이 맞지 않는 것 같습니다...
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    정산문의
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    보통
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-900 whitespace-nowrap">
                  2024.01.14
                </td>
                <td className="py-4 px-6">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    답변완료
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-900 whitespace-nowrap">
                    김관리자
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
            총 127개 중 1-5개 표시
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

export default Inquiries;
