import React, { useState, useEffect } from 'react';
import { api } from '../../../api/config/api';
import { useAuthStore } from '../../../stores/authStore';

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

// 답변 작성/수정 모달 컴포넌트
const ReplyModal = ({
  isOpen,
  onClose,
  inquiry,
  existingReply = null,
  onSubmit,
  isSubmitting,
}) => {
  const [content, setContent] = useState(existingReply?.content || '');

  useEffect(() => {
    if (existingReply) {
      setContent(existingReply.content);
    } else {
      setContent('');
    }
  }, [existingReply, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {existingReply ? '답변 수정' : '답변 작성'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* 문의 내용 표시 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">원본 문의</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="font-medium">작성자:</span>
                  <span
                    className={`${
                      inquiry?.userName
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {inquiry?.userName || `사용자 ${inquiry?.userId}`}
                  </span>
                  {inquiry?.userId && (
                    <span className="text-xs text-gray-400">
                      (ID: {inquiry.userId})
                    </span>
                  )}
                </span>
                <span className="flex items-center space-x-1">
                  <span className="font-medium">유형:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      inquiry?.userRole === 'CUSTOMER'
                        ? 'bg-blue-100 text-blue-800'
                        : inquiry?.userRole === 'MANAGER'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {inquiry?.userRole === 'CUSTOMER'
                      ? '수요자'
                      : inquiry?.userRole === 'MANAGER'
                        ? '매니저'
                        : `역할: ${inquiry?.userRole || 'null'}`}
                  </span>
                </span>
                <span>
                  <span className="font-medium">작성일:</span>{' '}
                  {inquiry?.createdAt
                    ? new Date(inquiry.createdAt).toLocaleString('ko-KR')
                    : '-'}
                </span>
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">
                <div className="font-medium text-gray-900 mb-1">
                  제목: {inquiry?.title || '제목 없음'}
                </div>
                <div>내용: {inquiry?.content || '내용이 없습니다.'}</div>
              </div>
            </div>
          </div>

          {/* 답변 작성 폼 */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="reply-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                답변 내용
              </label>
              <textarea
                id="reply-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="답변 내용을 입력하세요..."
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? existingReply
                    ? '수정 중...'
                    : '작성 중...'
                  : existingReply
                    ? '수정'
                    : '작성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Inquiries = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // 페이징 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // 한 페이지에 10개씩

  // 모달 상태
  const [replyModal, setReplyModal] = useState({
    isOpen: false,
    inquiry: null,
    existingReply: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 통계 상태
  const [stats, setStats] = useState({
    total: 0,
    unanswered: 0,
    answered: 0,
    customer: 0,
    manager: 0,
  });

  // 탭별 문의 건수 계산
  const getTabCount = (type) => {
    switch (type) {
      case '전체':
        return stats.total;
      case '수요자문의':
        return stats.customer;
      case '매니저문의':
        return stats.manager;
      case '미답변':
        return stats.unanswered;
      default:
        return 0;
    }
  };

  const tabs = [
    { key: '전체', label: `전체 (${getTabCount('전체')})`, filter: null },
    {
      key: '수요자문의',
      label: `수요자문의 (${getTabCount('수요자문의')})`,
      filter: 'CUSTOMER',
    },
    {
      key: '매니저문의',
      label: `매니저문의 (${getTabCount('매니저문의')})`,
      filter: 'MANAGER',
    },
    {
      key: '미답변',
      label: `미답변 (${getTabCount('미답변')})`,
      filter: 'UNANSWERED',
    },
  ];

  // 각 문의글의 답변 상태를 확인하는 함수
  const checkReplyStatus = async (inquiry) => {
    try {
      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return {
          ...inquiry,
          isAnswered: false,
          reply: null,
        };
      }

      // localStorage에서 답변 데이터 가져오기
      const savedAnsweredIds = JSON.parse(
        localStorage.getItem('answeredInquiries') || '[]'
      );
      const savedReplies = JSON.parse(
        localStorage.getItem('inquiryReplies') || '{}'
      );

      // localStorage에 저장된 답변이 있는지 먼저 확인
      if (savedAnsweredIds.includes(inquiry.id) && savedReplies[inquiry.id]) {
        return {
          ...inquiry,
          isAnswered: true,
          reply: savedReplies[inquiry.id],
        };
      }

      // 백엔드 API 구조에 맞는 답변 조회 엔드포인트
      const endpoint = `/admin/inquiries/board/${inquiry.id}/reply`;

      try {
        const response = await api.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const replyData = response.data?.data || response.data;

        if (replyData && replyData.content) {
          // localStorage에 답변 정보 저장
          if (!savedAnsweredIds.includes(inquiry.id)) {
            savedAnsweredIds.push(inquiry.id);
            localStorage.setItem(
              'answeredInquiries',
              JSON.stringify(savedAnsweredIds)
            );
          }

          const replyToSave = {
            id: replyData.id,
            content: replyData.content,
            createdAt: replyData.createdAt || new Date().toISOString(),
            adminId: replyData.adminId || replyData.userId,
            adminName: replyData.userName || '관리자',
            userRole: replyData.userRole || 'ADMIN',
          };

          savedReplies[inquiry.id] = replyToSave;
          localStorage.setItem('inquiryReplies', JSON.stringify(savedReplies));

          return {
            ...inquiry,
            isAnswered: true,
            reply: replyToSave,
          };
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(`답변 조회 실패 (${endpoint}):`, err);
        }
      }

      // 답변을 찾지 못한 경우
      return {
        ...inquiry,
        isAnswered: false,
        reply: null,
      };
    } catch (err) {
      console.error('답변 상태 확인 중 오류:', err);
      return {
        ...inquiry,
        isAnswered: false,
        reply: null,
      };
    }
  };

  // 모든 문의글의 답변 상태를 확인하는 함수
  const checkAllRepliesStatus = async (inquiries) => {
    try {
      const updatedInquiries = await Promise.all(
        inquiries.map(async (inquiry) => {
          const updatedInquiry = await checkReplyStatus(inquiry);
          return updatedInquiry;
        })
      );

      return updatedInquiries;
    } catch (err) {
      console.error('답변 상태 일괄 확인 중 오류:', err);
      return inquiries;
    }
  };

  // 문의글 목록 조회
  const fetchInquiries = async () => {
    setLoading(true);

    const token = localStorage.getItem('accessToken');

    if (import.meta.env.DEV) {
      console.log('=== 토큰 상태 확인 ===');
      console.log('토큰 존재:', token ? '✅' : '❌');
      if (token) {
        console.log('토큰 길이:', token.length);
        console.log('토큰 시작:', token.substring(0, 20) + '...');

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('토큰 페이로드:', {
            ...payload,
            현재시간: Math.floor(Date.now() / 1000),
            만료여부:
              payload.exp < Math.floor(Date.now() / 1000) ? '만료됨' : '유효함',
          });
        } catch (e) {
          console.log('토큰 파싱 실패:', e.message);
        }
      }

      const authState = useAuthStore.getState();
      console.log('Zustand 인증 상태:', {
        user: authState.user,
        accessToken: authState.accessToken ? '있음' : '없음',
        refreshToken: authState.refreshToken ? '있음' : '없음',
      });
    }

    // 여러 엔드포인트와 파라미터 조합 시도
    const endpoints = [
      '/boards',
      '/admin/inquiries',
      '/admin/inquiries/boards',
      '/admin/boards',
      '/api/boards',
      '/api/admin/inquiries',
      '/v1/boards',
      '/v1/admin/inquiries',
      '/admin/inquiries/all',
      '/boards/all',
    ];

    const parameterSets = [
      { page: currentPage, size: 10 },
      {},
      { page: currentPage, size: 100 },
      {
        page: currentPage,
        size: 10,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
      {
        keyword: '',
        page: currentPage,
        size: 10,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
      { admin: true, page: currentPage, size: 10 },
      { includeAll: true, page: currentPage, size: 50 },
    ];

    try {
      let response = null;

      // 각 엔드포인트 시도
      for (const endpoint of endpoints) {
        if (import.meta.env.DEV) {
          console.log(`=== API 엔드포인트 시도: ${endpoint} ===`);
        }

        // 각 파라미터 세트 시도
        for (const params of parameterSets) {
          try {
            if (import.meta.env.DEV) {
              console.log('요청 파라미터:', params);
              console.log(
                'Authorization 헤더:',
                `Bearer ${token?.substring(0, 20)}...`
              );
            }

            const testResponse = await api.get(endpoint, { params });

            if (import.meta.env.DEV) {
              console.log(`${endpoint} 응답:`, testResponse.data);
            }

            // 성공적인 응답이고 데이터가 있는지 확인
            if (testResponse.data && testResponse.data.success !== false) {
              const responseData = testResponse.data.data || testResponse.data;

              if (
                responseData &&
                responseData.content &&
                responseData.content.length > 0
              ) {
                if (import.meta.env.DEV) {
                  console.log(
                    `🎯 데이터 발견! 엔드포인트: ${endpoint}, 데이터 개수: ${responseData.content.length}`
                  );
                }
                response = testResponse;
                break;
              } else if (
                responseData &&
                responseData.content &&
                responseData.content.length === 0
              ) {
                if (import.meta.env.DEV) {
                  console.log(
                    `⚠️ ${endpoint}에서 빈 데이터 반환 - 다른 파라미터 시도`
                  );
                }
                continue;
              }
            }
          } catch (paramError) {
            if (import.meta.env.DEV) {
              console.log(
                `❌ 파라미터 ${JSON.stringify(params)} 실패:`,
                paramError.response?.status
              );
            }
            continue;
          }
        }

        if (response) break;
      }

      if (!response) {
        throw new Error('모든 엔드포인트에서 데이터를 가져올 수 없습니다.');
      }

      const responseData = response.data.data || response.data;
      const inquiriesData = responseData.content || [];

      if (import.meta.env.DEV) {
        console.log('=== INQUIRIES API Response ANALYSIS ===');
        console.log('Full response:', response.data);
        console.log('Response data:', responseData);
        console.log('Inquiries array length:', inquiriesData.length);
        console.log('Total elements:', responseData.totalElements);
        console.log('Total pages:', responseData.totalPages);
        console.log('Current page:', responseData.currentPage);

        console.log('\n=== INQUIRY DATA STRUCTURE ANALYSIS ===');
        inquiriesData.slice(0, 10).forEach((inquiry, index) => {
          console.log(`--- Inquiry ${index + 1} (ID: ${inquiry.id}) ---`);
          console.log('Full object:', inquiry);
          console.log('Keys:', Object.keys(inquiry));
          Object.entries(inquiry).forEach(([key, value]) => {
            console.log(`  ${key}: ${value} (type: ${typeof value})`);
          });
          console.log('---');
        });
        console.log('==========================================');
      }

      // 페이지네이션 정보 업데이트
      setTotalPages(responseData.totalPages || 1);
      setTotalElements(responseData.totalElements || inquiriesData.length);

      if (inquiriesData.length > 0) {
        // 사용자 역할 매핑 함수
        const mapUserRole = (userName) => {
          if (userName && userName.includes('매니저')) {
            return 'MANAGER';
          }
          return 'CUSTOMER';
        };

        // 실제 백엔드 응답 구조에 맞게 매핑
        const mappedInquiries = inquiriesData.map((inquiry) => {
          const mappedInquiry = {
            id: inquiry.id,
            title: inquiry.title || '제목 없음',
            content: inquiry.content || '내용 없음',
            userId: inquiry.userId,
            userName: inquiry.userName || `사용자${inquiry.userId}`,
            userRole:
              inquiry.userRole || inquiry.role || mapUserRole(inquiry.userName),
            createdAt: inquiry.createdAt,
            updatedAt: inquiry.updatedAt,
            // 백엔드에서 답변 정보를 제공한다면 그대로 사용, 없으면 null로 초기화
            isAnswered: inquiry.isAnswered || false,
            reply: inquiry.reply || null,
          };

          return mappedInquiry;
        });

        // 모든 문의글의 답변 상태 확인
        const inquiriesWithReplies =
          await checkAllRepliesStatus(mappedInquiries);

        setInquiries(inquiriesWithReplies);
        calculateStats(inquiriesWithReplies);
      } else {
        throw new Error(
          response.data?.message ||
            '문의글 데이터를 불러오는 중 오류가 발생했습니다.'
        );
      }
    } catch (err) {
      console.error('Boards fetch error:', err);

      // 네트워크 에러인 경우 백엔드 연결 상태 업데이트
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setIsBackendConnected(false);
      } else {
        setIsBackendConnected(true);
      }

      // API 오류 시 빈 배열로 설정
      setInquiries([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산
  const calculateStats = (inquiriesData) => {
    const total = inquiriesData.length;
    const answered = inquiriesData.filter(
      (inquiry) => inquiry.isAnswered
    ).length;
    const unanswered = total - answered;
    const customer = inquiriesData.filter(
      (inquiry) => inquiry.userRole === 'CUSTOMER'
    ).length;
    const manager = inquiriesData.filter(
      (inquiry) => inquiry.userRole === 'MANAGER'
    ).length;

    setStats({
      total,
      answered,
      unanswered,
      customer,
      manager,
    });
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchInquiries();
  }, [activeTab, searchTerm, currentPage]); // currentPage 추가하여 페이지 변경 시에도 다시 로드

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 검색어 변경 시 첫 페이지로 리셋
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  // 탭 변경 시 첫 페이지로 리셋
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  // 필터링된 문의 목록 - 클라이언트 사이드 필터링
  const getFilteredInquiries = () => {
    let filtered = inquiries;

    // 탭별 필터링
    if (activeTab === '수요자문의') {
      filtered = filtered.filter((inquiry) => inquiry.userRole === 'CUSTOMER');
    } else if (activeTab === '매니저문의') {
      filtered = filtered.filter((inquiry) => inquiry.userRole === 'MANAGER');
    } else if (activeTab === '미답변') {
      filtered = filtered.filter((inquiry) => !inquiry.isAnswered);
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((inquiry) => {
        if (searchType === 'title') {
          return inquiry.title?.toLowerCase().includes(searchLower);
        } else if (searchType === 'content') {
          return inquiry.content?.toLowerCase().includes(searchLower);
        } else if (searchType === 'userName') {
          return inquiry.userName?.toLowerCase().includes(searchLower);
        } else {
          // 전체 검색
          return (
            inquiry.title?.toLowerCase().includes(searchLower) ||
            inquiry.content?.toLowerCase().includes(searchLower) ||
            inquiry.userName?.toLowerCase().includes(searchLower)
          );
        }
      });
    }

    return filtered;
  };

  const filteredInquiries = getFilteredInquiries();

  const statCards = [
    {
      title: '전체 문의',
      value: `${stats.total}건`,
      subValue: `답변완료: ${stats.answered}건\n미답변: ${stats.unanswered}건`,
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-blue-100',
    },
    {
      title: '미답변',
      value: `${stats.unanswered}건`,
      subValue: `처리 대기 중인 문의`,
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
      title: '답변완료',
      value: `${stats.answered}건`,
      subValue: `처리 완료된 문의`,
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
      title: '답변률',
      value: `${stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0}%`,
      subValue: `수요자: ${stats.customer}건\n매니저: ${stats.manager}건`,
      icon: (
        <svg
          className="w-5 h-5 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-purple-100',
    },
  ];

  // 답변 작성
  const handleCreateReply = async (content) => {
    try {
      setIsSubmitting(true);
      const boardId = replyModal.inquiry.id;
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await api.post(
        `/admin/inquiries/board/${boardId}`,
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const newReplyData = response.data.data;

        // localStorage 업데이트
        const savedAnsweredIds = JSON.parse(
          localStorage.getItem('answeredInquiries') || '[]'
        );
        if (!savedAnsweredIds.includes(boardId)) {
          savedAnsweredIds.push(boardId);
          localStorage.setItem(
            'answeredInquiries',
            JSON.stringify(savedAnsweredIds)
          );
        }

        const savedReplies = JSON.parse(
          localStorage.getItem('inquiryReplies') || '{}'
        );
        const replyToSave = {
          id: newReplyData.id,
          content: newReplyData.content,
          createdAt: newReplyData.createdAt || new Date().toISOString(),
          adminId: newReplyData.adminId || newReplyData.userId,
          adminName: newReplyData.userName || '관리자',
          userRole: newReplyData.userRole || 'ADMIN',
        };
        savedReplies[boardId] = replyToSave;
        localStorage.setItem('inquiryReplies', JSON.stringify(savedReplies));

        // 상태 업데이트
        setInquiries((prevInquiries) =>
          prevInquiries.map((inquiry) =>
            inquiry.id === boardId
              ? {
                  ...inquiry,
                  isAnswered: true,
                  reply: replyToSave,
                }
              : inquiry
          )
        );

        // 통계 업데이트
        setStats((prevStats) => ({
          ...prevStats,
          answered: prevStats.answered + 1,
          unanswered: Math.max(0, prevStats.unanswered - 1),
        }));

        alert('답변이 성공적으로 작성되었습니다.');
        setReplyModal({ isOpen: false, inquiry: null, existingReply: null });

        // 데이터 새로고침
        await fetchInquiries();
      }
    } catch (err) {
      console.error('답변 작성 오류:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        // TODO: 로그아웃 처리 또는 토큰 갱신 로직 추가
      } else {
        alert(
          err.response?.data?.message ||
            err.message ||
            '답변 작성 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 답변 수정
  const handleUpdateReply = async (content) => {
    try {
      setIsSubmitting(true);
      const boardId = replyModal.inquiry.id;
      const replyId = replyModal.existingReply.id;
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await api.put(
        `/admin/inquiries/board/${boardId}/reply/${replyId}`,
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const updatedReplyData = response.data.data;

        // localStorage 업데이트
        const savedReplies = JSON.parse(
          localStorage.getItem('inquiryReplies') || '{}'
        );
        const replyToSave = {
          id: updatedReplyData.id,
          content: updatedReplyData.content,
          createdAt: updatedReplyData.createdAt,
          updatedAt: updatedReplyData.updatedAt || new Date().toISOString(),
          adminId: updatedReplyData.adminId || updatedReplyData.userId,
          adminName: updatedReplyData.userName || '관리자',
          userRole: updatedReplyData.userRole || 'ADMIN',
        };
        savedReplies[boardId] = replyToSave;
        localStorage.setItem('inquiryReplies', JSON.stringify(savedReplies));

        // 상태 업데이트
        setInquiries((prevInquiries) =>
          prevInquiries.map((inquiry) =>
            inquiry.id === boardId
              ? {
                  ...inquiry,
                  isAnswered: true,
                  reply: replyToSave,
                }
              : inquiry
          )
        );

        alert('답변이 성공적으로 수정되었습니다.');
        setReplyModal({ isOpen: false, inquiry: null, existingReply: null });

        // 데이터 새로고침
        await fetchInquiries();
      }
    } catch (err) {
      console.error('답변 수정 오류:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        // TODO: 로그아웃 처리 또는 토큰 갱신 로직 추가
      } else {
        alert(
          err.response?.data?.message ||
            err.message ||
            '답변 수정 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 답변 삭제
  const handleDeleteReply = async (inquiry) => {
    if (!inquiry.reply || !window.confirm('답변을 삭제하시겠습니까?')) return;

    try {
      const boardId = inquiry.id;
      const replyId = inquiry.reply.id;
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await api.delete(
        `/admin/inquiries/board/${boardId}/reply/${replyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        // localStorage 업데이트
        const savedAnsweredIds = JSON.parse(
          localStorage.getItem('answeredInquiries') || '[]'
        );
        const updatedAnsweredIds = savedAnsweredIds.filter(
          (id) => id !== boardId
        );
        localStorage.setItem(
          'answeredInquiries',
          JSON.stringify(updatedAnsweredIds)
        );

        const savedReplies = JSON.parse(
          localStorage.getItem('inquiryReplies') || '{}'
        );
        delete savedReplies[boardId];
        localStorage.setItem('inquiryReplies', JSON.stringify(savedReplies));

        // 상태 업데이트
        setInquiries((prevInquiries) =>
          prevInquiries.map((inq) =>
            inq.id === boardId
              ? {
                  ...inq,
                  isAnswered: false,
                  reply: null,
                }
              : inq
          )
        );

        // 통계 업데이트
        setStats((prevStats) => ({
          ...prevStats,
          answered: Math.max(0, prevStats.answered - 1),
          unanswered: prevStats.unanswered + 1,
        }));

        alert('답변이 성공적으로 삭제되었습니다.');

        // 데이터 새로고침
        await fetchInquiries();
      }
    } catch (err) {
      console.error('답변 삭제 오류:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        // TODO: 로그아웃 처리 또는 토큰 갱신 로직 추가
      } else {
        alert(
          err.response?.data?.message ||
            err.message ||
            '답변 삭제 중 오류가 발생했습니다.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="max-w-none space-y-6">
          {/* API 상태 알림 */}
          {!isBackendConnected ? (
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    개발 모드 - 샘플 데이터 사용 중
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    백엔드 문의글 목록 조회 API가 준비되면 실제 데이터가
                    표시됩니다. 현재는 샘플 데이터로 UI를 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {statCards.map((stat, index) => (
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

          {/* Table */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 탭 */}
            <div className="flex bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 구분선 */}
            <div className="border-b border-gray-200 bg-white"></div>

            {/* 검색 영역 */}
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  문의 관리 {activeTab !== '전체' && `- ${activeTab}`}
                </h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                    <option value="userName">작성자</option>
                  </select>

                  <div className="w-80 relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="검색어를 입력하세요"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        번호
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        유형
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목/내용
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작성자
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작성일
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      [...Array(3)].map((_, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="space-y-2">
                              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                              <div className="w-32 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-12 h-12 text-gray-400 mb-4"
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
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              문의가 없습니다
                            </h3>
                            <p className="text-gray-500">
                              등록된 문의가 없습니다. 검색 조건을 변경하거나
                              데이터를 다시 로드해보세요.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inquiry, index) => {
                        return (
                          <tr
                            key={inquiry.id || index}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  inquiry.userRole === 'CUSTOMER'
                                    ? 'bg-blue-100 text-blue-800'
                                    : inquiry.userRole === 'MANAGER'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {inquiry.userRole === 'CUSTOMER'
                                  ? '수요자'
                                  : inquiry.userRole === 'MANAGER'
                                    ? '매니저'
                                    : `역할: ${inquiry?.userRole || 'null'}`}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {inquiry.title || '제목 없음'}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {inquiry.content
                                    ? inquiry.content
                                    : '내용을 불러올 수 없습니다.'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`font-medium ${
                                    inquiry.userName
                                      ? 'text-gray-900'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {inquiry.userName ||
                                    `사용자 ${inquiry.userId}`}
                                </span>
                                {inquiry.userId && (
                                  <span className="text-xs text-gray-400 mt-1">
                                    ID: {inquiry.userId}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              {inquiry.isAnswered ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  답변완료
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  답변대기
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {inquiry.createdAt
                                ? new Date(
                                    inquiry.createdAt
                                  ).toLocaleDateString('ko-KR')
                                : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2">
                                {inquiry.isAnswered ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        setReplyModal({
                                          isOpen: true,
                                          inquiry,
                                          existingReply: inquiry.reply,
                                        })
                                      }
                                      className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                      답변수정
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReply(inquiry)}
                                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setReplyModal({
                                        isOpen: true,
                                        inquiry,
                                        existingReply: null,
                                      })
                                    }
                                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    답변하기
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이징 네비게이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4">
                  <div className="text-sm text-gray-700">
                    총 {totalElements}개 중 {currentPage * pageSize + 1}-
                    {Math.min((currentPage + 1) * pageSize, totalElements)}개
                    표시
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>

                    {/* 페이지 번호들 */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 2) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'text-white bg-blue-600 border border-blue-600'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 답변 작성/수정 모달 */}
      <ReplyModal
        isOpen={replyModal.isOpen}
        onClose={() =>
          setReplyModal({ isOpen: false, inquiry: null, existingReply: null })
        }
        inquiry={replyModal.inquiry}
        existingReply={replyModal.existingReply}
        onSubmit={
          replyModal.existingReply ? handleUpdateReply : handleCreateReply
        }
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Inquiries;
