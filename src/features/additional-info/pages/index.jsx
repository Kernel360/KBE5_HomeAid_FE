import React, { useEffect, useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/api';
import ScheduleSetup from '../components/ScheduleSetup';
import ProfileCompletion from '../components/ProfileCompletion';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useManagerProfileStore } from '../../../stores/managerProfileStore.js';

const ServiceRegistration = () => {
  const navigate = useNavigate();
  const [stepView, setStepView] = useState('step1');
  const [serviceOptions, setServiceOptions] = useState([]);
  const { formData, setFormData } = useManagerProfileStore();

  const handleServiceChange = (serviceId) => {
    setFormData({
      preferenceIds: formData.preferenceIds.includes(serviceId)
        ? formData.preferenceIds.filter((id) => id !== serviceId)
        : [...formData.preferenceIds, serviceId],
    });
    console.log('[서비스선택] preferenceIds:', formData.preferenceIds.includes(serviceId)
      ? formData.preferenceIds.filter((id) => id !== serviceId)
      : [...formData.preferenceIds, serviceId]);
    console.log('[서비스선택] formData:', { ...formData, preferenceIds: formData.preferenceIds.includes(serviceId)
      ? formData.preferenceIds.filter((id) => id !== serviceId)
      : [...formData.preferenceIds, serviceId] });
  };

  const fetchServiceOptions = async () => {
    try {
      const response = await apiService.serviceOption.getAll();
      console.log('서비스 옵션 데이터 가져오기 성공:', response.data);
      setServiceOptions(response.data.data);
    } catch (error) {
      console.error('서비스 옵션 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 ServiceRegistration useEffect 실행됨');
    fetchServiceOptions();
  }, []);

  const ManagerInfo = () => {
    return (
      <div
        className="w-full bg-gray-50 min-h-screen flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}
      >
        <Header showBackButton={true} />

        <main
          className="flex-1"
          style={{ paddingTop: '80px', paddingBottom: '100px' }}
        >
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  서비스 정보 등록
                </h2>
                <p className="text-sm text-gray-600">
                  제공 가능한 서비스 정보를 입력해주세요
                </p>

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
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    제공 가능한 서비스
                  </h2>
                  <div className="space-y-4">
                    {serviceOptions?.map((service) => (
                      <div
                        key={service.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* 상위 서비스 (체크박스) */}
                        <div
                          className={`flex items-center p-4 cursor-pointer transition-colors ${
                            formData.preferenceIds.includes(service.id)
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleServiceChange(service.id)}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                              formData.preferenceIds.includes(service.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {formData.preferenceIds.includes(service.id) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <span
                              className={`text-lg font-medium ${
                                formData.preferenceIds.includes(service.id)
                                  ? 'text-blue-700'
                                  : 'text-gray-800'
                              }`}
                            >
                              {service.name}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        {/* 세부 서비스(features) */}
                        {Array.isArray(service.features) && service.features.length > 0 && (
                          <div className="bg-white border-t border-gray-100">
                            <div className="px-4 py-2">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                세부 서비스
                              </span>
                            </div>
                            <div className="space-y-2 px-4 pb-4">
                              {service.features.map((feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                >
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      {feature}
                                    </span>
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
                <button
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(-1)}
                >
                  이전
                </button>
                <button
                  onClick={() => setStepView('step2')}
                  className="flex-1 py-3 px-4 bg-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  };

  //조건부 렌더링
  switch (stepView) {
    case 'step2':
      console.log('[스텝2 진입] formData:', formData);
      return (
        <div
          className="w-full bg-gray-50 min-h-screen flex flex-col"
          style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}
        >
          <Header showBackButton={true} />
          <main
            className="flex-1"
            style={{ paddingTop: '80px', paddingBottom: '100px' }}
          >
            <ScheduleSetup
              allFormData={formData}
              setAllFormData={setFormData}
              onBack={() => setStepView('step1')}
              nextStep={() => setStepView('step3')}
            />
          </main>
          <Footer />
        </div>
      );
    case 'step3':
      console.log('[스텝3 진입] formData:', formData);
      return (
        <div
          className="w-full bg-gray-50 min-h-screen flex flex-col"
          style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}
        >
          <Header showBackButton={true} />
          <main
            className="flex-1"
            style={{ paddingTop: '80px', paddingBottom: '100px' }}
          >
            <ProfileCompletion
              onBack={() => setStepView('step2')}
              allFormData={formData}
              setAllFormData={setFormData}
            />
          </main>
          <Footer />
        </div>
      );
    default:
      return <ManagerInfo />;
  }
};

export default ServiceRegistration;
