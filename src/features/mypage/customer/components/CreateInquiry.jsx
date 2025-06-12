import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const CreateInquiry = ({ onBack, onInquiryCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/v1/boards', {
        title,
        content,
      }, {
        // You will need to include authentication headers here.
        // For example, if you are using a token from localStorage:
        headers: {
           Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
         },
      });
      console.log('문의글 작성 성공:', response.data);
      if (onInquiryCreated) {
        onInquiryCreated(); // Notify parent to refresh list or navigate
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
        <h1 className="text-lg font-bold text-gray-900">문의글 작성</h1>
      </header>

      <main className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              id="title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">내용</label>
            <textarea
              id="content"
              rows="6"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? '작성 중...' : '문의글 작성'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateInquiry; 