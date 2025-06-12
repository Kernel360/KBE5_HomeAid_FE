import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const InquiryDetail = ({ boardId, onBack, onInquiryDeleted, onInquiryUpdated }) => {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const fetchInquiry = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/v1/boards/${boardId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setInquiry(response.data.data);
        setEditedTitle(response.data.data.title);
        setEditedContent(response.data.data.content);
      } catch (err) {
        setError('문의글을 불러오는 데 실패했습니다.');
        console.error('Failed to fetch inquiry:', err);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchInquiry();
    }
  }, [boardId]);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/v1/boards/${boardId}`, {
        title: editedTitle,
        content: editedContent,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setInquiry(response.data.data);
      setIsEditing(false);
      if (onInquiryUpdated) {
        onInquiryUpdated(); // Notify parent to refresh list
      }
    } catch (err) {
      setError('문의글 수정에 실패했습니다.');
      console.error('Failed to update inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 문의글을 삭제하시겠습니까?')) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`/api/v1/boards/${boardId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        alert('문의글이 삭제되었습니다.');
        if (onInquiryDeleted) {
          onInquiryDeleted(); // Notify parent to refresh list and navigate back
        }
      } catch (err) {
        setError('문의글 삭제에 실패했습니다.');
        console.error('Failed to delete inquiry:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600 mt-8">불러오는 중...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">{error}</p>;
  }

  if (!inquiry) {
    return <p className="text-center text-gray-600 mt-8">문의글을 찾을 수 없습니다.</p>;
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">문의글 상세</h1>
        </div>
        {!isEditing && (
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsEditing(true)} className="text-blue-600">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="text-red-600">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      <main className="px-6 py-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700">제목</label>
              <input
                type="text"
                id="editTitle"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editContent" className="block text-sm font-medium text-gray-700">내용</label>
              <textarea
                id="editContent"
                rows="6"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 text-xl mb-2">{inquiry.title}</h3>
            <p className="text-gray-700 text-base mb-4 whitespace-pre-wrap">{inquiry.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
              <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
              <span>{inquiry.isAnswered ? '답변 완료' : '답변 대기'}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InquiryDetail; 