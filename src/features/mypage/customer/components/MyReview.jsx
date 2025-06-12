import { ArrowLeft, Star } from 'lucide-react';
import { apiService } from '../../../../store/api.js';
import { useState, useEffect } from 'react';
import Footer from '../../../../components/Footer.jsx';

const MyReview = ({ onBack }) => {
  const myReviewResponse = apiService.review.getByUserId(2);
  const [myReviews, setMyReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await myReviewResponse;
      console.log('리뷰 데이터 가져오기 성공:', response.data.data.content);
      setMyReviews(response.data.data.content);
    } catch (error) {
      console.error('리뷰 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 MyReview useEffect 실행됨');

    fetchReviews();
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">리뷰 관리</h1>
      </header>

      <main className="px-6 py-6">
        <div className="space-y-4">
          {myReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-2">
                    {review.name}
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{review.createAt}</span>
              </div>
              <p className="text-gray-700 text-sm mb-3">{review.comment}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">서비스: {}</span>
                <div className="flex items-center text-xs text-red-500">
                  {/* <span>도움됨 {review.helpful}</span> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default MyReview;
