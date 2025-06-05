import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, Check } from 'lucide-react'; // 필요한 아이콘 임포트

const CustomerSignUpCompletionPage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    // TODO: 로그인 페이지 경로 확인 및 이동
    navigate('/auth/signin'); // 예시: 로그인 페이지 경로
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#f4f5f7', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>

        {/* Success Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '120px', height: '120px', backgroundColor: 'rgba(35, 92, 250, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <CheckCircle size={60} color="#235CFA" /> {/* Lucide React CheckCircle 아이콘 */}
          </div>
        </div>

        {/* Success Message */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>회원가입 완료!</h2>
          <div style={{ fontSize: '16px', color: '#666', lineHeight: '1.5' }}>
            HomeAid 수요자로 등록이 완료되었습니다.<br/>
            이제 로그인하여 서비스를 이용하세요.
          </div>
        </div>

        {/* Customer Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(35, 92, 250, 0.1)', borderRadius: '20px' }}>
              <User size={16} color="#235CFA" /> {/* Lucide React User 아이콘 */}
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#235CFA' }}>수요자</span>
           </div>
        </div>

        {/* Benefits List */}
        <div style={{ textAlign: 'left', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>수요자 혜택</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Check size={20} color="#235CFA" /> {/* Lucide React Check 아이콘 */}
              <span style={{ fontSize: '14px', color: '#666' }}>편리한 청소 서비스 예약</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Check size={20} color="#235CFA" /> {/* Lucide React Check 아이콘 */}
              <span style={{ fontSize: '14px', color: '#666' }}>검증된 전문 매니저 매칭</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Check size={20} color="#235CFA" /> {/* Lucide React Check 아이콘 */}
              <span style={{ fontSize: '14px', color: '#666' }}>안전한 결제 시스템</span>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLoginRedirect}
          style={{
            width: '100%',
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
          로그인하기
        </button>

      </div>
    </div>
  );
};

export default CustomerSignUpCompletionPage; 