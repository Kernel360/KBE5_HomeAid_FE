import React, { useState, useEffect } from 'react';
import { apiService } from '@/api';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export default function ManagerDocumentUpload({ onBack }) {
  const [idFile, setIdFile] = useState(null);
  const [criminalFile, setCriminalFile] = useState(null);
  const [healthFile, setHealthFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 매니저 상태
  const [documentList, setDocumentList] = useState([]); // 서버에서 조회한 파일 정보

  // 문서 타입 매핑
  const docTypeMap = {
    ID_CARD: '신분증',
    CRIMINAL_RECORD: '범죄경력조회서',
    HEALTH_CERTIFICATE: '건강검진서',
  };

  // 서버에서 첨부파일/상태 조회
  useEffect(() => {
    async function fetchCertifications() {
      try {
        const res = await apiService.manager.getCertifications();
        const data = res.data?.data || res.data;
        setStatus(data.status);
        setDocumentList(data.documentList || []);
        // 이미 등록된 파일이 있으면 파일명만 미리 세팅(수정/삭제 가능 상태만)
        if (data.documentList) {
          data.documentList.forEach(doc => {
            if (doc.documentType === 'ID_CARD') setIdFile({ name: doc.documentUrl.split('/').pop(), url: doc.documentUrl });
            if (doc.documentType === 'CRIMINAL_RECORD') setCriminalFile({ name: doc.documentUrl.split('/').pop(), url: doc.documentUrl });
            if (doc.documentType === 'HEALTH_CERTIFICATE') setHealthFile({ name: doc.documentUrl.split('/').pop(), url: doc.documentUrl });
          });
        }
      } catch (e) {
        setStatus(null);
        setDocumentList([]);
      }
    }
    fetchCertifications();
    // eslint-disable-next-line
  }, []);

  const isActive = status === 'ACTIVE';

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const handleBoxClick = (inputId) => {
    if (!isActive) document.getElementById(inputId)?.click();
  };

  const handleRemoveFile = (setter) => () => {
    if (!isActive) setter(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFile || !criminalFile || !healthFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('idFile', idFile);
    formData.append('criminalRecordFile', criminalFile);
    formData.append('healthCertificateFile', healthFile);
    try {
      await apiService.manager.uploadCertifications(formData);
      alert('서류가 성공적으로 제출되었습니다.');
      onBack && onBack();
    } catch (err) {
      console.error("서류 제출 실패:", err);
      alert('제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 서버에서 조회한 파일 정보로 렌더링 (ACTIVE 상태)
  const renderFileBox = (type, file, setFile, inputId) => {
    const doc = documentList.find(d => d.documentType === type);
    if (isActive && doc) {
      // 파일이 있을 때: + 아이콘 없이 파일명만 중앙에(삭제 버튼 없음)
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
          <a
            href={doc.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium underline text-sm truncate max-w-full"
            style={{ wordBreak: 'break-all' }}
            title={doc.documentUrl.split('/').pop()}
          >
            {doc.documentUrl.split('/').pop()}
          </a>
          <span className="text-xs text-gray-400 mt-1">(다운로드만 가능)</span>
        </div>
      );
    }
    // 파일이 없을 때만 + 아이콘/업로드 박스
    if (!file) {
      return (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition"
          onClick={() => handleBoxClick(inputId)}
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>파일을 선택하세요 (PDF, DOC, DOCX, 최대 10MB)</span>
          <input id={inputId} type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleFileChange(setFile)} />
        </div>
      );
    }
    // 업로드/수정 가능 상태에서 파일이 있을 때(아직 제출 전 등)
    return (
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-700 bg-white"
      >
        <span className="mt-2 text-blue-600 font-medium underline text-sm truncate max-w-full" title={file.name}>{file.name}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-gray-50 h-screen flex flex-col" style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}>
        <Header showBackButton={true} onBackClick={onBack} />
        <main className="px-6 py-6 flex-1 overflow-y-auto" style={{ paddingBottom: '100px', paddingTop: '80px' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">매니저 활동 승인 서류 제출</h3>
            <p className="text-sm text-gray-500 mt-1">매니저 활동을 위해 필요한 서류를 제출해주세요.<br/>(신분증, 범죄경력조회서, 건강검진서)</p>
            {/* 매니저 승인 상태 표시 */}
            {status && (
              <div className="mt-2">
                <span
                  className={
                    status === 'ACTIVE'
                      ? 'text-green-600 font-semibold'
                      : status === 'REVIEW'
                      ? 'text-blue-600 font-semibold'
                      : status === 'REJECTED'
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-500 font-semibold'
                  }
                >
                  {status === 'ACTIVE' && '승인 완료'}
                  {status === 'REVIEW' && '검토 중'}
                  {status === 'REJECTED' && '반려'}
                  {status === 'PENDING' && '승인 대기'}
                </span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 신분증 첨부 */}
              <div>
                <label className="block font-medium mb-1">신분증 첨부</label>
                {renderFileBox('ID_CARD', idFile, setIdFile, 'idFileInput')}
              </div>
              {/* 범죄경력조회서 첨부 */}
              <div>
                <label className="block font-medium mb-1">범죄경력조회서 첨부</label>
                {renderFileBox('CRIMINAL_RECORD', criminalFile, setCriminalFile, 'criminalFileInput')}
              </div>
              {/* 건강검진서 첨부 */}
              <div>
                <label className="block font-medium mb-1">건강검진서 첨부</label>
                {renderFileBox('HEALTH_CERTIFICATE', healthFile, setHealthFile, 'healthFileInput')}
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded-lg font-semibold ${isActive ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-black disabled:bg-gray-600'}`}
                disabled={isActive || !idFile || !criminalFile || !healthFile || loading}
              >
                {isActive ? '승인되었습니다' : (loading ? '제출 중...' : '서류 제출')}
              </button>
            </form>
          </div>
        </main>
        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
} 