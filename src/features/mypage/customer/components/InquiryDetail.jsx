import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
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
  const [modal, setModal] = useState({ open: false, type: '', message: '', onConfirm: null });

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
    navigate('/customer/mypage/inquiry');
  };

  const handleUpdate = async () => {
    if (inquiry.isAnswered) {
      alert('답변이 완료된 게시글은 수정할 수 없습니다.');
      setIsEditing(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(
        `/boards/${id}`,
        {
          title: editedTitle,
          content: editedContent,
        }
      );
      setInquiry(response.data.data);
      setIsEditing(false);
      navigate('/customer/mypage/inquiry');
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
          setModal({ open: true, type: 'alert', message: '문의글이 삭제되었습니다.', onConfirm: () => {
            setModal({ ...modal, open: false });
            navigate('/customer/mypage/inquiry');
          }});
        } catch (err) {
          setError('문의글 삭제에 실패했습니다.');
          console.error('Failed to delete inquiry:', err);
        } finally {
          setLoading(false);
        }
      }
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
        <Footer current="/customer/mypage" />
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
        <Footer current="/customer/mypage" />
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
        <Footer current="/customer/mypage" />
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
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? '문의글 수정' : '문의글 상세'}
          </h2>
        </div>

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
                disabled={!editedTitle.trim() || !editedContent.trim() || inquiry.isAnswered}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{ minHeight: '400px' }}
            >
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
                style={{ lineHeight: '1.8' }}
              >
                {inquiry.content}
              </div>

              {/* 답변 영역 */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-800 mb-2">관리자 답변</h4>
                {inquiry.reply ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-gray-900 mb-2">{inquiry.reply.content}</div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>답변자: {inquiry.reply.adminName || '관리자'}</span>
                      <span>{new Date(inquiry.reply.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">아직 답변이 등록되지 않았습니다.</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
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
                className="px-6 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors shadow-sm"
              >
                삭제하기
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer current="/customer/mypage" />
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
