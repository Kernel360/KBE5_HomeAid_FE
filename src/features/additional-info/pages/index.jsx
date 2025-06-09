import React, { useEffect, useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../store/api';
import ScheduleSetup from '../components/ScheduleSetup';
import ProfileCompletion from '../components/ProfileCompletion';

const ServiceRegistration = () => {
  const [stepView, setStepView] = useState('step1');
  const [serviceOptions, setServiceOptions] = useState([]);
  const [allFormData, setAllFormData] = useState({
      // Step 1
      experience: '',
      preferenceIds: [],
      latitude: null,
      longitude: null,
      // Step 2 (이동된 데이터)
      area: '',
      availableDays: [1],
      startTime: '09:00',
      endTime: '18:00',
      // Step 3
      profileImage: null,
      specialties: '',
  });

  const handleServiceChange = (serviceId) => {
    setAllFormData(prev => ({
      ...prev,
      preferenceIds: prev.preferenceIds.includes(serviceId)
        ? prev.preferenceIds.filter(id => id !== serviceId)
        : [...prev.preferenceIds, serviceId]
    }));
  };

  const fetchServiceOptions = async () => {
    try {
      const response = await apiService.serviceOption.getAll();
      console.log("서비스 옵션 데이터 가져오기 성공:", response.data);
      setServiceOptions(response.data.data);
    } catch (error) {
      console.error("서비스 옵션 데이터 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    console.log("🔍 ServiceRegistration useEffect 실행됨");
    fetchServiceOptions();
  }, []);

  const ManagerInfo = () => {
    return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">서비스 정보 등록</h1>
          <p className="text-sm text-gray-600">제공 가능한 서비스 정보를 입력해주세요</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-gray-200 rounded"></div>
            <div className="flex-1 h-1 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* 경력 사항 */}
          {/* <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">경력 사항</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <textarea
                value={allFormData.experience}
                onChange={(e) => setAllFormData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="청소 관련 경력 3년, 호텔 하우스키핑 2년 근무"
                className="w-full h-20 bg-transparent border-none outline-none resize-none text-sm text-gray-700 placeholder-gray-500"
              />
            </div>
          </div> */}

          {/* 제공 가능한 서비스 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">제공 가능한 서비스</h2>
            <div className="space-y-4">
              {serviceOptions?.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 상위 서비스 (체크박스) */}
                  <div
                    className={`flex items-center p-4 cursor-pointer transition-colors ${
                      allFormData.preferenceIds.includes(service.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleServiceChange(service.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                      allFormData.preferenceIds.includes(service.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {allFormData.preferenceIds.includes(service.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-lg font-medium ${
                        allFormData.preferenceIds.includes(service.id) ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {service.name}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                  </div>
                  
                  {/* 하위 옵션들 (표시만) */}
                  {service.subOptions.length > 0 && (
                    <div className="bg-white border-t border-gray-100">
                      <div className="px-4 py-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          세부 서비스
                        </span>
                      </div>
                      <div className="space-y-2 px-4 pb-4">
                        {service.subOptions.map((subOption) => (
                          <div
                            key={subOption.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">
                                {subOption.name}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {subOption.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium text-gray-800">
                                {subOption.basePrice.toLocaleString()}원
                              </div>
                              <div className="text-xs text-gray-500">
                                {subOption.durationMinutes}분
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          {/* <button className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            onClick ={() => navigate(-1)}>
            이전
          </button> */}
          <button
            onClick={() => setStepView('step2')}
            className="flex-1 py-3 px-4 bg-blue-600 text-blue-600 border-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
    );
  }

      //조건부 렌더링
    switch (stepView) {
        case 'step2':
            return <ScheduleSetup
            allFormData={allFormData}
            setAllFormData={setAllFormData}
            onBack={() => setStepView('step1')}
            nextStep={() => setStepView('step3')} />;
        case 'step3':
            return <ProfileCompletion 
            onBack={() => setStepView('step2')}
            allFormData={allFormData}
            setAllFormData={setAllFormData}  />;
        default:
            return <ManagerInfo />;
    }
  
};

export default ServiceRegistration;