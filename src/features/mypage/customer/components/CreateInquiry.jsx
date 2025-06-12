import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Footer from '../../../../components/Footer.jsx';

const CreateInquiry = ({ onBack, onInquiryCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        '/api/v1/boards',
        {
          title,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      console.log('문의글 작성 성공:', response.data);
      if (onInquiryCreated) {
        onInquiryCreated();
      }
    } catch (err) {
      setError('문의글 작성에 실패했습니다.');
      console.error('Failed to create inquiry:', err);
    } finally {
      setLoading(false);
    }
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
      <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">문의글 작성</h2>
      </header>

      <main className="px-6 py-6">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-base font-semibold text-gray-800 mb-2"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              className="w-full border border-gray-300 rounded-lg py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="문의 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ height: '50px' }}
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-base font-semibold text-gray-800 mb-2"
            >
              내용
            </label>
            <textarea
              id="content"
              rows="12"
              className="w-full border border-gray-300 rounded-lg py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="문의 내용을 자세히 작성해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ minHeight: '300px' }}
            ></textarea>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              style={{
                backgroundColor:
                  loading || !title.trim() || !content.trim()
                    ? '#9ca3af'
                    : '#10b981',
                color: 'white',
              }}
              className="px-6 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-colors disabled:cursor-not-allowed"
              disabled={loading || !title.trim() || !content.trim()}
            >
              {loading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default CreateInquiry;
