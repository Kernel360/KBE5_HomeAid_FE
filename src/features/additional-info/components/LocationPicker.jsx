import React, { useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import simpleAddress from '../util/simpleAddress';

const LocationPicker = ({ onLocationSelect, currentAddress }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Google Maps API 초기화
  const initializeGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Maps API 로드 실패'));
      document.head.appendChild(script);
    });
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Google Maps API 초기화
      await initializeGoogleMaps();

      // 위치 권한 요청
      if (!navigator.geolocation) {
        throw new Error('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Google Geocoding API로 주소 가져오기
      const geocoder = new window.google.maps.Geocoder();
      const latLng = new window.google.maps.LatLng(latitude, longitude);

      const geocodingResult = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
            console.log('Geocoding 결과:', results[0]);
          } else {
            reject(new Error('주소를 가져올 수 없습니다.'));
          }
        });
      });

      const locationData = {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        address: simpleAddress(geocodingResult.formatted_address)
      };

      // 부모 컴포넌트에 위치 정보 전달
      onLocationSelect(locationData);

    } catch (err) {
      console.error('위치 가져오기 오류:', err);
      if (err.code === 1) {
        setError('위치 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
      } else if (err.code === 2) {
        setError('위치를 확인할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else if (err.code === 3) {
        setError('위치 요청 시간이 초과되었습니다.');
      } else {
        setError(err.message || '위치 정보를 가져오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="현재 위치 가져오기"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5 text-gray-400 hover:text-blue-500" />
          )}
        </button>
        {/* <div className="flex-1">
          <input
            type="text"
            value={currentAddress || ''}
            onChange={(e) => onLocationSelect({ address: e.target.value })}
            className="w-full bg-transparent border-none outline-none text-sm text-gray-700"
            placeholder="활동 지역을 입력하거나 위치 버튼을 클릭하세요"
          />
        </div> */}
              {/* 에러 메시지 */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* 성공 메시지 */}
      {currentAddress && !error && !loading && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-700">
            <span className="font-medium">현재 위치:</span> {currentAddress}
          </div>
        </div>
      )}
      </div>


    </div>
  );
};

export default LocationPicker;