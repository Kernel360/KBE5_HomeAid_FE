import { ArrowLeft, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../../../api/config/api';
import Footer from '../../../../components/Footer.jsx';

const MyReview = ({ onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/reviews/reviewer?page=${pageNum}&size=10`);
      const data = res.data.data;
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('리뷰 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ paddingBottom: '80px', maxWidth: '512px', margin: '0 auto' }}
    >
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 flex items-center px-6" style={{ height: 64, maxWidth: 512, margin: '0 auto', paddingTop: 0, paddingBottom: 0 }}>
        <button onClick={onBack} className="mr-2">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
      </header>
      <main className="px-6 py-6" style={{ paddingTop: 80 }}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 text-center">리뷰 관리</h2>
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-20">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-400 py-20">작성한 리뷰가 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-base">{review.name || '대상자'}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                  {/* 서비스 태그 예시: review.serviceType 필드가 있으면 노출 */}
                  {review.serviceType && (
                    <span className="bg-gray-100 text-gray-700 rounded-[12px] px-3 py-1 text-xs h-6 flex items-center">{review.serviceType}</span>
                  )}
                </div>
                <div className="text-[14px] text-gray-800 leading-[1.2] mt-2 mb-1 whitespace-pre-line">{review.comment}</div>
                {/* 삭제 버튼 (옵션, 실제 삭제 기능 필요시만 활성화) */}
                {/* <button className="ml-auto bg-[#F6F3F3] text-[#FF0004] rounded-[6px] px-4 py-1 text-[14px] font-medium">삭제</button> */}
              </div>
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0} className="px-4 py-2 rounded-lg border text-sm bg-white disabled:opacity-50">이전</button>
            <span className="px-4 py-2 text-sm">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1} className="px-4 py-2 rounded-lg border text-sm bg-white disabled:opacity-50">다음</button>
          </div>
        )}
      </main>
      <div className="fixed left-0 right-0 bottom-0 z-20" style={{ maxWidth: 512, margin: '0 auto' }}>
        <Footer current="/customer/mypage" />
      </div>
    </div>
  );
};

export default MyReview;
