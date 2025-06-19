import React, { useState } from 'react';

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

  const tabs = [
    '전체 (234)',
    '대기중 (34)',
    '진행중 (89)',
    '완료 (108)',
    '실패 (3)',
  ];

  const filterButtons = [
    '전체',
    '오늘',
    '이번주',
    '이번달',
    '서비스별',
    '지역별',
    '금액별',
  ];

  const stats = [
    {
      title: '진행중 매칭',
      value: '89',
      subValue: '신규: 23건\n진행: 66건',
      icon: (
        <svg
          className="w-5 h-5 text-green-600"
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
      iconBg: 'bg-green-100',
    },
    {
      title: '매칭 요청 대기',
      value: '34',
      subValue: '+12건 오늘 신규',
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
      title: '매칭 성공률',
      value: '94.2%',
      subValue: '성공: 1854건\n실패: 108건',
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
      title: '매칭 수수료 (이번달)',
      value: '₩12,450,000',
      subValue: '+18.5% 지난달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
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
      iconBg: 'bg-blue-100',
    },
  ];

  const matchingData = [
    {
      id: '#M2024001',
      customer: {
        name: '김철수',
        address: 'IT컨설팅 요청',
      },
      manager: {
        name: '박민수',
        rating: '4.8',
      },
      service: {
        name: 'IT컨설팅',
        description: '시스템 분석 및 설계',
      },
      status: '진행중',
      requestDate: '2024.01.10',
      amount: '₩150,000',
    },
    {
      id: '#M2024002',
      customer: {
        name: '이영희',
        address: '마케팅 컨설팅',
      },
      manager: {
        name: '김영수',
        rating: '4.6',
      },
      service: {
        name: '마케팅',
        description: '디지털 마케팅 전략',
      },
      status: '대기',
      requestDate: '2024.01.12',
      amount: '₩200,000',
    },
    {
      id: '#M2024003',
      customer: {
        name: '박지훈',
        address: '웹개발 프로젝트',
      },
      manager: {
        name: '최민호',
        rating: '4.9',
      },
      service: {
        name: '웹개발',
        description: '풀스택 개발',
      },
      status: '완료',
      requestDate: '2024.01.08',
      amount: '₩300,000',
    },
    {
      id: '#M2024004',
      customer: {
        name: '정수연',
        address: '디자인 컨설팅',
      },
      manager: {
        name: '한지민',
        rating: '4.7',
      },
      service: {
        name: '디자인',
        description: 'UX/UI 디자인',
      },
      status: '진행중',
      requestDate: '2024.01.13',
      amount: '₩180,000',
    },
    {
      id: '#M2024005',
      customer: {
        name: '송민재',
        address: '법무 컨설팅',
      },
      manager: {
        name: '이준호',
        rating: '4.5',
      },
      service: {
        name: '법무',
        description: '계약서 검토',
      },
      status: '실패',
      requestDate: '2024.01.09',
      amount: '₩0',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-none space-y-6">
          {/* Stats Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {stats.map((stat, index) => (
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
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="w-full p-6">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {filterButtons.map((button) => (
                  <button
                    key={button}
                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {button}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매칭 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수요자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매니저
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        서비스
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        요청일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        요금
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상세보기
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {matchingData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.customer.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.manager.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              평점 {item.manager.rating} ⭐
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.service.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.service.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.status === '완료'
                                ? 'bg-green-100 text-green-800'
                                : item.status === '진행중'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : item.status === '대기'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.requestDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
