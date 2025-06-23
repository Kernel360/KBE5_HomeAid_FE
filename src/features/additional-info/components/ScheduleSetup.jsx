import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import LocationPicker from './LocationPicker';
import sidoSggData from '../../../assets/db/korea_sido_sgg.json';
import { useManagerProfileStore } from '../../../stores/managerProfileStore.js';

const dayMapping = {
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
  일: 7,
};
const reverseDayMapping = {
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
  7: '일',
};
const days = ['월', '화', '수', '목', '금', '토', '일'];
const defaultTime = { startTime: '09:00', endTime: '18:00' };

const ScheduleSetup = ({ onBack, nextStep }) => {
  const { formData, setFormData } = useManagerProfileStore();
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSido, setSelectedSido] = useState('');

  const availabilities = formData.availabilities || [];

  // 요일 선택
  const handleDayClick = (weekday) => {
    setSelectedDay(weekday);
    if (!availabilities.find((a) => a.weekday === weekday)) {
      const newAvailabilities = [
        ...availabilities,
        {
          weekday,
          startTime: '09:00',
          endTime: '18:00',
          preferRegions: [],
        },
      ];
      setFormData({ availabilities: newAvailabilities });
    }
  };

  // 시간 변경
  const handleTimeChange = (weekday, field, value) => {
    const newAvailabilities = availabilities.map((a) =>
      a.weekday === weekday ? { ...a, [field]: value } : a
    );
    setFormData({ availabilities: newAvailabilities });
  };

  // 시/도 선택
  const handleSidoChange = (sido) => {
    setSelectedSido(sido);
  };

  // 구/군 체크박스
  const handleSigunguCheck = (weekday, sigungu) => {
    const newAvailabilities = availabilities.map((a) => {
      if (a.weekday !== weekday) return a;
      const exists = a.preferRegions.find(
        (r) => r.sido === selectedSido && r.sigungu === sigungu
      );
      let newRegions;
      if (exists) {
        newRegions = a.preferRegions.filter(
          (r) => !(r.sido === selectedSido && r.sigungu === sigungu)
        );
      } else {
        if (a.preferRegions.length >= 3) return a;
        newRegions = [...a.preferRegions, { sido: selectedSido, sigungu }];
      }
      return { ...a, preferRegions: newRegions };
    });
    setFormData({ availabilities: newAvailabilities });
  };

  // 다음 버튼
  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            활동 가능 요일/시간/지역 설정
          </h2>
          <p className="text-sm text-gray-600">
            요일을 선택하고, 각 요일별로 근무시간과 활동지역을 입력하세요 (지역 최대 3개)
          </p>
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-gray-200 rounded"></div>
          </div>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 활동 요일 선택 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">활동 요일</h2>
            <div className="flex gap-2 flex-wrap">
              {days.map((day) => {
                const dayNumber = dayMapping[day];
                const isSelected = availabilities.some((a) => a.weekday === dayNumber);
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(dayNumber)}
                    className={`w-12 h-12 rounded-full text-sm font-medium transition-colors border ${selectedDay === dayNumber ? 'bg-blue-600 text-white border-blue-600' : isSelected ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택된 요일 상세 설정 */}
          {selectedDay && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-base font-semibold mb-2">{reverseDayMapping[selectedDay]}요일 상세 설정</h3>
              {/* 근무 시간 */}
              <div className="flex gap-4 items-center mb-4">
                <label className="text-sm">시작</label>
                <select
                  value={availabilities.find((a) => a.weekday === selectedDay)?.startTime || '09:00'}
                  onChange={(e) => handleTimeChange(selectedDay, 'startTime', e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
                <label className="text-sm">종료</label>
                <select
                  value={availabilities.find((a) => a.weekday === selectedDay)?.endTime || '18:00'}
                  onChange={(e) => handleTimeChange(selectedDay, 'endTime', e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* 활동 지역 */}
              <div className="mb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.keys(sidoSggData).map((sido) => (
                    <button
                      key={sido}
                      onClick={() => handleSidoChange(sido)}
                      className={`px-3 py-2 rounded border ${selectedSido === sido ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                      type="button"
                    >
                      {sido}
                    </button>
                  ))}
                </div>
                {selectedSido && (
                  <div className="flex flex-wrap gap-2">
                    {sidoSggData[selectedSido].map((sigungu) => {
                      const preferRegions = availabilities.find((a) => a.weekday === selectedDay)?.preferRegions || [];
                      const checked = preferRegions.some(
                        (r) => r.sido === selectedSido && r.sigungu === sigungu
                      );
                      const disabled =
                        !checked && preferRegions.length >= 3;
                      return (
                        <label key={sigungu} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => handleSigunguCheck(selectedDay, sigungu)}
                          />
                          <span>{sigungu}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div className="mt-2 text-xs text-blue-700">
                  {availabilities.find((a) => a.weekday === selectedDay)?.preferRegions.length > 0
                    ? `선택: ${availabilities
                        .find((a) => a.weekday === selectedDay)
                        .preferRegions.map((r) => `${r.sido} ${r.sigungu}`)
                        .join(', ')}`
                    : '최대 3개까지 선택 가능'}
                </div>
              </div>
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
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSetup;
