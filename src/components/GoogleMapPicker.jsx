import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
};

// 기본 중심점 (서울시청)
const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
};

const GoogleMapPicker = ({ onLocationSelect, selectedLocation }) => {
  const [marker, setMarker] = useState(selectedLocation || null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const onLoad = useCallback(() => {
    // 지도 로드 완료
  }, []);

  const onUnmount = useCallback(() => {
    // 지도 언마운트
  }, []);

  // 위치 선택 처리 (지도 클릭과 현재 위치에서 공통 사용)
  const handleLocationSelect = useCallback(
    async (lat, lng, source = 'map') => {
      const newLocation = { lat, lng };
      setMarker(newLocation);

      // 기본 주소 (좌표 기반)
      const defaultAddress = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;

      // Reverse Geocoding 시도 (실패해도 좌표로 진행)
      try {
        const address = await reverseGeocode(lat, lng);
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: newLocation,
            address: address?.formattedAddress || defaultAddress,
            source, // 'map' 또는 'current_location'
          });
        }
      } catch {
        // Geocoding 실패해도 좌표 정보로 계속 진행
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: newLocation,
            address: defaultAddress,
            source,
          });
        }
      }
    },
    [onLocationSelect]
  );

  // 지도 클릭 이벤트 처리
  const handleMapClick = useCallback(
    async (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      await handleLocationSelect(lat, lng, 'map');
    },
    [handleLocationSelect]
  );

  // 현재 위치 사용하기 버튼 클릭 이벤트
  const handleCurrentLocationClick = useCallback(() => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await handleLocationSelect(latitude, longitude, 'current_location');
          setIsGettingLocation(false);
        },
        (error) => {
          setIsGettingLocation(false);
          console.error('위치 정보를 가져올 수 없습니다:', error);

          let errorMessage = '';
          let solution = '';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 접근 권한이 거부되었습니다.';
              solution =
                '브라우저 주소창 옆의 위치 아이콘을 클릭하거나, 브라우저 설정에서 위치 권한을 허용해주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              solution =
                'WiFi를 켜거나 GPS 신호가 좋은 곳으로 이동해주세요. 또는 시스템 설정에서 위치 서비스를 활성화해주세요.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청이 시간 초과되었습니다.';
              solution =
                '잠시 후 다시 시도하거나 지도에서 직접 위치를 선택해주세요.';
              break;
            default:
              errorMessage = '알 수 없는 오류가 발생했습니다.';
              solution = '지도에서 직접 위치를 선택해주세요.';
          }

          alert(`${errorMessage}\n\n해결방법: ${solution}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        }
      );
    } else {
      alert(
        '이 브라우저는 위치 정보를 지원하지 않습니다. 지도에서 직접 위치를 선택해주세요.'
      );
    }
  }, [handleLocationSelect]);

  // Reverse Geocoding 함수
  const reverseGeocode = async (latitude, longitude) => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn(
        'Google Maps API 키가 설정되지 않았습니다. 좌표만 사용합니다.'
      );
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=ko`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          formattedAddress: result.formatted_address,
          addressComponents: result.address_components,
          latitude,
          longitude,
        };
      } else {
        console.error('Geocoding API 오류:', data.status);
        if (data.error_message) {
          console.error('오류 상세:', data.error_message);
        }
        return null;
      }
    } catch (error) {
      console.error('Reverse Geocoding 실패:', error);
      return null;
    }
  };

  if (!isLoaded) {
    return (
      <div style={containerStyle} className="google-map-loading">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: '#f5f5f5',
            color: '#666',
          }}
        >
          지도를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {/* 현재 위치 사용하기 버튼 */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleCurrentLocationClick}
          disabled={isGettingLocation}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: isGettingLocation ? '#ccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isGettingLocation ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isGettingLocation ? (
            <>⏳ 현재 위치를 가져오는 중...</>
          ) : (
            <>📍 현재 위치 사용하기</>
          )}
        </button>
      </div>

      {/* 지도 안내 텍스트 */}
      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
        💡 지도를 클릭하면 해당 위치가 선택됩니다
      </div>

      {/* 구글 맵 */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {marker && (
          <Marker
            position={marker}
            animation={window.google?.maps?.Animation?.BOUNCE}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapPicker;
