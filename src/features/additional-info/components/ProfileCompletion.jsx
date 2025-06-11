import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { apiService } from '../../../store/api';
import { useNavigate } from 'react-router-dom';

const ProfileCompletion = ({ onBack, allFormData, setAllFormData }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAllFormData(prev => ({ ...prev, profileImage: file })); // ✅ allFormData 업데이트

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field, value) => {
    setAllFormData(prev => ({ ...prev, [field]: value })); // ✅ allFormData 업데이트
    console.log(`입력 변경: ${field} = ${value}`); // ✅ 입력 변경 로그
    console.log('현재 전체 데이터:', allFormData); // ✅ 현재 전체 데이터 출력
  };

  function validateFormData() {
    const { preferenceIds, area, availableDays, startTime, endTime } = allFormData;
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
    console.log('폼 데이터 유효성 검사 통과'); // ✅ 유효성 검사 통과 로그
    return true; // 유효성 검사 통과
  }

  const handleSubmit = () => {
    if (!validateFormData()) {
      console.error('폼 데이터 유효성 검사 실패'); // ✅ 유효성 검사 실패 로그
      return; // 유효성 검사 실패 시 종료
    } // ✅ 폼 데이터 유효성 검사
    console.log('🎯 최종 전체 데이터:', allFormData); // ✅ 전체 데이터 출력
    // API 호출 로직
    apiService.serviceOption.create(allFormData)
      .then(response => {
        console.log('프로필 등록 성공:', response);
        navigate('/manager/mypage');
        // 성공 후 처리 로직 (예: 다음 페이지로 이동)
      })
      .catch(error => {
        console.error('프로필 등록 실패:', error);
        // 에러 처리 로직
      });
    // 완료 후 이전 단계로 돌아가기
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

    // 서버에서 오는 숫자 데이터를 표시용 한글로 변환
  const getDisplayDays = () => {
    return allFormData.availableDays.map(dayNum => reverseDayMapping[dayNum]).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">프로필 완성</h1>
          <p className="text-sm text-gray-600">고객에게 보여질 프로필을 완성해주세요</p>

          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
            <div className="flex-1 h-1 bg-blue-500 rounded"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Image */}
          {/* <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">프로필 사진</h2>
            <div className="flex items-center gap-4">
              <div
                onClick={handleImageClick}
                className="relative w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <button
                onClick={handleImageClick}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                사진 업로드
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div> */}

          {/* Introduction */}
          {/* <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">자기소개</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <textarea
                value={allFormData.introduction} // ✅ allFormData 사용
                onChange={(e) => handleInputChange('introduction', e.target.value)}
                placeholder="자기소개를 입력해주세요"
                rows={6}
                className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 placeholder-gray-500 leading-relaxed"
              />
            </div>
          </div> */}

          {/* Specialties */}
          {/* <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">특기 사항</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <textarea
                value={allFormData.specialties} // ✅ allFormData 사용
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="특기나 전문 분야를 입력해주세요"
                rows={3}
                className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 placeholder-gray-500"
              />
            </div>
          </div> */}

          {/* 이전 단계 데이터 미리보기 (선택사항) */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">입력된 정보 요약</h4>
            <p className="text-xs text-blue-700">
              제공 서비스: {allFormData.preferenceIds?.length || 0}개<br />
              활동 지역: {allFormData.area}<br />
              근무 요일: {getDisplayDays().join(', ') || '없음'}요일<br />
              근무 시간: {allFormData.startTime} - {allFormData.endTime}
            </p>
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
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors" // ✅ text-white로 수정
          >
            등록 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;