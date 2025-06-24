import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import LocationPicker from './LocationPicker';
import sidoSggData from '../../../assets/db/korea_sido_sgg.json';
import { useManagerProfileStore } from '../../../stores/managerProfileStore.js';
import { apiService } from '../../../api/index.js';

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

const ScheduleSetup = ({ onBack, nextStep }) => {
  const { formData, setFormData } = useManagerProfileStore();
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSido, setSelectedSido] = useState('');
  const [serviceOptions, setServiceOptions] = useState([]);

  const availabilities = formData.availabilities || [];

  // 서비스 옵션 데이터 가져오기
  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const response = await apiService.serviceOption.getAll();
        setServiceOptions(response.data.data || []);
      } catch (error) {
        console.error('서비스 옵션 데이터 가져오기 실패:', error);
      }
    };
    fetchServiceOptions();
  }, []);

  // 선택된 서비스 이름들 가져오기
  const getSelectedServiceNames = () => {
    if (!formData.preferenceIds || formData.preferenceIds.length === 0) {
      return [];
    }

    return formData.preferenceIds.map((id) => {
      const service = serviceOptions.find((option) => option.id === id);
      return service ? service.name : `서비스 ${id}`;
    });
  };

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
      console.log('[요일추가] availabilities:', newAvailabilities);
      console.log('[요일추가] formData:', {
        ...formData,
        availabilities: newAvailabilities,
      });
    }
  };

  // 시간 변경
  const handleTimeChange = (weekday, field, value) => {
    const newAvailabilities = availabilities.map((a) =>
      a.weekday === weekday ? { ...a, [field]: value } : a
    );
    setFormData({ availabilities: newAvailabilities });
    console.log(`[시간변경] ${weekday} ${field} -> ${value}`);
    console.log('[시간변경] availabilities:', newAvailabilities);
    console.log('[시간변경] formData:', {
      ...formData,
      availabilities: newAvailabilities,
    });
  };

  // 시/도 선택
  const handleSidoChange = (sido) => {
    setSelectedSido(sido);

    // 시/도가 변경되면 기존에 선택된 해당 시/도의 구/군들을 초기화
    if (selectedDay && sido !== selectedSido) {
      const newAvailabilities = availabilities.map((a) => {
        if (a.weekday !== selectedDay) return a;
        // 기존 시/도와 다른 지역들만 유지
        const filteredRegions = a.preferRegions.filter(
          (r) => r.sido !== selectedSido
        );
        return { ...a, preferRegions: filteredRegions };
      });
      setFormData({ availabilities: newAvailabilities });
    }

    console.log('[시/도선택] selectedSido:', sido);
  };

  // 선택된 지역 제거
  const handleRemoveRegion = (weekday, sido, sigungu) => {
    const newAvailabilities = availabilities.map((a) => {
      if (a.weekday !== weekday) return a;
      const newRegions = a.preferRegions.filter(
        (r) => !(r.sido === sido && r.sigungu === sigungu)
      );
      return { ...a, preferRegions: newRegions };
    });
    setFormData({ availabilities: newAvailabilities });
    console.log(`[지역제거] ${weekday} ${sido} ${sigungu}`);
  };

  // 요일 설정 삭제
  const handleRemoveDay = (weekday) => {
    const newAvailabilities = availabilities.filter(
      (a) => a.weekday !== weekday
    );
    setFormData({ availabilities: newAvailabilities });

    // 삭제된 요일이 현재 선택된 요일이면 선택 해제
    if (selectedDay === weekday) {
      setSelectedDay(null);
    }

    console.log(`[요일삭제] ${weekday} 요일 설정이 삭제되었습니다.`);
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
    console.log(`[구/군체크] ${weekday} ${selectedSido} ${sigungu}`);
    console.log('[구/군체크] availabilities:', newAvailabilities);
    console.log('[구/군체크] formData:', {
      ...formData,
      availabilities: newAvailabilities,
    });
  };

  // 다음 버튼
  const handleNext = () => {
    // 유효성 검사: 모든 요일에 활동지역이 선택되었는지 확인
    const daysWithoutRegions = availabilities.filter(
      (availability) =>
        !availability.preferRegions || availability.preferRegions.length === 0
    );

    if (daysWithoutRegions.length > 0) {
      const dayNames = daysWithoutRegions
        .map((availability) => reverseDayMapping[availability.weekday])
        .join(', ');

      alert(`다음 요일의 활동지역을 선택해주세요: ${dayNames}요일`);
      return;
    }

    // 최소 하나의 요일은 설정되어야 함
    if (availabilities.length === 0) {
      alert('최소 하나의 요일을 선택하고 활동지역을 설정해주세요.');
      return;
    }

    console.log('[다음버튼] 최종 formData:', formData);
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
            요일을 선택하고, 각 요일별로 근무시간과 활동지역을 입력하세요 (지역
            최대 3개)
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              활동 요일
            </h2>
            <div className="flex gap-2 flex-wrap">
              {days.map((day) => {
                const dayNumber = dayMapping[day];
                const isSelected = availabilities.some(
                  (a) => a.weekday === dayNumber
                );
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
            <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50/30">
              <h3 className="text-base font-semibold mb-4 text-blue-800">
                {reverseDayMapping[selectedDay]}요일 상세 설정
              </h3>

              {/* 근무 시간 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  근무 시간
                </h4>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      시작 시간
                    </label>
                    <select
                      value={
                        availabilities.find((a) => a.weekday === selectedDay)
                          ?.startTime || '09:00'
                      }
                      onChange={(e) =>
                        handleTimeChange(
                          selectedDay,
                          'startTime',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="text-gray-400 mt-6">~</div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      종료 시간
                    </label>
                    <select
                      value={
                        availabilities.find((a) => a.weekday === selectedDay)
                          ?.endTime || '18:00'
                      }
                      onChange={(e) =>
                        handleTimeChange(selectedDay, 'endTime', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                </div>
              </div>
              {/* 활동 지역 */}
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  활동 지역 선택
                </h4>

                {/* 시/도 선택 드롭다운 */}
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    시/도
                  </label>
                  <select
                    value={selectedSido}
                    onChange={(e) => handleSidoChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">시/도를 선택하세요</option>
                    {Object.keys(sidoSggData).map((sido) => (
                      <option key={sido} value={sido}>
                        {sido}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 구/군 선택 체크박스 */}
                {selectedSido && (
                  <div className="mb-3">
                    <label className="block text-sm text-gray-600 mb-2">
                      구/군 ({selectedSido})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {sidoSggData[selectedSido].map((sigungu) => {
                        const preferRegions =
                          availabilities.find((a) => a.weekday === selectedDay)
                            ?.preferRegions || [];
                        const checked = preferRegions.some(
                          (r) =>
                            r.sido === selectedSido && r.sigungu === sigungu
                        );
                        const disabled = !checked && preferRegions.length >= 3;

                        return (
                          <label
                            key={sigungu}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                              checked
                                ? 'bg-blue-100 text-blue-700'
                                : disabled
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() =>
                                handleSigunguCheck(selectedDay, sigungu)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{sigungu}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 선택된 지역 표시 */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 mb-2">
                    <strong>
                      선택된 지역 (
                      {availabilities.find((a) => a.weekday === selectedDay)
                        ?.preferRegions.length || 0}
                      /3)
                    </strong>
                  </div>

                  {/* 선택된 지역 태그들 */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(
                      availabilities.find((a) => a.weekday === selectedDay)
                        ?.preferRegions || []
                    ).map((region, index) => (
                      <div
                        key={`${region.sido}-${region.sigungu}-${index}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                      >
                        <span>
                          {region.sido} {region.sigungu}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveRegion(
                              selectedDay,
                              region.sido,
                              region.sigungu
                            )
                          }
                          className="ml-1 text-blue-500 hover:text-blue-700 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          title="지역 제거"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 안내 메시지 */}
                  <div className="text-xs text-blue-600">
                    {availabilities.find((a) => a.weekday === selectedDay)
                      ?.preferRegions.length > 0
                      ? '지역을 클릭하여 제거할 수 있습니다.'
                      : '지역을 선택해주세요 (최대 3개)'}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 설정 요약 정보 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              설정 현황
            </h4>

            <div className="space-y-2 text-sm">
              {/* 제공 서비스 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">제공 서비스</span>
                  <span className="font-medium text-gray-800">
                    {getSelectedServiceNames().length}개
                  </span>
                </div>
                {getSelectedServiceNames().length > 0 && (
                  <div className="ml-4 space-y-1">
                    {getSelectedServiceNames().map((serviceName, index) => (
                      <div
                        key={index}
                        className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                      >
                        • {serviceName}
                      </div>
                    ))}
                  </div>
                )}
                {getSelectedServiceNames().length === 0 && (
                  <div className="ml-4 text-xs text-gray-400">미설정</div>
                )}
              </div>

              {/* 요일별 설정 */}
              {availabilities.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-gray-600 text-xs font-medium border-b border-gray-200 pb-1">
                    요일별 설정
                  </div>
                  {availabilities.map((availability, index) => {
                    const hasRegions =
                      availability.preferRegions &&
                      availability.preferRegions.length > 0;

                    return (
                      <div
                        key={index}
                        className={`bg-white p-2 rounded border relative ${
                          hasRegions
                            ? 'border-gray-100'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-medium text-sm ${
                              hasRegions ? 'text-blue-700' : 'text-red-600'
                            }`}
                          >
                            {reverseDayMapping[availability.weekday]}요일
                            {!hasRegions && (
                              <span className="ml-1 text-xs text-red-500">
                                ⚠️
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {availability.startTime} ~ {availability.endTime}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveDay(availability.weekday)
                              }
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                              title="요일 설정 삭제"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="text-gray-500">활동지역: </span>
                          {hasRegions ? (
                            availability.preferRegions
                              .map((r) => `${r.sido} ${r.sigungu}`)
                              .join(', ')
                          ) : (
                            <span className="text-red-500 font-medium">
                              ⚠️ 지역을 선택해주세요
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-3 text-gray-400 text-sm">
                  요일을 선택해주세요
                </div>
              )}
            </div>

            {/* 완료도 표시 */}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">완료도</span>
                <span className="font-medium text-blue-600">
                  {(() => {
                    let completed = 0;
                    if (getSelectedServiceNames().length > 0) completed++;
                    if (availabilities.length > 0) completed++;
                    if (
                      availabilities.length > 0 &&
                      availabilities[0].startTime &&
                      availabilities[0].endTime
                    )
                      completed++;
                    if (
                      availabilities.length > 0 &&
                      availabilities[0].preferRegions?.length > 0
                    )
                      completed++;
                    return `${completed}/4`;
                  })()}
                </span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${(() => {
                      let completed = 0;
                      if (getSelectedServiceNames().length > 0) completed++;
                      if (availabilities.length > 0) completed++;
                      if (
                        availabilities.length > 0 &&
                        availabilities[0].startTime &&
                        availabilities[0].endTime
                      )
                        completed++;
                      if (
                        availabilities.length > 0 &&
                        availabilities[0].preferRegions?.length > 0
                      )
                        completed++;
                      return (completed / 4) * 100;
                    })()}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
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
