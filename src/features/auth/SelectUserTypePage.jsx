import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectUserTypePage = () => {
  const [userType, setUserType] = useState('customer');
  const navigate = useNavigate();

  const handleNext = () => {
    if (userType === 'manager') {
      navigate('/auth/signup/manager');
    } else {
      navigate('/auth/signup/customer');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>회원가입</h2>
      <div style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>회원 유형을 선택해주세요.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', padding: 12, border: userType === 'customer' ? '2px solid #247cff' : '1px solid #ddd', borderRadius: 8, cursor: 'pointer', background: userType === 'customer' ? '#f5faff' : '#fff' }}>
          <input
            type="radio"
            name="userType"
            value="customer"
            checked={userType === 'customer'}
            onChange={() => setUserType('customer')}
            style={{ marginRight: 10 }}
          />
          개인
        </label>
        <label style={{ display: 'flex', alignItems: 'center', padding: 12, border: userType === 'manager' ? '2px solid #247cff' : '1px solid #ddd', borderRadius: 8, cursor: 'pointer', background: userType === 'manager' ? '#f5faff' : '#fff' }}>
          <input
            type="radio"
            name="userType"
            value="manager"
            checked={userType === 'manager'}
            onChange={() => setUserType('manager')}
            style={{ marginRight: 10 }}
          />
          매니저
        </label>
      </div>
      <button
        onClick={handleNext}
        style={{ width: '100%', background: '#247cff', color: '#fff', fontWeight: 700, fontSize: 16, padding: 12, border: 'none', borderRadius: 6, marginBottom: 16, cursor: 'pointer' }}
      >
        다음
      </button>
    </div>
  );
};

export default SelectUserTypePage; 