import React from 'react';
import { MapPin } from 'lucide-react';

const ScheduleSetup = ({ onBack, nextStep, allFormData, setAllFormData }) => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const handleDaySelect = (day) => {
    setAllFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays?.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...(prev.availableDays || []), day]
    }));
  };

  const handleTimeChange = (field, value) => {
    setAllFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
  };

  // 현재 선택된 요일과 시간 (allFormData에서 가져오기)
  const availableDays = allFormData.availableDays || [];
  const workingHours = allFormData.workingHours || { startTTimeTime: '09:00', endTimeTime: '18:00' };

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
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                value={allFormData.area || ''}
                onChange={(e) => setAllFormData(prev => ({ ...prev, area: e.target.value }))}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
                placeholder="활동 지역을 입력하세요"
              />
            </div>
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
                    availableDays.includes(day)
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
                  value={workingHours.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-gray-400 mt-6">-</span>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2">종료 시간</label>
                <input
                  type="time"
                  value={workingHours.endTime}
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
                <span className="font-medium">{availableDays.join(', ')}요일</span>
                <br />
                <span>{workingHours.startTime} - {workingHours.endTime}</span>
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