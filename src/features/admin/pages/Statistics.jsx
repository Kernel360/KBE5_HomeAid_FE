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

const Statistics = () => {
  const [activeMainTab, setActiveMainTab] = useState('회원현황');
  const [activeTimeTab, setActiveTimeTab] = useState('30일');

  const mainTabs = ['회원현황 통계', '정산 통계', '결제 통계'];
  const timeTabs = ['7일', '30일', '90일'];

  const stats = [
    {
      title: '총 매출',
      value: '₩125,430,000',
      subValue: '+24.5% 이번 달',
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
    {
      title: '총 서비스 건수',
      value: '2,847',
      subValue: '+18.2% 이번 달',
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
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
      iconBg: 'bg-blue-100',
    },
    {
      title: '평균 평점',
      value: '4.8',
      subValue: '총 1,234개 리뷰',
      icon: (
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      iconBg: 'bg-yellow-100',
    },
    {
      title: '활성 매니저',
      value: '147',
      subValue: '전체 192명 중',
      icon: (
        <svg
          className="w-5 h-5 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      iconBg: 'bg-purple-100',
    },
    {
      title: '고객 만족도',
      value: '94.2%',
      subValue: '+2.1% 이번 달',
      icon: (
        <svg
          className="w-5 h-5 text-pink-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-pink-100',
    },
    {
      title: '이번 달 신규 고객',
      value: '89',
      subValue: '+12.7% 지난 달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-indigo-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-none space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div>
              <p className="text-sm text-gray-500 mt-1">
                비즈니스 성과와 트렌드를 한눈에 확인하세요
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                📅 최근 30일
              </button>
              <button className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                ⬇️ 리포트 다운로드
              </button>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-200">
              {mainTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab.split(' ')[0])}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeMainTab === tab.split(' ')[0]
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-full p-6">
              {/* Stats Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-6">
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

              {/* Chart Section */}
              <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    회원 증가 추이
                  </h3>
                  <div className="flex space-x-2">
                    {timeTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTimeTab(tab)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          activeTimeTab === tab
                            ? 'text-white bg-blue-600'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative chart-container">
                  <svg
                    viewBox="0 0 800 200"
                    className="w-full h-full max-w-full"
                  >
                    <defs>
                      <linearGradient
                        id="memberGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: '#3B82F6', stopOpacity: 0.8 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: '#3B82F6', stopOpacity: 0.1 }}
                        />
                      </linearGradient>
                    </defs>

                    {/* Member growth line */}
                    <path
                      d="M50,160 L150,140 L250,120 L350,100 L450,85 L550,70 L650,55 L750,40"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                    />
                    <path
                      d="M50,160 L150,140 L250,120 L350,100 L450,85 L550,70 L650,55 L750,40 L750,200 L50,200 Z"
                      fill="url(#memberGradient)"
                    />

                    {/* Data points */}
                    {[50, 150, 250, 350, 450, 550, 650, 750].map((x, i) => {
                      const y = 160 - i * 17;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#3B82F6"
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>

                  {/* X-axis labels */}
                  <div className="absolute bottom-4 left-6 flex justify-between w-full pr-12 text-sm text-gray-600">
                    <span>1/1</span>
                    <span>1/8</span>
                    <span>1/15</span>
                    <span>1/22</span>
                    <span>1/30</span>
                  </div>
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="w-full mt-6 bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    회원 분포
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>수요자</span>
                      <span className="ml-2 font-semibold text-blue-600">
                        78건 (61%)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>매니저</span>
                      <span className="ml-2 font-semibold text-green-600">
                        49건 (39%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bar chart representation */}
                <div className="space-y-4 w-full">
                  <div className="flex items-center">
                    <div className="w-16 sm:w-20 text-sm text-gray-600">
                      수요자
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                      <div
                        className="bg-blue-500 h-4 rounded-full"
                        style={{ width: '61%' }}
                      ></div>
                    </div>
                    <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                      61%
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 sm:w-20 text-sm text-gray-600">
                      매니저
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                      <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: '39%' }}
                      ></div>
                    </div>
                    <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                      39%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
