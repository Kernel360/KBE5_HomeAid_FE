import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/api';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

// 별점 렌더링 컴포넌트
function StarRating({ rating, max = 5 }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = max - fullStars - (halfStar ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={i} width="16" height="16" fill="#FBBF24" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
      {halfStar && (
        <svg width="16" height="16" fill="#FBBF24" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"
            fill="url(#half)"
          />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={i} width="16" height="16" fill="#E5E7EB" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
    </span>
  );
}

export default function MyReviewListPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [average, setAverage] = useState(0);
  const [ratingStats, setRatingStats] = useState({ 5: 0, 4: 0, 3: 0 });

  useEffect(() => {
    console.log('useEffect 실행: user.userId:', user?.userId, 'page:', page);
    async function fetchReviews() {
      try {
        setLoading(true);
        setError('');
        if (!user?.userId) {
          console.log('user 객체가 없습니다:', user);
          setError('로그인 정보가 없습니다.');
          setLoading(false);
          return;
        }
        console.log('getMyReviews 호출:', page, 10);
        const res = await apiService.review.getMyReviews(page, 10);
        const data = res.data?.data || res.data;
        const list = (data.content || []).map((item) => ({
          id: item.id,
          targetId: item.targetId,
          rating: item.rating,
          comment: item.comment,
          createdAt: item.createdAt,
          reservationId: item.reservationId,
          name: item.name,
        }));
        setReviews(list);
        setTotalCount(data.totalElements || list.length);
        // 평균 및 별점 통계 계산
        if (list.length > 0) {
          const sum = list.reduce((acc, cur) => acc + cur.rating, 0);
          setAverage((sum / list.length).toFixed(1));
          const stats = { 5: 0, 4: 0, 3: 0 };
          list.forEach((r) => {
            if (r.rating === 5) stats[5]++;
            else if (r.rating === 4) stats[4]++;
            else if (r.rating === 3) stats[3]++;
          });
          setRatingStats(stats);
        } else {
          setAverage(0);
          setRatingStats({ 5: 0, 4: 0, 3: 0 });
        }
      } catch (error) {
        setError('리뷰를 불러오지 못했습니다: ' + error.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [user?.userId, page]);

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{
        maxWidth: 512,
        margin: '0 auto',
        paddingBottom: 80,
        minHeight: '100vh',
        height: '100dvh',
      }}
    >
      <Header showBackButton={true} />
      <main
        className="flex-1 flex flex-col items-center px-0 py-6"
        style={{ paddingTop: 80 }}
      >
        {/* 헤더 */}
        <div style={{ width: 360, maxWidth: '100%' }} className="mb-4 px-4">
          <h2 className="font-bold text-[20px] leading-tight text-gray-900 mb-1">
            리뷰 조회
          </h2>
          <p className="text-[14px] text-gray-600">
            고객들이 남긴 평가와 코멘트를 확인하세요
          </p>
        </div>
        {/* 평점 요약 */}
        <div
          className="bg-[#F9FAFB] rounded-lg mb-6"
          style={{ width: 400, maxWidth: '100%', padding: 16 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="flex flex-col items-center mr-2">
              <span className="text-[32px] font-bold text-gray-900 leading-tight">
                {average}
              </span>
              <span className="text-xs text-gray-500 mt-1">총 평점</span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-1">
                <StarRating rating={average} />
                <span className="text-xs text-gray-500 ml-1">
                  ({totalCount})
                </span>
              </div>
            </div>
          </div>
          {/* 별점별 통계 */}
          <div className="flex flex-col gap-1 mt-2">
            {[5, 4, 3].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">{star}점</span>
                <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-2 rounded"
                    style={{
                      width: `${ratingStats[star] && totalCount ? (ratingStats[star] / totalCount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {ratingStats[star] && totalCount
                    ? Math.round((ratingStats[star] / totalCount) * 100)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* 리뷰 리스트 */}
        <div
          className="space-y-4 w-full flex flex-col items-center px-4"
          style={{ maxWidth: '100%' }}
        >
          {loading && <div>로딩 중...</div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {!loading && reviews.length === 0 && (
            <div className="text-center text-gray-500">
              받은 리뷰가 없습니다.
            </div>
          )}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-4 shadow border border-gray-200 w-full"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-extrabold text-[16px] text-gray-900">
                  {review.name}
                </div>
                <div className="flex items-center gap-1">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-gray-500 ml-1">
                    {review.rating}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {review.createdAt?.slice(0, 10)}
              </div>
              <div className="text-[14px] text-gray-800 leading-snug">
                {review.comment}
              </div>
            </div>
          ))}

          {/* 페이징 컴포넌트 */}
          {!loading && reviews.length > 0 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className={`px-3 py-1 rounded ${
                  page === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {page + 1} / {Math.ceil(totalCount / 10)}
              </span>
              <button
                onClick={() =>
                  setPage(Math.min(Math.ceil(totalCount / 10) - 1, page + 1))
                }
                disabled={page >= Math.ceil(totalCount / 10) - 1}
                className={`px-3 py-1 rounded ${
                  page >= Math.ceil(totalCount / 10) - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer current="/manager/mypage" />
    </div>
  );
}
