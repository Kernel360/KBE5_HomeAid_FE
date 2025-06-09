import React from 'react';
import { MapPin } from 'lucide-react';
import LocationPicker from './LocationPicker';

const ScheduleSetup = ({ onBack, nextStep, allFormData, setAllFormData }) => {
  // 요일 매핑 (표시용 -> 서버용)
  const dayMapping = {
    '월': 1,
    '화': 2,
    '수': 3,
    '목': 4,
    '금': 5,
    '토': 6,
    '일': 7
  };
  
  // 서버용 -> 표시용 매핑
  const reverseDayMapping = {
    1: '월',
    2: '화',
    3: '수',
    4: '목',
    5: '금',
    6: '토',
    7: '일'
  };
  
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const handleDaySelect = (day) => {
    const dayNumber = dayMapping[day]; // 한글 요일을 숫자로 변환
    setAllFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays?.includes(dayNumber)
        ? prev.availableDays.filter(d => d !== dayNumber)
        : [...(prev.availableDays || []), dayNumber]
    }));
  };

  // 위치 선택 핸들러
  const handleLocationSelect = (locationData) => {
    setAllFormData(prev => ({
      ...prev,
      area: locationData.address,
      latitude: locationData.latitude || prev.latitude,
      longitude: locationData.longitude || prev.longitude
    }));
  };

  const handleTimeChange = (field, value) => {
    setAllFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 현재 선택된 요일과 시간 (allFormData에서 가져오기)
  const availableDays = allFormData.availableDays || [];
  const startTime = allFormData.startTime || '09:00';
  const endTime = allFormData.endTime || '18:00';
  
  // 서버에서 오는 숫자 데이터를 표시용 한글로 변환
  const getDisplayDays = () => {
    return availableDays.map(dayNum => reverseDayMapping[dayNum]).filter(Boolean);
  };
  
  // 단일 요일이 선택되었는지 확인 (한글 요일로 확인)
  const isDaySelected = (day) => {
    const dayNumber = dayMapping[day];
    return availableDays.includes(dayNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">활동 가능 시간대 설정</h1>
          <p className="text-sm text-gray-600">요일별로 활동 가능한 시간을 설정해주세요</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 활동 지역 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">활동 지역</h2>
            <LocationPicker 
              onLocationSelect={handleLocationSelect}
              currentAddress={allFormData.area}
            />
          </div>

          {/* 요일 선택 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">활동 요일</h2>
            <div className="flex gap-2 flex-wrap">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDaySelect(day)}
                  className={`w-12 h-12 rounded-full text-sm font-medium transition-colors ${
                    isDaySelected(day)
                      ? 'bg-blue-600 text-blue-400 hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 공통 시간 설정 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">근무 시간</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2">시작 시간</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-gray-400 mt-6">-</span>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2">종료 시간</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 선택된 요일과 시간 미리보기 */}
          {availableDays.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">선택된 근무 일정</h4>
              <p className="text-sm text-blue-700">
                <span className="font-medium">{getDisplayDays().join(', ')}요일</span>
                <br />
                <span>{startTime} - {endTime}</span>
              </p>
            </div>
          )}
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button 
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
          <button
            onClick={nextStep}
            className="flex-1 py-3 px-4 bg-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSetup;