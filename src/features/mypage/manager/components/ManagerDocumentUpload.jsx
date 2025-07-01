import React, { useState, useEffect } from 'react';
import { apiService } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

// JWT 토큰 디코딩 헬퍼 함수
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

export default function ManagerDocumentUpload({ onBack }) {
  const [idFile, setIdFile] = useState(null);
  const [criminalFile, setCriminalFile] = useState(null);
  const [healthFile, setHealthFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 매니저 상태
  const [documentList, setDocumentList] = useState([]); // 서버에서 조회한 파일 정보
  const [error, setError] = useState(null);

  // Auth Store에서 사용자 정보 가져오기
  const { user, accessToken } = useAuthStore();

  // 서버에서 첨부파일/상태 조회
  useEffect(() => {
    async function fetchCertifications() {
      try {
        setError(null);

        // 인증 상태 디버깅
        console.log('🔐 현재 인증 상태 확인:');
        console.log('  - 사용자 정보:', user);
        console.log('  - 사용자 역할:', user?.role);
        console.log('  - 사용자 ID:', user?.userId || user?.id);
        console.log('  - 사용자 이름:', user?.name || user?.username);
        console.log('  - Access Token 존재:', !!accessToken);
        console.log(
          '  - localStorage Token:',
          !!localStorage.getItem('accessToken')
        );
        console.log(
          '  - localStorage Auth Storage:',
          localStorage.getItem('auth-storage')
        );

        // JWT 토큰 디코딩
        const token = accessToken || localStorage.getItem('accessToken');
        if (token) {
          const decodedToken = decodeJWT(token);
          console.log('🔓 JWT 토큰 디코딩 결과:', decodedToken);
          console.log('  - 토큰 내 사용자 ID:', decodedToken?.userId);
          console.log('  - 토큰 내 역할:', decodedToken?.role);
          console.log(
            '  - 토큰 만료 시간:',
            decodedToken?.exp ? new Date(decodedToken.exp * 1000) : '없음'
          );
          console.log(
            '  - 토큰 발급 시간:',
            decodedToken?.iat ? new Date(decodedToken.iat * 1000) : '없음'
          );

          // 토큰 만료 체크
          if (decodedToken?.exp && decodedToken.exp * 1000 < Date.now()) {
            throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
          }
        }

        // 매니저 권한 확인
        if (!user) {
          throw new Error('사용자 정보가 없습니다. 다시 로그인해주세요.');
        }

        if (user.role !== 'MANAGER' && user.role !== 'ROLE_MANAGER') {
          throw new Error(
            `매니저 권한이 필요합니다. 현재 권한: ${user.role || '없음'}. 매니저 계정으로 로그인해주세요.`
          );
        }

        if (!accessToken && !localStorage.getItem('accessToken')) {
          throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        }

        // 1. 먼저 매니저 프로필 존재 여부 확인 및 필요시 생성
        console.log('👤 매니저 프로필 조회 시작...');
        let profileExists = false;
        try {
          const profileRes = await apiService.manager.getProfile();
          console.log('✅ 매니저 프로필 조회 성공:', profileRes);
          profileExists = true;
        } catch (profileError) {
          console.error('❌ 매니저 프로필 조회 실패:', profileError);
          console.error('  - 프로필 조회 상태:', profileError.response?.status);
          console.error('  - 프로필 조회 응답:', profileError.response?.data);

          // 404 또는 403 오류인 경우 프로필이 없다는 의미이므로 생성
          if (
            profileError.response?.status === 404 ||
            profileError.response?.status === 403
          ) {
            console.log('📝 매니저 프로필이 없으므로 생성을 시도합니다...');
            try {
              const defaultProfileData = {
                introduction: '안녕하세요.',
                experienceYears: 1,
                serviceAreas: [],
              };
              const createRes =
                await apiService.manager.createProfile(defaultProfileData);
              console.log('✅ 매니저 프로필 생성 성공:', createRes);
              profileExists = true;
            } catch (createError) {
              console.error('❌ 매니저 프로필 생성 실패:', createError);
              console.error(
                '  - 생성 오류 상태:',
                createError.response?.status
              );
              console.error('  - 생성 오류 응답:', createError.response?.data);
              profileExists = false;
            }
          } else {
            // 403이나 다른 오류인 경우
            profileExists = false;
          }
        }

        // 2. 매니저 서류 정보 조회 (프로필 존재 여부와 관계없이 시도)
        console.log('🔍 매니저 서류 정보 조회 시작...');
        console.log('  - API 엔드포인트: /managers/profile/certifications');
        console.log('  - 사용 토큰:', (token || '').substring(0, 50) + '...');
        console.log('  - 프로필 존재 여부:', profileExists);
        console.log('  - 현재 시간:', new Date().toISOString());

        // 프로필이 없는 경우 잠깐 대기 후 재시도
        if (!profileExists) {
          console.log(
            '⏳ 프로필이 없어서 1초 대기 후 서류 조회를 시도합니다...'
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const res = await apiService.manager.getCertifications();
        console.log('✅ 매니저 서류 조회 응답:', res);

        // CommonApiResponse 구조 처리
        const responseData = res.data?.data || res.data;

        if (responseData) {
          console.log('📋 매니저 서류 데이터:', responseData);
          setStatus(responseData.status);
          setDocumentList(responseData.documentList || []);

          // 이미 등록된 파일이 있으면 파일명만 미리 세팅(수정/삭제 가능 상태만)
          if (
            responseData.documentList &&
            Array.isArray(responseData.documentList)
          ) {
            responseData.documentList.forEach((doc) => {
              if (doc.documentType === 'ID_CARD') {
                setIdFile({
                  name: doc.originalName || doc.documentUrl.split('/').pop(),
                  url: doc.documentUrl,
                });
              }
              if (doc.documentType === 'CRIMINAL_RECORD') {
                setCriminalFile({
                  name: doc.originalName || doc.documentUrl.split('/').pop(),
                  url: doc.documentUrl,
                });
              }
              if (doc.documentType === 'HEALTH_CERTIFICATE') {
                setHealthFile({
                  name: doc.originalName || doc.documentUrl.split('/').pop(),
                  url: doc.documentUrl,
                });
              }
            });
          }
        } else {
          console.warn('⚠️ 서류 정보가 없습니다.');
          setStatus(null);
          setDocumentList([]);
        }
      } catch (e) {
        console.error('❌ 매니저 서류 조회 실패:', e);

        let errorMessage = '서류 정보를 불러오는 중 오류가 발생했습니다.';

        if (e.response?.status === 403) {
          console.error('🚫 403 권한 오류 상세 정보:');
          console.error('  - 응답 상태:', e.response?.status);
          console.error('  - 응답 데이터:', e.response?.data);
          console.error('  - 응답 헤더:', e.response?.headers);
          console.error('  - 요청 URL:', e.config?.url);
          console.error('  - 요청 메소드:', e.config?.method);
          console.error(
            '  - 요청 헤더 Authorization:',
            e.config?.headers?.Authorization
          );
          console.error('  - 전체 요청 헤더:', e.config?.headers);

          // 서버 응답 메시지가 있으면 사용
          const serverMessage =
            e.response?.data?.message || e.response?.data?.error;
          console.error('  - 서버 에러 메시지:', serverMessage);

          // JWT 토큰 재분석
          const currentToken =
            accessToken || localStorage.getItem('accessToken');
          if (currentToken) {
            try {
              const decoded = decodeJWT(currentToken);
              console.error('🔍 403 오류 시 JWT 토큰 분석:');
              console.error('  - 토큰 사용자 ID:', decoded?.userId);
              console.error('  - 토큰 역할:', decoded?.role);
              console.error('  - 스토어 사용자 ID:', user?.userId || user?.id);
              console.error('  - 스토어 사용자 역할:', user?.role);
              console.error(
                '  - ID 일치 여부:',
                decoded?.userId === (user?.userId || user?.id)
              );
              console.error(
                '  - 역할 일치 여부:',
                decoded?.role === user?.role
              );

              // 토큰 만료 여부 재확인
              const isExpired = decoded?.exp && decoded.exp * 1000 < Date.now();
              console.error('  - 토큰 만료 여부:', isExpired);
              if (isExpired) {
                console.error('  ❌ 토큰이 만료되었습니다!');
              }
            } catch (decodeError) {
              console.error('  ❌ JWT 토큰 디코딩 실패:', decodeError);
            }
          }

          // 가능한 해결책 제시
          console.error('🔧 403 오류 해결책:');
          console.error('  1. 로그아웃 후 매니저 계정으로 다시 로그인');
          console.error('  2. 브라우저 캐시 및 localStorage 초기화');
          console.error('  3. 백엔드에서 매니저 권한 설정 확인');
          console.error('  4. 매니저 프로필 생성 여부 확인 필요');

          // 403 오류여도 서류 업로드는 시도해볼 수 있도록 허용
          console.log('⚠️ 서류 조회는 실패했지만 서류 업로드 폼을 표시합니다.');
          setStatus(null); // 상태를 null로 설정하여 업로드 폼 활성화
          setDocumentList([]);
          setError(
            '매니저 서류 조회에 실패했습니다. 로그아웃 후 다시 로그인하거나, 아래에서 서류를 직접 업로드해 보세요.'
          );
          return; // 에러 상태로 설정하지 않고 리턴
        } else if (e.response?.status === 401) {
          console.error('🔐 401 인증 오류:', e.response?.data);
          errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        } else if (e.response?.status === 404) {
          console.error('❓ 404 리소스 없음:', e.response?.data);
          console.log(
            '💡 404 오류는 서류가 아직 제출되지 않았음을 의미할 수 있습니다.'
          );
          // 404는 서류가 없다는 뜻이므로 업로드 폼 표시
          setStatus(null);
          setDocumentList([]);
          setError(null);
          return;
        } else if (e.response?.status === 500) {
          console.error('💥 500 서버 오류:', e.response?.data);
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (e.message) {
          errorMessage = e.message;
        }

        setError(errorMessage);
        setStatus(null);
        setDocumentList([]);
      }
    }
    fetchCertifications();
    // eslint-disable-next-line
  }, [user, accessToken]);

  const isActive = status === 'ACTIVE';

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 검증 (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }

      // 파일 형식 검증
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          '지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, JPG, PNG 파일만 업로드 가능합니다.'
        );
        return;
      }

      setter(file);
    }
  };

  const handleBoxClick = (inputId) => {
    if (!isActive) document.getElementById(inputId)?.click();
  };

  const handleRemoveFile = (setter) => () => {
    if (!isActive) setter(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idFile || !criminalFile || !healthFile) {
      alert('모든 서류를 첨부해주세요.');
      return;
    }

    // 인증 상태 재확인
    if (!user) {
      alert('사용자 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    if (user.role !== 'MANAGER' && user.role !== 'ROLE_MANAGER') {
      alert(
        `매니저 권한이 필요합니다. 현재 권한: ${user.role || '없음'}. 매니저 계정으로 로그인해주세요.`
      );
      return;
    }

    if (!accessToken && !localStorage.getItem('accessToken')) {
      alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 서류 업로드 인증 상태:');
      console.log('  - 사용자:', user?.userId, user?.role);
      console.log(
        '  - 토큰 존재:',
        !!accessToken || !!localStorage.getItem('accessToken')
      );
      console.log('📤 서류 업로드 시작...');

      const formData = new FormData();
      formData.append('idFile', idFile);
      formData.append('criminalRecordFile', criminalFile);
      formData.append('healthCertificateFile', healthFile);

      // FormData 내용 로깅
      console.log('📋 업로드할 파일들:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  - ${key}: ${value.name} (${value.size} bytes, ${value.type})`
          );
        }
      }

      const response = await apiService.manager.uploadCertifications(formData);
      console.log('✅ 서류 업로드 성공:', response);

      alert('서류가 성공적으로 제출되었습니다.');
      onBack && onBack();
    } catch (err) {
      console.error('❌ 서류 제출 실패:', err);

      let errorMessage = '서류 제출에 실패했습니다.';

      if (err.response?.status === 403) {
        console.error('🚫 403 권한 오류 (업로드):');
        console.error('  - 응답 데이터:', err.response?.data);
        console.error('  - 요청 헤더:', err.config?.headers);
        errorMessage =
          '매니저 권한이 없습니다. 로그아웃 후 매니저 계정으로 다시 로그인해주세요.';
      } else if (err.response?.status === 401) {
        console.error('🔐 401 인증 오류 (업로드):', err.response?.data);
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 400) {
        console.error('❌ 400 잘못된 요청 (업로드):', err.response?.data);
        const errorData = err.response?.data;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = '잘못된 요청입니다. 파일 형식과 크기를 확인해주세요.';
        }
      } else if (err.response?.status === 413) {
        errorMessage =
          '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.';
      } else if (err.response?.status === 500) {
        console.error('💥 500 서버 오류 (업로드):', err.response?.data);
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (
        err.code === 'ECONNREFUSED' ||
        err.message.includes('ECONNREFUSED')
      ) {
        errorMessage =
          '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 서버에서 조회한 파일 정보로 렌더링 (ACTIVE 상태)
  const renderFileBox = (type, file, setFile, inputId) => {
    const doc = documentList.find((d) => d.documentType === type);
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
            title={doc.originalName || doc.documentUrl.split('/').pop()}
          >
            {doc.originalName || doc.documentUrl.split('/').pop()}
          </a>
          <span className="text-xs text-gray-400 mt-1">
            (파일 크기: {doc.fileSize}) - 다운로드만 가능
          </span>
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
          <svg
            className="w-8 h-8 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>파일을 선택하세요</span>
          <span className="text-xs mt-1">
            (PDF, DOC, DOCX, JPG, PNG, 최대 10MB)
          </span>
          <input
            id={inputId}
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFileChange(setFile)}
          />
        </div>
      );
    }
    // 업로드/수정 가능 상태에서 파일이 있을 때(아직 제출 전 등)
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-700 bg-white">
        <span
          className="mt-2 text-blue-600 font-medium underline text-sm truncate max-w-full"
          title={file.name}
        >
          {file.name}
        </span>
        <span className="text-xs text-gray-400 mt-1">
          ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </span>
        <button
          type="button"
          onClick={handleRemoveFile(setFile)}
          className="mt-2 text-red-500 text-xs hover:text-red-700"
        >
          파일 제거
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className="w-full bg-gray-50 h-screen flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}
      >
        <Header showBackButton={true} onBackClick={onBack} />
        <main
          className="px-6 py-6 flex-1 overflow-y-auto"
          style={{ paddingBottom: '100px', paddingTop: '80px' }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              매니저 활동 승인 서류 제출
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              매니저 활동을 위해 필요한 서류를 제출해주세요.
              <br />
              (신분증, 범죄경력조회서, 건강검진서)
            </p>

            {/* 오류 메시지 표시 */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

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
                  {status === 'PENDING' && '⏱승인 대기'}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 신분증 첨부 */}
              <div>
                <label className="block font-medium mb-1">신분증 첨부 *</label>
                {renderFileBox('ID_CARD', idFile, setIdFile, 'idFileInput')}
              </div>

              {/* 범죄경력조회서 첨부 */}
              <div>
                <label className="block font-medium mb-1">
                  범죄경력조회서 첨부 *
                </label>
                {renderFileBox(
                  'CRIMINAL_RECORD',
                  criminalFile,
                  setCriminalFile,
                  'criminalFileInput'
                )}
              </div>

              {/* 건강검진서 첨부 */}
              <div>
                <label className="block font-medium mb-1">
                  건강검진서 첨부 *
                </label>
                {renderFileBox(
                  'HEALTH_CERTIFICATE',
                  healthFile,
                  setHealthFile,
                  'healthFileInput'
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  isActive
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : loading
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : !idFile || !criminalFile || !healthFile
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={
                  isActive || !idFile || !criminalFile || !healthFile || loading
                }
              >
                {isActive
                  ? '승인되었습니다'
                  : loading
                    ? '제출 중...'
                    : '서류 제출'}
              </button>
            </form>
          </div>
        </main>
        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
}
