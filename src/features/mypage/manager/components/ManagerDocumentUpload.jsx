import React, { useState, useEffect } from 'react';
import { apiService } from '@/api';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import './ManagerDocumentUpload.css';

export default function ManagerDocumentUpload({ onBack }) {
  const [idFile, setIdFile] = useState(null);
  const [criminalFile, setCriminalFile] = useState(null);
  const [healthFile, setHealthFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState({
    ID_CARD: false,
    CRIMINAL_RECORD: false,
    HEALTH_CERTIFICATE: false
  });

  // 서버에서 첨부파일/상태 조회
  useEffect(() => {
    async function fetchCertifications() {
      try {
        const res = await apiService.manager.getCertifications();
        console.log(res);
        const data = res.data?.data;
        console.log(data);
        if (data) {
          setStatus(data.status);
          setDocumentList(data.documentList || []);
          
          // 기존 파일 정보 설정
          data.documentList?.forEach(doc => {
            const fileInfo = {
              id: doc.id,
              name: doc.originalName,
              url: doc.documentUrl,
              size: doc.fileSize,
              extension: doc.fileExtension,
              createdAt: doc.createdAt
            };
            
            switch (doc.documentType) {
              case 'ID_CARD':
                setIdFile(fileInfo);
                break;
              case 'CRIMINAL_RECORD':
                setCriminalFile(fileInfo);
                break;
              case 'HEALTH_CERTIFICATE':
                setHealthFile(fileInfo);
                break;
            }
          });
        }
      } catch (e) {
        console.error('서류 조회 실패:', e);
        setStatus(null);
        setDocumentList([]);
      }
    }
    fetchCertifications();
  }, []);

  const isActive = status === 'ACTIVE';
  const isPending = status === 'PENDING';
  const isRejected = status === 'REJECTED';

  const handleFileChange = (setter, type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setter({
        file,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        isNew: true // 새로 업로드된 파일 표시
      });
      // 파일이 새로 선택되면 삭제 상태 초기화
      setDeletedFiles(prev => ({...prev, [type]: false}));
    }
  };

  const handleFileDelete = (type, setter) => {
    setDeletedFiles(prev => ({...prev, [type]: true}));
    setter(null);
  };

  const handleBoxClick = (inputId) => {
    if (!isActive) document.getElementById(inputId)?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFile?.file && !criminalFile?.file && !healthFile?.file && 
        !documentList.length) return;
    
    setLoading(true);
    const formData = new FormData();
    
    // 새로운 파일이 있거나 기존 파일이 삭제된 경우에만 FormData에 추가
    if (idFile?.isNew) {
      formData.append('idFile', idFile.file);
    }
    if (criminalFile?.isNew) {
      formData.append('criminalRecordFile', criminalFile.file);
    }
    if (healthFile?.isNew) {
      formData.append('healthCertificateFile', healthFile.file);
    }

    // FormData 내용 디버깅
    console.log('전송할 FormData 내용:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      let res;
      if (documentList.length > 0) {
        // PUT 요청 - 기존 파일 수정
        res = await apiService.manager.updateCertifications(formData);
      } else {
        // POST 요청 - 새로운 파일 업로드
        res = await apiService.manager.uploadCertifications(formData);
      }

      if (res.data?.success) {
        alert(documentList.length > 0 ? '서류가 성공적으로 수정되었습니다.' : '서류가 성공적으로 제출되었습니다.');
        onBack && onBack();
      }
    } catch (err) {
      console.error("서류 제출 실패:", err);
      alert('제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderFileBox = (type, file, setFile, inputId) => {
    const doc = documentList.find(d => d.documentType === type);
    const isDeleted = deletedFiles[type];
    
    if (isActive && doc) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
          <a
            href={doc.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium underline text-sm truncate max-w-full"
            style={{ wordBreak: 'break-all' }}
            title={doc.originalName}
          >
            {doc.originalName}
          </a>
          <div className="text-xs text-gray-400 mt-1">
            <span>({doc.fileSize})</span>
            <span className="mx-1">•</span>
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      );
    }

    if ((!file || !file.name) && !isDeleted) {
      return (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition"
          onClick={() => handleBoxClick(inputId)}
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>파일을 선택하세요 (PDF, DOC, DOCX, 최대 10MB)</span>
          <input
            id={inputId}
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange(setFile, type)}
          />
        </div>
      );
    }

    if (file && !isDeleted) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-700 bg-white">
          <div className="flex items-center justify-between w-full">
            <span className="text-blue-600 font-medium underline text-sm truncate flex-1" title={file.name}>
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => handleFileDelete(type, setFile)}
              className="delete-image-btn ml-2"
              title="파일 삭제"
            >
              ×
            </button>
          </div>
          {file.size && (
            <span className="text-xs text-gray-400 mt-1">({file.size})</span>
          )}
        </div>
      );
    }

    // 파일이 삭제된 상태
    return (
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition"
        onClick={() => handleBoxClick(inputId)}
      >
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>새 파일을 선택하세요</span>
        <input
          id={inputId}
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange(setFile, type)}
        />
      </div>
    );
  };

  const getButtonText = () => {
    if (isActive) return '승인되었습니다';
    if (loading) return '제출 중...';
    if (documentList.length > 0) return '서류 수정';
    return '서류 제출';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-gray-50 h-screen flex flex-col" style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}>
        <Header showBackButton={true} onBackClick={onBack} />
        <main className="px-6 py-6 flex-1 overflow-y-auto" style={{ paddingBottom: '100px', paddingTop: '80px' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">매니저 활동 승인 서류 제출</h3>
            <p className="text-sm text-gray-500 mt-1">매니저 활동을 위해 필요한 서류를 제출해주세요.<br/>(신분증, 범죄경력조회서, 건강검진서)</p>
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
              <div>
                <label className="block font-medium mb-1">신분증 첨부</label>
                {renderFileBox('ID_CARD', idFile, setIdFile, 'idFileInput')}
              </div>
              <div>
                <label className="block font-medium mb-1">범죄경력조회서 첨부</label>
                {renderFileBox('CRIMINAL_RECORD', criminalFile, setCriminalFile, 'criminalFileInput')}
              </div>
              <div>
                <label className="block font-medium mb-1">건강검진서 첨부</label>
                {renderFileBox('HEALTH_CERTIFICATE', healthFile, setHealthFile, 'healthFileInput')}
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded-lg font-semibold ${
                  isActive
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500'
                }`}
                disabled={isActive || loading}
              >
                {getButtonText()}
              </button>
            </form>
          </div>
        </main>
        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
} 