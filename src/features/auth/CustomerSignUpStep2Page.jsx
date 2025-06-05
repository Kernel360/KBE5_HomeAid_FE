import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react'; // Search 아이콘 임포트

const CustomerSignUpStep2Page = () => {
  const [addressNickname, setAddressNickname] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  const navigate = useNavigate();

  const handleSignup = () => {
    // TODO: Implement address data validation and submission logic
    console.log('고객 회원가입 2단계 데이터:', { addressNickname, addressSearch, addressDetail, isDefaultAddress });
    // 다음 단계 또는 완료 페이지로 이동
    navigate('/auth/signup/customer/completion'); // 완료 페이지 경로로 이동
  };

  const handleMapCheck = () => {
    // TODO: Implement map integration or address verification
    console.log('지도에서 위치 확인 클릭');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#f4f5f7', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#222', marginBottom: '8px' }}>주소 등록</h2>
          <div style={{ fontSize: '15px', color: '#888' }}>주소를 입력해주세요.</div>
        </div>

        {/* Step Indicator - Step 2 of 3 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 2px' }}>
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#247cff', borderRadius: '2px' }}></div> {/* Step 1 active */}
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#247cff', borderRadius: '2px', marginRight: '2px' }}></div> {/* Step 2 active */}
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#247cff', borderRadius: '2px' }}></div> {/* Step 3 inactive */}
        </div>

        {/* Form Fields */}
        <form onSubmit={e => e.preventDefault()} style={{ width: '100%' }}>

          {/* 주소 검색 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="addressSearch" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>주소 검색</label>
            <div style={{ position: 'relative' }}>
              <input
                id="addressSearch"
                type="text"
                placeholder="도로명, 지번, 건물명으로 검색"
                value={addressSearch}
                onChange={e => setAddressSearch(e.target.value)}
                required
                style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
              />
              {/* Search Icon */}
              <Search size={20} color="#6B7280" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* 상세 주소 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="addressDetail" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>상세 주소</label>
            <input
              id="addressDetail"
              type="text"
              placeholder="동/호수 등 상세 주소 입력"
              value={addressDetail}
              onChange={e => setAddressDetail(e.target.value)}
              style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
            />
          </div>

          {/* 주소 별명 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="addressNickname" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>주소 별명</label>
            <input
              id="addressNickname"
              type="text"
              placeholder="예: 집, 회사, 학교"
              value={addressNickname}
              onChange={e => setAddressNickname(e.target.value)}
              style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
            />
          </div>

          {/* 기본 주소로 설정 Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <input
              id="isDefaultAddress"
              type="checkbox"
              checked={isDefaultAddress}
              onChange={e => setIsDefaultAddress(e.target.checked)}
              style={{ marginRight: '8px', width: '20px', height: '20px', accentColor: '#247cff' }}
            />
            <label htmlFor="isDefaultAddress" style={{ fontSize: '14px', color: '#374151' }}>기본 주소로 설정</label>
          </div>

          {/* 지도에서 위치 확인 Button */}
          <button
            type="button"
            onClick={handleMapCheck}
            style={{
              width: '100%',
              background: 'rgba(35, 92, 250, 0.9)', // Adjusted opacity based on Figma
              color: '#fff',
              fontWeight: '900',
              fontSize: '16px',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              marginBottom: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          >
            지도에서 위치 확인
          </button>

          {/* 회원가입 Button */}
          <button
            type="button"
            onClick={handleSignup}
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
            회원가입
          </button>

        </form>
      </div>
    </div>
  );
};

export default CustomerSignUpStep2Page; 