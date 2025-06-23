import React, { useState } from 'react';
import { apiService } from '@/api';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export default function ManagerDocumentUpload({ onBack }) {
  const [idFile, setIdFile] = useState(null);
  const [criminalFile, setCriminalFile] = useState(null);
  const [healthFile, setHealthFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0]);
  };

  const handleBoxClick = (inputId) => {
    document.getElementById(inputId)?.click();
  };

  const handleRemoveFile = (setter) => () => {
    setter(null);
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
      await apiService.api.post('/managers/profile/certifications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      alert('서류가 성공적으로 제출되었습니다.');
      onBack && onBack();
    } catch (err) {
      alert('제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-gray-50 h-screen flex flex-col" style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}>
        <Header showBackButton={true} onBackClick={onBack} />
        <main className="px-6 py-6 flex-1 overflow-y-auto" style={{ paddingBottom: '100px', paddingTop: '80px' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">매니저 활동 승인 서류 제출</h3>
            <p className="text-sm text-gray-500 mt-1">매니저 활동을 위해 필요한 서류를 제출해주세요.<br/>(신분증, 범죄경력조회서, 건강검진서)</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 신분증 첨부 */}
              <div>
                <label className="block font-medium mb-1">신분증 첨부</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition"
                  onClick={() => handleBoxClick('idFileInput')}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{idFile ? idFile.name : "파일을 선택하세요 (PDF, JPG, PNG, 최대 10MB)"}</span>
                  <input id="idFileInput" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange(setIdFile)} />
                  {idFile && (
                    <button type="button" className="mt-2 text-xs text-red-400 underline" onClick={handleRemoveFile(setIdFile)}>
                      삭제
                    </button>
                  )}
                </div>
              </div>
              {/* 범죄경력조회서 첨부 */}
              <div>
                <label className="block font-medium mb-1">범죄경력조회서 첨부</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition"
                  onClick={() => handleBoxClick('criminalFileInput')}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{criminalFile ? criminalFile.name : "파일을 선택하세요 (PDF, JPG, PNG, 최대 10MB)"}</span>
                  <input id="criminalFileInput" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange(setCriminalFile)} />
                  {criminalFile && (
                    <button type="button" className="mt-2 text-xs text-red-400 underline" onClick={handleRemoveFile(setCriminalFile)}>
                      삭제
                    </button>
                  )}
                </div>
              </div>
              {/* 건강검진서 첨부 */}
              <div>
                <label className="block font-medium mb-1">건강검진서 첨부</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition"
                  onClick={() => handleBoxClick('healthFileInput')}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{healthFile ? healthFile.name : "파일을 선택하세요 (PDF, JPG, PNG, 최대 10MB)"}</span>
                  <input id="healthFileInput" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange(setHealthFile)} />
                  {healthFile && (
                    <button type="button" className="mt-2 text-xs text-red-400 underline" onClick={handleRemoveFile(setHealthFile)}>
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-black rounded-lg font-semibold disabled:bg-gray-600"
                disabled={!idFile || !criminalFile || !healthFile || loading}
              >
                {loading ? '제출 중...' : '서류 제출'}
              </button>
            </form>
          </div>
        </main>
        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
} 