import React from 'react';
import { apiService } from '../../../store/api';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line no-unused-vars
const ProfileCompletion = ({ onBack, allFormData, setAllFormData }) => {
  const navigate = useNavigate();

  function validateFormData() {
    const { preferenceIds, area, availableDays, startTime, endTime } =
      allFormData;
    if (!preferenceIds || preferenceIds.length === 0) {
      alert('제공 가능 서비스 선택해주세요.');
      throw new Error('제공 가능 서비스를 선택해주세요.');
    }
    if (!area) {
      alert('활동 지역을 선택해주세요.');
      throw new Error('활동 지역을 선택해주세요.');
    }
    if (!availableDays || availableDays.length === 0) {
      alert('근무 요일을 선택해주세요.');
      throw new Error('근무 요일을 선택해주세요.');
    }
    if (!startTime || !endTime) {
      alert('근무 시간을 설정해주세요.');
      throw new Error('근무 시간을 설정해주세요.');
    }
    if (startTime >= endTime) {
      alert('근무 시작 시간이 종료 시간보다 늦을 수 없습니다.');
      throw new Error('근무 시작 시간이 종료 시간보다 늦을 수 없습니다.');
    }
    console.log('폼 데이터 유효성 검사 통과');
    return true;
  }

  const handleSubmit = () => {
    if (!validateFormData()) {
      console.error('폼 데이터 유효성 검사 실패');
      return;
    }
    console.log('🎯 최종 전체 데이터:', allFormData);
    apiService.serviceOption
      .create(allFormData)
      .then((response) => {
        console.log('프로필 등록 성공:', response);
        navigate('/manager/mypage');
      })
      .catch((error) => {
        console.error('프로필 등록 실패:', error);
      });
    console.log('폼 데이터 유효성 검사 통과');
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

  const getDisplayDays = () => {
    return allFormData.availableDays
      .map((dayNum) => reverseDayMapping[dayNum])
      .filter(Boolean);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">프로필 완성</h2>
          <p className="text-sm text-gray-600">
            고객에게 보여질 프로필을 완성해주세요
          </p>

          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              입력된 정보 요약
            </h4>
            <p className="text-xs text-blue-700">
              제공 서비스: {allFormData.preferenceIds?.length || 0}개<br />
              활동 지역: {allFormData.area}
              <br />
              근무 요일: {getDisplayDays().join(', ') || '없음'}요일
              <br />
              근무 시간: {allFormData.startTime} - {allFormData.endTime}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            등록 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
