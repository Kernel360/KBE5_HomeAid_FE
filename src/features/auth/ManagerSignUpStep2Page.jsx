import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// lucide-react 아이콘 사용 시 설치 필요: npm install react-icons lucide-react --save
import { Calendar, Eye, EyeOff, Upload } from 'lucide-react'; // Upload 아이콘 추가
import { authService } from '../../services/authService'; // authService 임포트
import useSignUpStore from '../../stores/signUpStore'; // Zustand 스토어 임포트

// Step 2 유효성 검사 헬퍼 함수 (매니저)
const validateManagerStep2Data = ({ experience }) => {
  if (!experience || experience.trim() === '') { // 경력 사항 필수 입력 및 공백 체크
    return '경력 사항을 입력해주세요.';
  }
  // TODO: 필요하다면 서류 업로드 여부 등 추가 유효성 검사 포함

  return null; // 유효성 검사 통과
};

const ManagerSignUpStep2Page = () => {
  const [experience, setExperience] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // 파일 상태 추가
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(''); // 에러 상태 추가

  const navigate = useNavigate();

  // Zustand 스토어에서 매니저 회원가입 데이터와 초기화 함수 가져오기
  const { managerSignUpData, resetSignUpData } = useSignUpStore();

  const handleFileChange = (event) => {
    // 파일 선택 시 호출될 함수
    setSelectedFile(event.target.files[0]);
  };

  const handleSignUp = async () => {
    setError(''); // 이전 에러 초기화

    // 헬퍼 함수를 사용하여 유효성 검사
    const validationError = validateManagerStep2Data({ experience });
    if (validationError) {
      setError(validationError);
      return;
    }
    // TODO: Step 1에서 가져온 managerSignUpData의 유효성도 여기서 다시 한번 검사할 수 있습니다. (선택 사항)

    // 현재 단계에서 수집된 경력과 업로드된 파일 정보를 합침
    // 백엔드 DTO (ManagerSignUpRequestDto)에는 파일 필드가 직접 없는 것으로 보입니다.
    // 파일 업로드는 별도의 API 호출이 필요하거나, base64 등으로 변환하여 데이터에 포함해야 할 수 있습니다.
    // 현재 백엔드 DTO 구조에 맞춰 경력 정보만 포함하겠습니다. 파일 업로드 로직은 백엔드와 협의 후 추가해야 합니다.
    const managerSignUpDataForApi = {
        ...managerSignUpData, // Step1에서 저장된 데이터
        gender: managerSignUpData.gender ? managerSignUpData.gender.toUpperCase() : '', // 성별 값을 대문자로 변환
        experience: experience, // 경력 사항 (현재 페이지)
        // 파일 정보는 DTO에 맞춰서 처리 방식 결정 필요
        // uploadedFile: selectedFile // DTO에 맞는 형식으로 변환 필요
    };

    console.log('API 전송 데이터:', managerSignUpDataForApi); // 전송할 데이터 로그 추가

    // TODO: 파일 업로드 로직 추가 (selectedFile 처리) - 백엔드 API 명세 확인 필요

    setLoading(true); // 로딩 시작

    try {
      // authService의 managerSignUp 함수 호출
      const response = await authService.managerSignUp(managerSignUpDataForApi);
      console.log('매니저 회원가입 성공:', response);

      // 회원가입 성공 시 스토어 데이터 초기화
      resetSignUpData();

      // 성공 시 완료 페이지로 이동
      navigate('/auth/signup/manager/completion');

    } catch (err) {
      console.error('매니저 회원가입 실패:', err);
      // 백엔드에서 보낸 오류 메시지 또는 기본 메시지 표시
      setError(err.response?.data?.message || err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  const handlePrevious = () => {
    navigate(-1); // 이전 페이지로 이동 (Step 1)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#f4f5f7', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#222', marginBottom: '8px' }}>서비스 정보 등록</h2>
          <div style={{ fontSize: '15px', color: '#888' }}>제공 가능한 서비스 정보를 입력해주세요</div>
        </div>

        {/* Step Indicator - Step 2 of 3 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 2px' }}>
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#247cff', borderRadius: '2px' }}></div>
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#247cff', borderRadius: '2px' }}></div>
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#ddd', borderRadius: '2px' }}></div>
        </div>

        {/* Experience Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#222', marginBottom: '8px' }}>경력 사항</div>
          <div style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}>
            {/* Placeholder for experience description */}
            청소 관련 경력 3년, 호텔 하우스키핑 2년 근무 등
          </div>
          {/* Input for Experience - Using a textarea for multi-line input */}
          <textarea
            placeholder="경력을 입력해 주세요 (예: 청소 관련 경력 3년, 호텔 하우스키핑 2년 근무)"
            value={experience}
            onChange={e => setExperience(e.target.value)}
            style={{ width: 'calc(100% - 26px)', minHeight: '120px', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333', resize: 'vertical' }}
          />
        </div>

        {/* Document Upload Section - Moved from Step 1 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#222', marginBottom: '8px' }}>서류 업로드</div>
          <div style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}>본인 인증을 위한 서류를 업로드해주세요 (예: 신분증, 경력증명서).</div>
          {/* 파일 입력 및 드래그앤드롭 영역 */}
          <label htmlFor="document-upload" style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px', cursor: 'pointer' }}>
            <input
              id="document-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }} // 기본 파일 입력 숨김
            />
            {selectedFile ? (
              <div style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>{selectedFile.name}</div>
            ) : (
              <>
                {/* Placeholder for Upload Icon */}
                <div style={{ width: '40px', height: '40px', backgroundColor: '#D1D5DB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                   <Upload size={24} color="#6B7280" /> {/* lucide-react Upload 아이콘 사용 */}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>pdf 파일로 제출</div>
              </>
            )}
          </label>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePrevious}
            style={{
              flexGrow: 1,
              background: '#fff',
              color: '#4B5563',
              fontWeight: '900',
              fontSize: '16px',
              padding: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
          >
            이전
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading} // 로딩 중 버튼 비활성화
            style={{
              flexGrow: 1,
              background: '#247cff',
              color: '#fff',
              fontWeight: '900',
              fontSize: '16px',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer', // 로딩 중 커서 변경
              transition: 'background-color 0.3s ease',
              opacity: loading ? 0.7 : 1, // 로딩 중 투명도 조절
            }}
          >
            {loading ? '회원가입 중...' : '회원가입'} {/* 로딩 텍스트 변경 */}
          </button>
        </div>

        {/* 에러 메시지 표시 */}
        {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</div>}

      </div>
    </div>
  );
};

export default ManagerSignUpStep2Page; 