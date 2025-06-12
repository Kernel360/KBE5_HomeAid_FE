import { ArrowLeft, Search, Plus } from 'lucide-react';
import Footer from '../../../../components/Footer.jsx';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is installed

// 문의 게시판 페이지
const InquiryBoard = ({ onBack, onNavigateToCreate, onNavigateToDetail }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'waiting', 'completed'

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming a base URL for the API
      const response = await axios.get('/api/v1/boards', {
        params: {
          keyword: keyword,
          page: page,
          size: 10, // Assuming 10 items per page
          sortBy: 'createdAt',
          sortDirection: 'desc',
          // Backend API currently does not support filtering by isAnswered.
          // If needed, this would require backend modification or client-side filtering.
          // For now, the filter buttons are purely for UI.
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setInquiries(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('문의글을 불러오는 데 실패했습니다.');
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [keyword, page, activeFilter]); // Refetch when keyword, page, or activeFilter changes

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    setPage(0); // Reset to first page on new search
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setPage(0); // Reset page on filter change
  };

  const handleInquiryClick = (id) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(id);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString)
      .toLocaleDateString('ko-KR', options)
      .replace(/\. /g, '.')
      .replace(/\.$/, ''); // Format YYYY.MM.DD
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      {/* Figma Header - Back button not in Figma, but keeping it for navigation */}
      <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">문의 게시판</h2>{' '}
          {/* style_OVUXUL */}
          <p className="text-sm text-gray-600">
            질문이나 상담을 남겨주세요
          </p>{' '}
          {/* style_XJ9LWZ */}
        </div>
      </header>

      <main className="px-6 py-6">
        {/* Search and New Post Section (Figma Filter frame) */}
        <div className="mb-6 flex items-center space-x-3">
          {' '}
          {/* layout_67YMWQ */}
          <div className="relative flex-grow">
            {' '}
            {/* layout_02J353, flex-grow to fill available space */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />{' '}
            {/* stroke_P69H1I */}
            <input
              type="text"
              placeholder="검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={keyword}
              onChange={handleSearchChange}
              style={{ height: '40px' }}
            />
          </div>
          <button
            onClick={onNavigateToCreate}
            className="bg-blue-600 text-black flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
            style={{ height: '40px', minWidth: '90px' }}
          >
            <Plus className="w-4 h-4 mr-1 text-black" />
            문의하기
          </button>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex justify-between space-x-2">
          {' '}
          {/* layout_BIMCNT */}
          <button
            onClick={() => handleFilterClick('all')}
            className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform text-slate-700 ${
              activeFilter === 'all'
                ? 'bg-slate-800 shadow-lg scale-105 border-2 border-slate-800'
                : 'bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-102'
            }`}
            style={{ height: '36px' }}
          >
            전체
          </button>
          <button
            onClick={() => handleFilterClick('waiting')}
            className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform text-orange-700 ${
              activeFilter === 'waiting'
                ? 'bg-orange-600 shadow-lg scale-105 border-2 border-orange-600'
                : 'bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 hover:shadow-md hover:scale-102'
            }`}
            style={{ height: '36px' }}
          >
            답변 대기
          </button>
          <button
            onClick={() => handleFilterClick('completed')}
            className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform text-emerald-700 ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 shadow-lg scale-105 border-2 border-emerald-600'
                : 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:scale-102'
            }`}
            style={{ height: '36px' }}
          >
            답변 완료
          </button>
        </div>

        {/* {loading && <p className="text-center text-gray-600">불러오는 중...</p>} */}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && inquiries.length === 0 && (
          <p className="text-center text-gray-600">문의글이 없습니다.</p>
        )}

        {/* Inquiry List (Figma Posts) */}
        <div className="space-y-3">
          {' '}
          {/* gap: 12px */}
          {inquiries
            .filter((inquiry) => {
              // Client-side filtering based on activeFilter for UI purposes
              if (activeFilter === 'all') return true;
              if (activeFilter === 'waiting') return !inquiry.isAnswered;
              if (activeFilter === 'completed') return inquiry.isAnswered;
              return true;
            })
            .map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-gray-50 rounded-lg p-4 shadow-sm cursor-pointer border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all duration-200" // fill_B02V81, stroke_EHRQHW, borderRadius: 8px, padding: 16px, shadow-sm
                onClick={() => handleInquiryClick(inquiry.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  {' '}
                  {/* layout_ANADNR, gap: 12px */}
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {' '}
                    {/* style_90DHTN (fontWeight: 900, fontSize: 16) */}
                    {inquiry.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      inquiry.isAnswered
                        ? 'bg-green-100 text-green-700' // fill_MOA2B6, fill_E8KKCL
                        : 'bg-amber-100 text-amber-700' // fill_5XO40Y, fill_SYTTLO
                    }`}
                  >
                    {inquiry.isAnswered ? '답변 완료' : '답변 대기'}{' '}
                    {/* style_7OG6E1 */}
                  </span>
                </div>
                {/* Figma has content snippet here, but UserBoardListResponseDto does not. Removing placeholder. */}
                {/* <p className="text-gray-600 text-sm mb-3">
                청소 서비스 지원 범위에 대해 궁금한 점이 있으시면 언제든지
                문의해주세요.
              </p> */}
                <div className="flex items-center justify-between mt-3">
                  {' '}
                  {/* layout_ANADNR */}
                  <span className="text-xs text-gray-500">
                    {' '}
                    {/* style_UZ2H56, fill_LAYRNN */}
                    {formatDate(inquiry.createdAt)}
                  </span>
                  {/* Figma has comments icon with count, but backend DTO does not. Omitting. */}
                  {/* <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span>2</span>
                </div> */}
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-4 py-2 mx-1 border rounded-lg"
            >
              이전
            </button>
            <span className="px-4 py-2 mx-1">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={page === totalPages - 1}
              className="px-4 py-2 mx-1 border rounded-lg"
            >
              다음
            </button>
          </div>
        )}
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default InquiryBoard;
