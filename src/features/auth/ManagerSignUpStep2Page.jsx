import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// lucide-react 아이콘 사용 시 설치 필요: npm install react-icons lucide-react --save
import { Calendar, Eye, EyeOff, Upload } from 'lucide-react'; // Upload 아이콘 추가
import { authService } from '../../services/authService'; // authService 임포트
import useSignUpStore from '../../stores/signUpStore'; // Zustand 스토어 임포트
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ManagerSignUpCompletionModal from './ManagerSignUpCompletionPage'; // 모달 컴포넌트 임포트

// Step 2 유효성 검사 헬퍼 함수 (매니저)
const validateManagerStep2Data = ({ career, experience }) => {
  if (!career || career.trim() === '') {
    return '경력 사항(Career)을 입력해주세요.';
  }
  if (!experience || experience.trim() === '') {
    return '경험(Experience)을 입력해주세요.';
  }
  // TODO: 필요하다면 서류 업로드 여부 등 추가 유효성 검사 포함

  return null; // 유효성 검사 통과
};

const ManagerSignUpStep2Page = () => {
  const [career, setCareer] = useState(''); // career 상태 추가
  const [experience, setExperience] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // 파일 상태 추가
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(''); // 에러 상태 추가
  const [showCompletionModal, setShowCompletionModal] = useState(false); // 완료 모달 상태 추가

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
    const validationError = validateManagerStep2Data({ career, experience });
    if (validationError) {
      setError(validationError);
      return;
    }
    // TODO: Step 1에서 가져온 managerSignUpData의 유효성도 여기서 다시 한번 검사할 수 있습니다. (선택 사항)

    // 현재 단계에서 수집된 경력과 업로드된 파일 정보를 합침
    const managerSignUpDataForApi = {
      ...managerSignUpData, // Step1에서 저장된 데이터
      gender: managerSignUpData.gender
        ? managerSignUpData.gender.toUpperCase()
        : '', // 성별 값을 대문자로 변환
      career: career, // 경력 사항(Career) 추가
      experience: experience, // 경험(Experience) 추가
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

      // 성공 시 모달 표시
      setShowCompletionModal(true);
    } catch (err) {
      console.error('매니저 회원가입 실패:', err);
      // 백엔드에서 보낸 오류 메시지 또는 기본 메시지 표시
      setError(
        err.response?.data?.message ||
          err.message ||
          '회원가입 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  const handlePrevious = () => {
    navigate(-1); // 이전 페이지로 이동 (Step 1)
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'x-hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Header showBackButton={true} />

      <div
        style={{
          width: '100%',
          maxWidth: '512px',
          marginTop: '20px', // Header 높이만큼
          marginBottom: '64px', // Footer 높이만큼
          minHeight: 'calc(100vh - 128px)', // Header + Footer 높이 제외
          padding: '40px 20px',
          boxSizing: 'border-box',
          background: '#fff',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#222',
              marginBottom: '8px',
            }}
          >
            서비스 정보 등록
          </h2>
          <div style={{ fontSize: '15px', color: '#888' }}>
            제공 가능한 서비스 정보를 입력해주세요
          </div>
        </div>

        {/* Step Indicator - Step 2 of 3 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '0 2px',
          }}
        >
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#247cff',
              borderRadius: '2px',
            }}
          ></div>
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#247cff',
              borderRadius: '2px',
            }}
          ></div>
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#ddd',
              borderRadius: '2px',
            }}
          ></div>
        </div>

        {/* Career Section - 새로 추가 */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#222',
              marginBottom: '8px',
            }}
          >
            경력 (Career)
          </div>
          <div
            style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}
          >
            (예: 간병인 5년, 청소 전문가 3년)
          </div>
          <textarea
            placeholder="본인의 전문 경력을 입력해 주세요 (예: 간병인 5년, 청소 전문가 3년)"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            style={{
              width: 'calc(100% - 26px)',
              minHeight: '80px',
              padding: '13px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '16px',
              color: '#333',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Experience Section */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#222',
              marginBottom: '8px',
            }}
          >
            경험 (Experience)
          </div>
          <div
            style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}
          >
            (예: 독거노인 돌봄, 병원 청소, 사무실 관리 등)
          </div>
          <textarea
            placeholder="본인의 서비스 경험을 입력해 주세요 (예: 독거노인 돌봄, 병원 청소, 사무실 관리 등)"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            style={{
              width: 'calc(100% - 26px)',
              minHeight: '80px',
              padding: '13px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '16px',
              color: '#333',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Document Upload Section */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#222',
              marginBottom: '8px',
            }}
          >
            서류 업로드
          </div>
          <div
            style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}
          >
            신분증, 자격증 등 관련 서류를 업로드해주세요
          </div>

          {/* File Upload Input */}
          <div
            style={{
              border: '2px dashed #E5E7EB',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Upload size={32} color="#6B7280" style={{ marginBottom: '8px' }} />
            <div
              style={{ fontSize: '16px', color: '#333', marginBottom: '4px' }}
            >
              {selectedFile ? selectedFile.name : '파일을 선택하세요'}
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              PDF, JPG, PNG, DOC 파일 지원 (최대 10MB)
            </div>
          </div>
        </div>

        {/* 에러 메시지 표시 */}
        {error && (
          <div
            style={{
              color: '#e74c3c',
              fontSize: '14px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

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
            disabled={loading}
            style={{
              flexGrow: 1,
              background: '#247cff',
              color: '#fff',
              fontWeight: '900',
              fontSize: '16px',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </div>
      </div>

      <Footer />

      {/* 회원가입 완료 모달 */}
      <ManagerSignUpCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
};

export default ManagerSignUpStep2Page;
