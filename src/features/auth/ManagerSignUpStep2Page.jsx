import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// lucide-react 아이콘 사용 시 설치 필요: npm install react-icons lucide-react --save
import { Calendar, Eye, EyeOff, Upload } from 'lucide-react'; // Upload 아이콘 추가

const ManagerSignUpStep2Page = () => {
  const [experience, setExperience] = useState('');
  // TODO: Add state for document upload

  const navigate = useNavigate();

  const handleSignUp = () => {
    // TODO: 입력값 유효성 검사 및 데이터 처리, 회원가입 완료 로직 추가
    console.log('매니저 회원가입 2단계 데이터:', { experience });
    // 회원가입 완료 페이지로 이동 (예: '/auth/signup/manager/completion')
    // navigate('/auth/signup/manager/completion');
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
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
            {/* Placeholder for Upload Icon */}
            <div style={{ width: '40px', height: '40px', backgroundColor: '#D1D5DB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
               <Upload size={24} color="#6B7280" /> {/* lucide-react Upload 아이콘 사용 */}
            </div>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>pdf 파일로 제출</div>
            {/* TODO: Add actual file input and upload logic here */}
          </div>
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
            onClick={handleSignUp} // Change to handleSignUp for the final step button
            style={{
              flexGrow: 1,
              background: '#247cff',
              color: '#fff',
              fontWeight: '900',
              fontSize: '16px',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          >
            회원가입
          </button>
        </div>

      </div>
    </div>
  );
};

export default ManagerSignUpStep2Page; 