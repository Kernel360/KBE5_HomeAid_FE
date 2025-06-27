import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../../api/config/api';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';
import Modal from '../../../../components/Modal.jsx';

const InquiryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [modal, setModal] = useState({
    open: false,
    type: '',
    message: '',
    onConfirm: null,
  });

  useEffect(() => {
    const fetchInquiry = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/boards/${id}`);
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

    if (id) {
      fetchInquiry();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/manager/mypage/inquiry');
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/boards/${id}`, {
        title: editedTitle,
        content: editedContent,
      });
      setInquiry(response.data.data);
      setIsEditing(false);
      navigate('/manager/mypage/inquiry');
    } catch (err) {
      setError('문의글 수정에 실패했습니다.');
      console.error('Failed to update inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setModal({
      open: true,
      type: 'confirm',
      message: '정말로 이 문의글을 삭제하시겠습니까?',
      onConfirm: async () => {
        setModal({ ...modal, open: false });
        setLoading(true);
        setError(null);
        try {
          await api.delete(`/boards/${id}`);
          setModal({
            open: true,
            type: 'alert',
            message: '문의글이 삭제되었습니다.',
            onConfirm: () => {
              setModal({ ...modal, open: false });
              navigate('/manager/mypage/inquiry');
            },
          });
        } catch (err) {
          setError('문의글 삭제에 실패했습니다.');
          console.error('Failed to delete inquiry:', err);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50"
        style={{
          paddingBottom: '80px',
          maxWidth: '512px',
          margin: '0 auto',
        }}
      >
        <Header showBackButton={true} onBackClick={handleBack} />
        <Footer current="/manager/mypage" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gray-50"
        style={{
          paddingBottom: '80px',
          maxWidth: '512px',
          margin: '0 auto',
        }}
      >
        <Header showBackButton={true} onBackClick={handleBack} />
        <p className="text-center text-red-500 mt-8">{error}</p>
        <Footer current="/manager/mypage" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div
        className="min-h-screen bg-gray-50"
        style={{
          paddingBottom: '80px',
          maxWidth: '512px',
          margin: '0 auto',
        }}
      >
        <Header showBackButton={true} onBackClick={handleBack} />
        <p className="text-center text-gray-600 mt-8">
          문의글을 찾을 수 없습니다.
        </p>
        <Footer current="/manager/mypage" />
      </div>
    );
  }

  // 답변 완료 보정
  const isAnswered = inquiry.isAnswered || !!inquiry.reply;

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={handleBack} />

      <main className="px-6 py-6" style={{ paddingTop: '80px' }}>
        {isEditing ? (
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
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
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
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                required
                style={{ minHeight: '300px' }}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm"
              >
                취소
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-blue-600 text-black rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                disabled={!editedTitle.trim() || !editedContent.trim()}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 문의글 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-2xl mb-4 leading-relaxed">
                {inquiry.title}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                <span className="font-medium">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isAnswered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isAnswered ? '답변 완료' : '답변 대기'}
                </span>
              </div>
              <div
                className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap"
                style={{ lineHeight: '1.8', height: '250px', overflow: 'auto' }}
              >
                {inquiry.content}
              </div>
            </div>

            {/* 관리자 답변 카드 */}
            {inquiry.reply ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">
                      관
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      관리자 답변
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(inquiry.reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap bg-blue-50 rounded-lg p-4 border-l-4 border-blue-200"
                  style={{ lineHeight: '1.7' }}
                >
                  {inquiry.reply.content}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-dashed">
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400 font-semibold">홈</span>
                  </div>
                  <h4 className="font-medium text-gray-600 mb-2">
                    관리자 답변
                  </h4>
                  <p className="text-gray-400 text-sm">
                    홈에이드 관리자의 답변을 기다리고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex items-center justify-end space-x-4">
              {!isAnswered && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors shadow-sm"
                >
                  수정하기
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
              >
                삭제하기
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer current="/manager/mypage" />
      <Modal
        open={modal.open}
        title={modal.type === 'confirm' ? '확인' : '알림'}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={modal.onConfirm}
        showCancel={modal.type === 'confirm'}
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
};

export default InquiryDetail;
