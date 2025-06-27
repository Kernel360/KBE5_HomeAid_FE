import { ArrowLeft, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../../../../api/config/api.js';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';

// 문의 게시판 페이지
const InquiryBoard = ({ onBack, onNavigateToCreate, onNavigateToDetail }) => {
  const navigate = useNavigate();
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
      const response = await api.get('/boards', {
        params: {
          keyword: keyword,
          page: page,
          size: 10,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        },
      });
      const content = response.data.data.content.map(item => ({
        ...item,
        isAnswered: item.isAnswered ?? item.answered ?? false,
      }));
      setInquiries(content);
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
  }, [keyword, page, activeFilter]);

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    setPage(0);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setPage(0);
  };

  const handleBack = () => {
    navigate('/manager/mypage');
  };

  const handleCreateInquiry = () => {
    navigate('/manager/mypage/inquiry/create');
  };

  const handleInquiryClick = (id) => {
    navigate(`/manager/mypage/inquiry/${id}`);
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
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={onBack || handleBack} />

      <main className="px-6 py-6" style={{ paddingTop: '80px' }}>
        {/* 페이지 제목과 설명 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">문의 게시판</h2>
          <p className="text-sm text-gray-600 mt-1">
            질문이나 상담내용을 남겨주세요
          </p>
        </div>

        {/* Search and New Post Section */}
        <div className="mb-6 flex items-center space-x-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
            onClick={handleCreateInquiry}
            className="bg-blue-600 text-black flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
            style={{ height: '40px', minWidth: '90px' }}
          >
            <Plus className="w-4 h-4 mr-1 text-black" />
            문의하기
          </button>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex justify-between space-x-2">
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

        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && inquiries.length === 0 && (
          <p className="text-center text-gray-600">문의글이 없습니다.</p>
        )}

        {/* Inquiry List */}
        <div className="space-y-3">
          {inquiries
            .filter((inquiry) => {
              if (activeFilter === 'all') return true;
              if (activeFilter === 'waiting') return !inquiry.isAnswered;
              if (activeFilter === 'completed') return inquiry.isAnswered;
              return true;
            })
            .map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-gray-50 rounded-lg p-4 shadow-sm cursor-pointer border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all duration-200"
                onClick={() => handleInquiryClick(inquiry.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {inquiry.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      inquiry.isAnswered
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {inquiry.isAnswered ? '답변 완료' : '답변 대기'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {formatDate(inquiry.createdAt)}
                  </span>
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

      <Footer current="/manager/mypage" />
    </div>
  );
};

export default InquiryBoard;
