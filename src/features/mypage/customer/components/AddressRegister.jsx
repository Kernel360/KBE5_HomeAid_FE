import { ArrowLeft, MapPin, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';
import { useAddressStore } from '../../../../stores/addressStore';

const KAKAO_MAP_KEY = import.meta.env.KAKAO_MAP_KEY;

const AddressRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAddress, isLoading, error, clearError } = useAddressStore();

  const returnPath = location.state?.from || '/customer/mypage/address';

  const [formData, setFormData] = useState({
    alias: '',
    address: '',
    addressDetail: '',
    latitude: 37.5665, // 기본값
    longitude: 126.9780, // 기본값
  });
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // 카카오맵 스크립트 동적 로드
  useEffect(() => {
    if (!window.kakao) {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services`;
      script.async = true;
      script.onload = () => {};
      document.body.appendChild(script);
    }
    if (!window.daum?.Postcode) {
      const script2 = document.createElement('script');
      script2.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script2.async = true;
      document.body.appendChild(script2);
    }
  }, []);

  // 페이지 진입 시 현재 위치로 지도 초기화
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setShowMap(true);
        },
        () => {
          // 위치 권한 거부 시 지도는 기본값(서울)으로 표시
          setShowMap(true);
        }
      );
    } else {
      setShowMap(true);
    }
  }, []);

  // 주소 선택 시 지도 표시 및 위도/경도 업데이트
  useEffect(() => {
    if (showMap && window.kakao && mapContainerRef.current) {
      const { latitude, longitude } = formData;
      const kakao = window.kakao;
      const center = new kakao.maps.LatLng(latitude, longitude);
      console.log(center);
      if (!mapRef.current) {
        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center,
          level: 3,
        });
        markerRef.current = new kakao.maps.Marker({
          position: center,
          map: mapRef.current,
        });
      } else {
        mapRef.current.setCenter(center);
        markerRef.current.setPosition(center);
      }
    }
  }, [showMap, formData.latitude, formData.longitude]);

  const handleBack = () => {
    navigate(returnPath);
  };

  // 카카오 주소 검색 모달 오픈
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert('카카오 주소 검색 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        const addr = data.address;
        // 주소 입력란에 반영
        setFormData((prev) => ({ ...prev, address: addr }));
        // 주소로 위도/경도 검색
        if (window.kakao) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(addr, function (results, status) {
            if (status === window.kakao.maps.services.Status.OK) {
              const result = results[0];
              const latitude = parseFloat(result.y);
              const longitude = parseFloat(result.x);
              setFormData((prev) => ({ ...prev, latitude, longitude }));
              setShowMap(true);
            }
          });
        }
      },
    }).open();
  };

  const handleSubmit = async () => {
    if (!formData.address.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }
    if (!formData.addressDetail.trim()) {
      alert('상세 주소를 입력해주세요.');
      return;
    }
    try {
      await addAddress(formData);
      alert('주소가 성공적으로 등록되었습니다.');
      navigate(returnPath);
    } catch (error) {
      console.error('주소 등록 실패:', error);
    }
  };

  if (error) {
    alert(error);
    clearError();
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={handleBack} />

      <main className="px-6 py-6" style={{ paddingTop: '80px' }}>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">주소 상세등록</h2>

          {/* 지도 표시 */}
          {showMap && (
            <div className="mb-6">
              <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '300px', borderRadius: '1rem', overflow: 'hidden' }}
                className="shadow border border-gray-200 dark:border-gray-700"
              ></div>
            </div>
          )}

          {/* 주소 검색 및 입력 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">새 주소 등록</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  주소 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="도로명, 지번, 건물명으로 검색"
                    className="w-full pr-12 pl-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.address}
                    readOnly
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={handleAddressSearch}
                  >
                    <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  상세 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="동/호수 등 상세 주소를 입력"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.addressDetail}
                  onChange={(e) =>
                    setFormData({ ...formData, addressDetail: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  주소 별명
                </label>
                <input
                  type="text"
                  placeholder="예: 집, 회사, 학교"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.alias}
                  onChange={(e) =>
                    setFormData({ ...formData, alias: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : '주소 저장하기'}
          </button>
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default AddressRegister;
