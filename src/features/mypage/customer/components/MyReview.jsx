import { ArrowLeft, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../../../api/config/api';
import Footer from '../../../../components/Footer.jsx';
import Modal from '../../../../components/Modal.jsx';

const MyReview = ({ onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

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

  const handleDeleteClick = (reviewId) => {
    setSelectedReviewId(reviewId);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReviewId) return;
    setDeletingId(selectedReviewId);
    setDeleteError('');
    try {
      await api.delete(`/reviews/${selectedReviewId}`);
      setShowDeleteModal(false);
      setSelectedReviewId(null);
      fetchReviews(page); // 삭제 후 목록 새로고침
    } catch (err) {
      setDeleteError('리뷰 삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ paddingBottom: '80px', maxWidth: '512px', margin: '0 auto' }}
    >
      <header
        className="fixed top-0 z-50 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200"
      style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
        maxWidth: '512px',
          zIndex: 50,
          backgroundColor: 'white',
          borderBottom: '1px solid #e9ecef',
      }}
    >
        <div className="flex items-center">
          <button
            onClick={onBack}
            style={{
              backgroundColor: 'white',
              border: 'none',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
          >
            <ArrowLeft
              size={20}
              style={{ color: '#1a1a1a', strokeWidth: 3, width: 20, height: 20, display: 'block', pointerEvents: 'none' }}
            />
        </button>
        </div>
        <div className="flex-1 text-center">
          {/* 제목 없음, 공간만 */}
        </div>
        <div style={{ width: 40 }} />
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
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col gap-2"
                style={{ boxShadow: '0 1px 6px 0 rgba(0,0,0,0.04)' }}
              >
                {/* 상단: 프로필 이니셜, 이름, 별점 */}
                <div className="flex items-center mb-1">
                  {/* 이니셜 원 */}
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-base font-bold text-gray-500 select-none">
                    {review.name ? review.name[0] : '?'}
                  </div>
                  {/* 이름 */}
                  <span className="font-bold text-gray-900 text-base mr-2">{review.name || '대상자'}</span>
                  {/* 별점 */}
                  <div className="flex items-center ml-auto gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                {/* 날짜 */}
                <div className="text-sm text-gray-500 mb-1 text-left">{formatDate(review.createdAt)}</div>
                {/* 코멘트 */}
                <div className="text-[15px] text-gray-800 leading-[1.5] mb-2 whitespace-pre-line text-left">{review.comment}</div>
                {/* 서비스 태그 + 삭제 버튼 */}
                <div className="flex items-center gap-2 mt-1">
                  {review.serviceType && (
                    <span className="bg-gray-100 text-gray-700 rounded-[12px] px-3 py-1 text-xs h-8 flex items-center mr-2 align-middle">{review.serviceType}</span>
                  )}
                  <div className="flex-1" />
                  <button
                    className="bg-[#FFF0F0] text-[#FF0004] rounded-[6px] px-4 h-8 text-[15px] font-medium border border-[#FFD6D6] hover:bg-[#FFEAEA] transition-colors disabled:opacity-50 align-middle flex items-center justify-center"
                    style={{ minWidth: 56, height: 32, lineHeight: '32px', paddingTop: 0, paddingBottom: 0 }}
                    onClick={() => handleDeleteClick(review.id)}
                    disabled={deletingId === review.id}
                  >
                    {deletingId === review.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
                {deleteError && selectedReviewId === review.id && (
                  <div className="text-xs text-red-500 mt-1">{deleteError}</div>
                )}
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
      {/* 삭제 확인 모달 */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="삭제"
        cancelText="취소"
        showCancel={true}
      >
        정말 이 리뷰를 삭제하시겠습니까?
      </Modal>
    </div>
  );
};

export default MyReview;
