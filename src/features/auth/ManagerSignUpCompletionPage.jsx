import React from 'react';
import { useNavigate } from 'react-router-dom';

// lucide-react 아이콘 사용 시 설치 필요: npm install react-icons lucide-react --save
import { CheckCircle, Star } from 'lucide-react'; // 필요한 아이콘 임포트

const ManagerSignUpCompletionPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth/signin'); // 로그인 페이지로 이동
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#f4f5f7', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>

        {/* Success Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(35, 92, 250, 0.1)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={48} color="#235CFA" /> {/* 체크 아이콘 사용 */}
          </div>
        </div>

        {/* Success Message */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>회원가입 완료!</h2>
          <div style={{ fontSize: '16px', color: '#666', lineHeight: '1.5' }}>
            HomeAid 매니저로 등록이 완료되었습니다.<br/>
            이제 로그인하여 서비스를 시작하세요.
          </div>
        </div>

        {/* Manager Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'rgba(35, 92, 250, 0.1)', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={16} color="#235CFA" /> {/* 별 아이콘 사용 */}
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#235CFA' }}>매니저</span>
          </div>
        </div>

        {/* Benefits List */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#333', marginBottom: '12px' }}>매니저 혜택</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Benefit Item 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={20} color="#235CFA" /> {/* 체크 아이콘 사용 */}
              <div style={{ fontSize: '14px', color: '#666' }}>자유로운 스케줄 관리</div>
            </div>
            {/* Benefit Item 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={20} color="#235CFA" /> {/* 체크 아이콘 사용 */}
              <div style={{ fontSize: '14px', color: '#666' }}>안정적인 수입 창출</div>
            </div>
            {/* Benefit Item 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={20} color="#235CFA" /> {/* 체크 아이콘 사용 */}
              <div style={{ fontSize: '14px', color: '#666' }}>전문 교육 및 지원</div>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLoginClick}
          style={{
            width: '100%',
            background: '#235CFA',
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
          로그인하기
        </button>

      </div>
    </div>
  );
};

export default ManagerSignUpCompletionPage; 