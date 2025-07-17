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
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setContent(existingReply?.content || '');
    } else {
      setContent('');
    }
  }, [isOpen, existingReply]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
    >
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

  // 페이징 상태 추가
  // 페이징 상태 - 매칭 관리와 동일한 방식
  const [pagination, setPagination] = useState({
    page: 0, // 0부터 시작 (Spring Boot 방식)
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

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

  // 전체 통계 상태 (탭에 관계없이 항상 전체 통계 유지)
  const [overallStats, setOverallStats] = useState({
    total: 0,
    unanswered: 0,
    answered: 0,
  });

  // 권한 확인
  const { user } = useAuthStore();

  // 문의글과 답변을 함께 조회하는 함수
  const fetchBoardWithReply = async (boardId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 문의글과 답변을 함께 조회
      const response = await api.get(
        `/admin/inquiries/board/${boardId}/with-reply`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const data = response.data.data;
        // 개발 환경에서 원본 데이터 로깅
        if (import.meta.env.DEV) {
          console.log('Board with reply data:', data);
        }

        return data.reply; // 답변 정보만 반환
      }
      throw new Error('문의글과 답변 정보를 불러올 수 없습니다.');
    } catch (err) {
      console.error('문의글과 답변 조회 오류:', err);
      throw err;
    }
  };

  // 탭별 문의 건수 계산
  const getTabCount = (type) => {
    switch (type) {
      case '전체':
        return stats.total;
      case '답변대기':
        return stats.unanswered;
      default:
        return 0;
    }
  };

  const tabs = [
    { key: '전체', label: `전체 (${getTabCount('전체')})`, filter: null },
    {
      key: '답변대기',
      label: `답변대기 (${getTabCount('답변대기')})`,
      filter: 'UNANSWERED',
    },
  ];

  // 전체 통계 조회
  const fetchOverallStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await api.get('/admin/inquiries/boards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 0,
          size: 1000, // 전체 데이터를 가져오기 위해 큰 값 설정
        },
      });

      if (response.data?.success) {
        const allInquiries = response.data.data.content;
        
        // 전체 통계 계산
        const totalCount = allInquiries.length;
        const answeredCount = allInquiries.filter(inquiry => 
          inquiry.isAnswered === true ||
          inquiry.answered === true ||
          Boolean(inquiry.replyId) ||
          Boolean(inquiry.replyContent)
        ).length;
        const unansweredCount = totalCount - answeredCount;

        setOverallStats({
          total: totalCount,
          answered: answeredCount,
          unanswered: unansweredCount,
        });
      }
    } catch (err) {
      console.error('전체 통계 조회 오류:', err);
    }
  };

  // 문의글 목록 조회
  const fetchInquiries = async (page = pagination.page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 페이지 번호가 0 미만이 되지 않도록 보정
      const pageIndex = Math.max(0, page);

      const response = await api.get('/admin/inquiries/boards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: pageIndex,
          size: pagination.size,
          type:
            activeTab === '답변대기'
              ? 'UNANSWERED'
              : undefined,
          keyword: searchTerm.trim() || undefined,
        },
      });

      if (response.data?.success) {
        const inquiriesData = response.data.data.content;
        const totalElements = response.data.data.totalElements;

        // 개발 환경에서 원본 데이터 로깅
        if (import.meta.env.DEV) {
          console.log('Raw inquiries data:', inquiriesData);
          console.log('Sample inquiry data structure:', inquiriesData[0]);

          // userRole 필드 상태 확인
          inquiriesData.forEach((inquiry, index) => {
            if (index < 3) {
              // 처음 3개만 로깅
              console.log(`문의글 ${inquiry.id} userRole 분석:`, {
                userRole: inquiry.userRole,
                role: inquiry.role,
                user: inquiry.user,
                userId: inquiry.userId,
                userName: inquiry.userName,
                전체_데이터: inquiry,
              });
            }
          });

          // 답변 상태가 있는 문의글들만 필터링해서 확인
          const answeredInquiries = inquiriesData.filter(
            (inquiry) =>
              inquiry.isAnswered === true ||
              inquiry.answered === true ||
              inquiry.replyId ||
              inquiry.replyContent
          );

          if (answeredInquiries.length > 0) {
            console.log('답변이 있는 문의글들:', answeredInquiries);
          }
        }

        // 답변 상태 처리 로직 개선
        const processedInquiries = inquiriesData.map((inquiry, index) => {
          // UserBoardListResponseDto의 isAnswered 필드를 기준으로 판단
          // 하지만 백엔드에서 상태가 제대로 업데이트되지 않을 수 있으므로 여러 조건 확인
          const hasReply =
            inquiry.isAnswered === true ||
            inquiry.answered === true ||
            Boolean(inquiry.replyId) ||
            Boolean(inquiry.replyContent);

          // userRole 필드 처리 - 다양한 가능성 고려
          let userRole =
            inquiry.userRole ||
            inquiry.role ||
            inquiry.writerRole ||
            inquiry.authorRole;

          // 백엔드에서 문자열로 올 수도 있고 enum으로 올 수도 있음
          if (typeof userRole === 'string') {
            userRole = userRole.toUpperCase();
          }

          // user 객체 안에 role이 있을 수도 있음
          if (!userRole && inquiry.user && inquiry.user.role) {
            userRole = inquiry.user.role.toUpperCase();
          }

          // 여전히 userRole이 없으면 기본값으로 CUSTOMER 설정 (더 안전한 선택)
          if (!userRole) {
            userRole = 'CUSTOMER';
          }

          // 개발 환경에서 각 문의글의 답변 상태 로깅
          if (import.meta.env.DEV && index < 5) {
            console.log(`문의글 ${inquiry.id} 처리 결과:`, {
              원본_isAnswered: inquiry.isAnswered,
              원본_answered: inquiry.answered,
              원본_replyId: inquiry.replyId,
              원본_replyContent: inquiry.replyContent,
              처리된_hasReply: hasReply,
              원본_userRole: inquiry.userRole,
              원본_role: inquiry.role,
              처리된_userRole: userRole,
            });
          }

          return {
            ...inquiry,
            isAnswered: hasReply,
            answered: hasReply,
            userRole: userRole, // 처리된 userRole 사용
          };
        });

        // 클라이언트사이드 필터링 추가 - 답변대기 탭에서는 답변되지 않은 문의만 표시
        const filteredInquiries = activeTab === '답변대기' 
          ? processedInquiries.filter(inquiry => !inquiry.isAnswered)
          : processedInquiries;

        // 개발 환경에서 처리된 데이터 로깅
        if (import.meta.env.DEV) {
          console.log('Processed inquiries:', processedInquiries);
          console.log('Filtered inquiries:', filteredInquiries);
          console.log('Active tab:', activeTab);
        }

        setInquiries(filteredInquiries);
        setPagination((prev) => ({
          ...prev,
          page:
            response.data.data.currentPage || response.data.data.number || page,
          totalElements: activeTab === '답변대기' ? filteredInquiries.length : totalElements,
          totalPages: Math.ceil((activeTab === '답변대기' ? filteredInquiries.length : totalElements) / prev.size),
        }));

        // 현재 페이지 데이터로 통계 업데이트
        const answeredCount = processedInquiries.filter(
          (inquiry) => inquiry.isAnswered
        ).length;
        const unansweredCount = processedInquiries.filter(
          (inquiry) => !inquiry.isAnswered
        ).length;

        // 전체 통계는 API에서 totalElements를 사용하되, 답변대기 탭에서는 필터링된 결과 사용
        setStats((prevStats) => ({
          ...prevStats,
          total: activeTab === '답변대기' ? filteredInquiries.length : totalElements,
          answered: answeredCount,
          unanswered: unansweredCount,
        }));
      }
    } catch (err) {
      console.error('문의글 목록 조회 오류:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        alert(
          err.response?.data?.message ||
            err.message ||
            '문의글 목록을 불러오는데 실패했습니다.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchInquiries();
    fetchOverallStats(); // 전체 통계도 함께 가져오기
  }, [activeTab, searchTerm, pagination.page]); // pagination.page 추가하여 페이지 변경 시에도 다시 로드

  // 페이지 변경 핸들러 - 매칭 관리와 동일한 방식
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // 검색어 변경 시 첫 페이지로 리셋
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // 탭 변경 시 첫 페이지로 리셋
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // 서버사이드 필터링을 사용하므로 클라이언트사이드 필터링 불필요
  // inquiries 배열을 직접 사용

  const statCards = [
    {
      title: '전체 문의',
      value: `${overallStats.total}건`,
      subValue: `답변완료: ${overallStats.answered}건\n답변대기: ${overallStats.unanswered}건`,
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
      title: '답변대기',
      value: activeTab === '답변대기' ? `${inquiries.length}건` : `${overallStats.unanswered}건`,
      subValue: activeTab === '답변대기' 
        ? `현재 탭: 답변대기 문의`
        : `처리 대기 중인 문의`,
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
      iconBg: activeTab === '답변대기' ? 'bg-yellow-200' : 'bg-yellow-100',
    },
    {
      title: '답변완료',
      value: activeTab === '답변대기' ? '0건' : `${overallStats.answered}건`,
      subValue: activeTab === '전체' 
        ? `처리 완료된 문의`
        : activeTab === '답변대기'
        ? `현재 탭: 답변대기 문의`
        : `처리 완료된 문의`,
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
      iconBg: activeTab === '답변대기' ? 'bg-green-50' : 'bg-green-100',
    },
    {
      title: '답변률',
      value: `${overallStats.total > 0 ? Math.round((overallStats.answered / overallStats.total) * 100) : 0}%`,
      subValue: `전체 문의 대비 답변률`,
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

  // 특정 문의글의 답변 상태를 실시간으로 확인하는 함수
  const checkReplyStatus = async (boardId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const response = await api.get(
        `/admin/inquiries/board/${boardId}/with-reply`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const data = response.data.data;
        const hasReply = Boolean(data.reply);

        if (import.meta.env.DEV) {
          console.log(`문의글 ${boardId} 실시간 답변 상태 확인:`, {
            hasReply: hasReply,
            replyData: data.reply,
          });
        }

        return hasReply;
      }
      return false;
    } catch (err) {
      console.error('답변 상태 확인 오류:', err);
      return false;
    }
  };

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
        // 개발 환경에서 응답 데이터 로깅
        if (import.meta.env.DEV) {
          console.log('답변 작성 성공:', response.data);
        }

        alert('답변이 성공적으로 작성되었습니다.');
        setReplyModal({ isOpen: false, inquiry: null, existingReply: null });

        // 답변 작성 후 해당 문의글의 상태를 실시간으로 확인
        setTimeout(async () => {
          const hasReply = await checkReplyStatus(boardId);
          if (import.meta.env.DEV) {
            console.log(
              `답변 작성 후 문의글 ${boardId} 상태 확인 결과:`,
              hasReply
            );
          }

          // 목록 새로고침
          fetchInquiries();
        }, 500); // 0.5초 후 확인
      }
    } catch (err) {
      console.error('답변 작성 오류:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 409) {
        alert(
          '이미 답변이 등록된 문의글입니다. 페이지를 새로고침하여 최신 상태를 확인해주세요.'
        );
        setReplyModal({ isOpen: false, inquiry: null, existingReply: null });
        // 데이터 새로고침
        fetchInquiries();
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

      // 개발 환경에서 요청 데이터 로깅
      if (import.meta.env.DEV) {
        console.log('Updating reply:', {
          boardId,
          replyId,
          content,
        });
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
        // 개발 환경에서 응답 데이터 로깅
        if (import.meta.env.DEV) {
          console.log('답변 수정 성공:', response.data);
        }

        alert('답변이 성공적으로 수정되었습니다.');
        setReplyModal({ isOpen: false, inquiry: null, existingReply: null });

        // 수정 후 목록 새로고침
        fetchInquiries();
      }
    } catch (err) {
      console.error('답변 수정 오류:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
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

  // 관리자가 아닌 경우 접근 차단
  if (user?.role !== 'ROLE_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            이 페이지는 관리자만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="max-w-none space-y-6">
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
                    ) : inquiries.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center">
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
                      inquiries.map((inquiry, index) => {
                        // 개발 환경에서 답변 상태 디버깅
                        if (import.meta.env.DEV) {
                          console.log(`문의글 ${inquiry.id} 렌더링 상태:`, {
                            isAnswered: inquiry.isAnswered,
                            hasReply: !!inquiry.reply,
                            replyContent:
                              inquiry.reply?.content?.substring(0, 50) + '...',
                          });
                        }

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
                            <td className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center space-y-1">
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
                                {/* 개발 환경에서 디버깅 */}
                                {import.meta.env.DEV && (
                                  <div className="hidden">
                                    {console.log(
                                      'Rendering inquiry:',
                                      inquiry.id,
                                      {
                                        isAnswered: inquiry.isAnswered,
                                        hasReply: Boolean(inquiry.reply),
                                        reply: inquiry.reply,
                                      }
                                    )}
                                  </div>
                                )}

                                {/* 답변 관련 버튼 */}
                                <div className="flex gap-2">
                                  {!inquiry.isAnswered && !inquiry.answered && (
                                    <button
                                      onClick={() =>
                                        setReplyModal({
                                          isOpen: true,
                                          inquiry,
                                          existingReply: null,
                                        })
                                      }
                                      className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                      답변하기
                                    </button>
                                  )}
                                  {(inquiry.isAnswered || inquiry.answered) && (
                                    <>
                                      <button
                                        onClick={async () => {
                                          try {
                                            if (!inquiry.id) {
                                              alert(
                                                '문의글 데이터를 찾을 수 없습니다.'
                                              );
                                              return;
                                            }

                                            // 문의글과 답변을 함께 조회
                                            const replyDetail =
                                              await fetchBoardWithReply(
                                                inquiry.id
                                              );

                                            if (!replyDetail) {
                                              alert(
                                                '답변 데이터를 찾을 수 없습니다.'
                                              );
                                              return;
                                            }

                                            // 현재 데이터로 모달 열기
                                            setReplyModal({
                                              isOpen: true,
                                              inquiry: inquiry,
                                              existingReply: {
                                                id: replyDetail.id,
                                                content: replyDetail.content,
                                                createdAt:
                                                  replyDetail.createdAt,
                                                adminId: replyDetail.adminId,
                                                adminName:
                                                  replyDetail.userName ||
                                                  '관리자',
                                              },
                                            });
                                          } catch (err) {
                                            console.error(
                                              '답변 수정 모달 열기 실패:',
                                              err
                                            );
                                            if (
                                              err.response?.status === 401 ||
                                              err.response?.status === 403
                                            ) {
                                              alert(
                                                '인증이 만료되었습니다. 다시 로그인해주세요.'
                                              );
                                            } else {
                                              alert(
                                                '답변 데이터를 불러올 수 없습니다.'
                                              );
                                            }
                                          }
                                        }}
                                        className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                      >
                                        수정
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이징 네비게이션 - 매칭 관리와 동일한 스타일 */}
              {pagination.totalPages > 1 && (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-700">
                    총 {pagination.totalElements}건 중{' '}
                    {pagination.page * pagination.size + 1}-
                    {Math.min(
                      (pagination.page + 1) * pagination.size,
                      pagination.totalElements
                    )}
                    건 표시
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 0 || loading}
                    >
                      ‹
                    </button>
                    <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">
                      {pagination.page + 1}
                    </span>
                    <span className="px-3 py-1 text-sm text-gray-500">
                      / {pagination.totalPages}
                    </span>
                    <button
                      className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={
                        pagination.page >= pagination.totalPages - 1 || loading
                      }
                    >
                      ›
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