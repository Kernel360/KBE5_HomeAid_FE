import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react'; // Search 아이콘 임포트
import { authService } from './services/authService'; // authService 임포트
import useSignUpStore from '../../stores/signUpStore'; // Zustand 스토어 임포트
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CustomerSignUpCompletionModal from './CustomerSignUpCompletionPage'; // 모달 컴포넌트 임포트


// Step 2 유효성 검사 헬퍼 함수
const validateCustomerStep2Data = ({ addressSearch, addressDetail }) => {
  if (!addressSearch || !addressDetail) {
    return '주소 검색 및 상세 주소를 모두 입력해주세요.';
  }
  // TODO: 필요하다면 더 복잡한 주소 유효성 검사 추가

  return null; // 유효성 검사 통과
};

const CustomerSignUpStep2Page = () => {
  const [addressNickname, setAddressNickname] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(''); // 에러 상태 추가
  const [showCompletionModal, setShowCompletionModal] = useState(false); // 완료 모달 상태 추가

  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // Zustand 스토어에서 고객 회원가입 데이터와 초기화 함수 가져오기
  const { customerSignUpData, resetSignUpData } = useSignUpStore();

  const handleSignUp = async () => {
    setError(''); // 이전 에러 초기화

    // 헬퍼 함수를 사용하여 유효성 검사
    const validationError = validateCustomerStep2Data({
      addressSearch,
      addressDetail,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    // 현재 단계에서 수집된 주소 정보와 Step1 데이터를 합침
    const customerSignUpDataForApi = {
      ...customerSignUpData,
      gender: customerSignUpData.gender
        ? customerSignUpData.gender.toUpperCase()
        : '', // 성별 값을 대문자로 변환
      address: addressSearch, // 도로명/지번 주소
      addressDetail: addressDetail, // 상세 주소
      // 주소 별명(addressNickname)과 기본 주소 설정(isDefaultAddress)은 백엔드 DTO에 없으므로 포함하지 않음
    };

    console.log('API 전송 데이터:', customerSignUpDataForApi); // 전송할 데이터 로그 추가

    setLoading(true); // 로딩 시작

    try {
      // authService의 customerSignUp 함수 호출 시 합쳐진 데이터 사용
      const response = await authService.customerSignUp(
        customerSignUpDataForApi
      );
      console.log('고객 회원가입 성공:', response);

      // 회원가입 성공 시 스토어 데이터 초기화
      resetSignUpData();

      // 성공 시 모달 표시
      setShowCompletionModal(true);
    } catch (err) {
      console.error('고객 회원가입 실패:', err);
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

  const handleMapCheck = () => {
    // TODO: Implement map integration or address verification
    console.log('지도에서 위치 확인 클릭');
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
            주소 등록
          </h2>
          <div style={{ fontSize: '15px', color: '#888' }}>
            주소를 입력해주세요.
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
          ></div>{' '}
          {/* Step 1 active */}
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#247cff',
              borderRadius: '2px',
              marginRight: '2px',
            }}
          ></div>{' '}
          {/* Step 2 active */}
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#247cff',
              borderRadius: '2px',
            }}
          ></div>{' '}
          {/* Step 3 inactive */}
        </div>

        {/* Form Fields */}
        <form onSubmit={(e) => e.preventDefault()} style={{ width: '100%' }}>
          {/* 주소 검색 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="addressSearch"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              주소 검색
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="addressSearch"
                type="text"
                placeholder="도로명, 지번, 건물명으로 검색"
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                required
                style={{
                  width: 'calc(100% - 26px)',
                  padding: '13px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '16px',
                  color: '#333',
                }}
              />
              {/* Search Icon */}
              <Search
                size={20}
                color="#6B7280"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </div>
          </div>

          {/* 상세 주소 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="addressDetail"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              상세 주소
            </label>
            <input
              id="addressDetail"
              type="text"
              placeholder="동/호수 등 상세 주소 입력"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              style={{
                width: 'calc(100% - 26px)',
                padding: '13px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '16px',
                color: '#333',
              }}
            />
          </div>

          {/* 주소 별명 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="addressNickname"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              주소 별명
            </label>
            <input
              id="addressNickname"
              type="text"
              placeholder="예: 집, 회사, 학교"
              value={addressNickname}
              onChange={(e) => setAddressNickname(e.target.value)}
              style={{
                width: 'calc(100% - 26px)',
                padding: '13px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '16px',
                color: '#333',
              }}
            />
          </div>

          {/* 기본 주소로 설정 Checkbox */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <input
              id="isDefaultAddress"
              type="checkbox"
              checked={isDefaultAddress}
              onChange={(e) => setIsDefaultAddress(e.target.checked)}
              style={{
                marginRight: '8px',
                width: '20px',
                height: '20px',
                accentColor: '#247cff',
              }}
            />
            <label
              htmlFor="isDefaultAddress"
              style={{ fontSize: '14px', color: '#374151' }}
            >
              기본 주소로 설정
            </label>
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
            onClick={handleSignUp}
            disabled={loading}
            style={{
              width: '100%',
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
        </form>
        {/* 에러 메시지 표시 */}
        {error && (
          <div
            style={{
              color: '#e74c3c',
              fontSize: '14px',
              marginTop: '16px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
      </div>

      <Footer />

      {/* 회원가입 완료 모달 */}
      <CustomerSignUpCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
};

export default CustomerSignUpStep2Page;
