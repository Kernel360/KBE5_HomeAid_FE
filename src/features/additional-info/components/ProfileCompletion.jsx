import React, { useState, useEffect } from 'react';
import { apiService } from '@/api';
import { useNavigate } from 'react-router-dom';
import { useManagerProfileStore } from '../../../stores/managerProfileStore.js';

const ProfileCompletion = ({ onBack }) => {
  const { formData } = useManagerProfileStore();
  const [serviceOptions, setServiceOptions] = useState([]);
  const navigate = useNavigate();

  const reverseDayMapping = {
    1: '월',
    2: '화',
    3: '수',
    4: '목',
    5: '금',
    6: '토',
    7: '일',
  };

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

  // 요약 정보 동적 생성
  const allRegions = formData.availabilities?.flatMap(
    (a) => a.preferRegions || []
  );
  const uniqueRegions = Array.from(
    new Set(allRegions.map((r) => `${r.sido} ${r.sigungu}`))
  );

  function validateFormData() {
    const firstAvailability = formData.availabilities?.[0] || {};
    const { startTime, endTime, weekday, preferRegions } = firstAvailability;
    const preferenceIds = formData.preferenceIds || [];

    console.log(preferenceIds);
    console.log(startTime, endTime);
    console.log(weekday, preferRegions);

    console.log('[유효성검사] formData:', formData);
    if (!preferenceIds || preferenceIds.length === 0) {
      alert('제공 가능 서비스 선택해주세요.');
      throw new Error('제공 가능 서비스를 선택해주세요.');
    }
    if (!weekday) {
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
    if (!preferRegions || preferRegions.length === 0) {
      alert('활동 지역을 1개 이상 선택해주세요.');
      throw new Error('활동 지역을 1개 이상 선택해주세요.');
    }
    console.log('[유효성검사 통과] formData:', formData);
    return true;
  }

  function showAlert(msg) {
    return new Promise((resolve) => {
      window.alert(msg);
      resolve();
    });
  }

  const handleSubmit = async () => {
    if (!validateFormData()) {
      console.error('폼 데이터 유효성 검사 실패');
      return;
    }
    console.log('[서버전송 직전] 최종 formData:', formData);
    try {
      const response = await apiService.manager.createProfile(formData);
      console.log('프로필 등록 성공:', response);
      await showAlert('등록되었습니다!');
      navigate('/manager/mypage');
    } catch (error) {
      console.error('프로필 등록 실패:', error);
    }
    console.log('폼 데이터 유효성 검사 통과');
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
          {/* 입력된 정보 요약 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-800 mb-4">
              입력된 정보 요약
            </h4>

            <div className="space-y-4">
              {/* 제공 서비스 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-medium text-gray-700">
                    제공 서비스
                  </span>
                  <span className="text-sm text-gray-500">
                    {getSelectedServiceNames().length}개
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getSelectedServiceNames().map((serviceName, index) => (
                    <span
                      key={index}
                      className="text-sm bg-white px-2 py-1 rounded text-gray-600 border"
                    >
                      {serviceName}
                    </span>
                  ))}
                </div>
              </div>

              {/* 활동 지역 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-medium text-gray-700">
                    활동 지역
                  </span>
                  <span className="text-sm text-gray-500">
                    {uniqueRegions.length}곳
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {uniqueRegions.map((region, index) => (
                    <span
                      key={index}
                      className="text-sm bg-white px-2 py-1 rounded text-gray-600 border"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {/* 근무 일정 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-medium text-gray-700">
                    근무 일정
                  </span>
                  <span className="text-sm text-gray-500">
                    {formData.availabilities?.length || 0}일
                  </span>
                </div>
                <div className="space-y-1">
                  {formData.availabilities?.map((availability, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm bg-white px-2 py-1 rounded border"
                    >
                      <span className="text-gray-700">
                        {reverseDayMapping[availability.weekday]}요일
                      </span>
                      <span className="text-gray-500">
                        {availability.startTime} ~ {availability.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            등록 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
