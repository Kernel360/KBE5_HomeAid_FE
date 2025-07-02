import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const ManagerDetailModal = ({
  manager,
  documents,
  onClose,
  onStatusUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDocumentRejectModal, setShowDocumentRejectModal] = useState(false);
  const [documentRejectionReason, setDocumentRejectionReason] = useState('');
  const [error, setError] = useState(null);

  if (!manager) return null;

  const getDocumentTypeName = (type) => {
    const typeMap = {
      ID_CARD: '신분증',
      CRIMINAL_RECORD: '범죄경력조회서',
      HEALTH_CERTIFICATE: '건강검진서',
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '-';
    }
  };

  const getDocumentUploadDate = (doc) => {
    // 여러 가능한 날짜 필드명을 확인
    return (
      doc.uploadedAt ||
      doc.createdAt ||
      doc.uploadDate ||
      doc.submittedAt ||
      doc.dateUploaded
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: '승인대기',
      ACTIVE: '승인완료',
      REJECTED: '반려',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // 매니저 상태 변경
  const handleStatusChange = async () => {
    if (!selectedStatus) {
      setError('변경할 상태를 선택해주세요.');
      return;
    }

    // 반려 선택 시 반려 사유 필수 입력 체크
    if (selectedStatus === 'REJECTED' && !rejectionReason.trim()) {
      setError('반려 사유를 입력해주세요.');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const requestBody = {
        status: selectedStatus,
      };

      // 반려 선택 시 반려 사유 추가
      if (selectedStatus === 'REJECTED') {
        requestBody.rejectionReason = rejectionReason.trim();
      }

      const response = await fetch(
        `${API_URL}/api/v1/admin/managers/${manager.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '상태 변경에 실패했습니다.');
      }

      setShowStatusChangeModal(false);
      setRejectionReason('');
      onStatusUpdate?.();
      onClose();
    } catch (err) {
      console.error('Status change error:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // 서류 검토 (반려만 가능)
  const handleDocumentReview = async () => {
    if (!documentRejectionReason.trim()) {
      setError('반려 사유를 입력해주세요.');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(
        `${API_URL}/api/v1/admin/managers/${manager.id}/document-review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'REJECTED',
            rejectionReason: documentRejectionReason.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '서류 검토에 실패했습니다.');
      }

      setShowDocumentRejectModal(false);
      setDocumentRejectionReason('');
      onStatusUpdate?.();
      onClose();
    } catch (err) {
      console.error('Document review error:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
      >
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                매니저 상세 정보
              </h2>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(manager.status)}`}
              >
                {getStatusText(manager.status)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                기본 정보
              </h3>

              {/* 프로필 이미지 섹션 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {(() => {
                      // 프로필 이미지 URL 확인
                      const profileImage =
                        manager.profileImageUrl || manager.profileImage;

                      if (profileImage) {
                        // 캐싱 방지를 위해 timestamp 추가
                        const imageUrl = profileImage.includes('?')
                          ? `${profileImage}&t=${Date.now()}`
                          : `${profileImage}?t=${Date.now()}`;

                        return (
                          <img
                            src={imageUrl}
                            alt="매니저 프로필 이미지"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log(
                                'Manager profile image load failed:',
                                imageUrl
                              );
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display =
                                'flex';
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                    <span
                      className="text-blue-600 font-semibold w-full h-full flex items-center justify-center text-lg"
                      style={{
                        display:
                          manager.profileImageUrl || manager.profileImage
                            ? 'none'
                            : 'flex',
                      }}
                    >
                      {manager.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-lg">
                      {manager.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      매니저 ID: {manager.id}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="text-base text-gray-900">{manager.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="text-base text-gray-900">{manager.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">전화번호</p>
                  <p className="text-base text-gray-900">{manager.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">가입일</p>
                  <p className="text-base text-gray-900">
                    {formatDate(manager.signupDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">경력</p>
                  <p className="text-base text-gray-900">
                    {manager.career || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">경험</p>
                  <p className="text-base text-gray-900">
                    {manager.experience || '-'}
                  </p>
                </div>
              </div>

              {/* 반려 사유 (상태가 반려인 경우에만 표시) */}
              {manager.status === 'REJECTED' && manager.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    반려 사유
                  </h4>
                  <p className="text-sm text-red-700">
                    {manager.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">제출 서류</h3>
                {documents &&
                  documents.documentList &&
                  documents.documentList.length > 0 && (
                    <button
                      onClick={() => setShowDocumentRejectModal(true)}
                      disabled={isUpdating || manager.status === 'REJECTED'}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      서류 반려
                    </button>
                  )}
              </div>

              {documents &&
              documents.documentList &&
              documents.documentList.length > 0 ? (
                <div className="space-y-4">
                  {documents.documentList.map((doc, index) => {
                    // 디버깅을 위한 콘솔 로그
                    console.log('📄 Document data:', doc);
                    console.log('📅 Upload date fields:', {
                      uploadedAt: doc.uploadedAt,
                      createdAt: doc.createdAt,
                      uploadDate: doc.uploadDate,
                      submittedAt: doc.submittedAt,
                    });

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-500">서류 종류</p>
                            <p className="text-base text-gray-900">
                              {getDocumentTypeName(doc.documentType)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">제출일</p>
                            <p className="text-base text-gray-900">
                              {formatDate(getDocumentUploadDate(doc))}
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <a
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              문서 보기
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  제출된 서류가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => setShowStatusChangeModal(true)}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              상태 변경
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusChangeModal && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-60"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
        >
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                매니저 상태 변경
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                {manager.name} 매니저의 상태를 변경하시겠습니까?
              </p>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="PENDING"
                    checked={selectedStatus === 'PENDING'}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">승인대기</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={selectedStatus === 'ACTIVE'}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">승인완료</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="REJECTED"
                    checked={selectedStatus === 'REJECTED'}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm">반려</span>
                </label>
              </div>

              {/* 반려 사유 입력 (반려 선택 시에만 표시) */}
              {selectedStatus === 'REJECTED' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    반려 사유 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="반려 사유를 입력해주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusChangeModal(false);
                  setSelectedStatus('');
                  setRejectionReason('');
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleStatusChange}
                disabled={isUpdating || !selectedStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? '변경 중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Rejection Modal */}
      {showDocumentRejectModal && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-70"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
        >
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">서류 반려</h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                {manager.name} 매니저의 서류를 반려하시겠습니까?
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반려 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={documentRejectionReason}
                  onChange={(e) => setDocumentRejectionReason(e.target.value)}
                  placeholder="서류 반려 사유를 입력해주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDocumentRejectModal(false);
                  setDocumentRejectionReason('');
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDocumentReview}
                disabled={isUpdating || !documentRejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? '처리 중...' : '반려'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagerDetailModal;
