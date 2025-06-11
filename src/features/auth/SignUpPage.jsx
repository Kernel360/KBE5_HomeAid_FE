import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const SignUpPage = () => {
  const [userType, setUserType] = useState('customer');
  const navigate = useNavigate();

  const handleNext = () => {
    if (userType === 'manager') {
      navigate('/auth/signup/manager/step1');
    } else {
      navigate('/auth/signup/customer/step1');
    }
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
          marginTop: '20px',
          marginBottom: '10px',
          minHeight: 'calc(100vh - 128px)', // Header + Footer 높이 제외
          padding: '40px 20px',
          boxSizing: 'border-box',
          background: '#fff',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#222',
            marginBottom: '8px',
          }}
        >
          회원가입
        </h2>
        <div style={{ fontSize: '15px', color: '#888', marginBottom: '24px' }}>
          회원 유형을 선택해주세요.
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '0',
          }}
        >
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#247cff',
              borderRadius: '2px',
              marginRight: '2px',
            }}
          ></div>
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#ddd',
              borderRadius: '2px',
              marginRight: '2px',
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

        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#222',
            marginBottom: '16px',
          }}
        >
          회원 유형
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px',
              border:
                userType === 'customer'
                  ? '2px solid #247cff'
                  : '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              background: userType === 'customer' ? '#f5faff' : '#fff',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
          >
            <input
              type="radio"
              name="userType"
              value="customer"
              checked={userType === 'customer'}
              onChange={() => setUserType('customer')}
              style={{
                marginRight: '16px',
                accentColor: userType === 'customer' ? '#247cff' : '#ccc',
                width: '20px',
                height: '20px',
              }}
            />
            <span
              style={{ fontSize: '18px', fontWeight: 'normal', color: '#333' }}
            >
              개인
            </span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px',
              border:
                userType === 'manager' ? '2px solid #247cff' : '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              background: userType === 'manager' ? '#f5faff' : '#fff',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
          >
            <input
              type="radio"
              name="userType"
              value="manager"
              checked={userType === 'manager'}
              onChange={() => setUserType('manager')}
              style={{
                marginRight: '16px',
                accentColor: userType === 'manager' ? '#247cff' : '#ccc',
                width: '20px',
                height: '20px',
              }}
            />
            <span
              style={{ fontSize: '18px', fontWeight: 'normal', color: '#333' }}
            >
              매니저
            </span>
          </label>
        </div>

        <button
          onClick={handleNext}
          style={{
            width: '100%',
            background: '#247cff',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '18px',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            marginBottom: '24px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          다음
        </button>

        <div style={{ textAlign: 'center', fontSize: '15px', color: '#888' }}>
          이미 계정이 있으신가요?{' '}
          <a
            href="/auth/signin"
            style={{
              color: '#247cff',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            로그인
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignUpPage;
