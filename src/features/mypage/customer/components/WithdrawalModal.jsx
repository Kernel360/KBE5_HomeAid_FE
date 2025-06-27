import React, { useState } from 'react';
import { X } from 'lucide-react';

const WithdrawalModal = ({ isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState(1); // 1: 이유선택, 2: 필수의견, 3: 첫번째확인, 4: 최종확인, 5: 완료안내
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withdrawalReasons = [
    '서비스를 더 이상 사용하지 않음',
    '서비스에 불만이 있음',
    '개인정보 보호를 위해',
    '다른 서비스를 이용하기 위해',
    '기타',
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!selectedReason) {
        alert('탈퇴 이유를 선택해주세요.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!additionalFeedback.trim()) {
        alert('탈퇴 사유에 대한 의견을 작성해주세요.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      const reason =
        selectedReason === '기타' && additionalFeedback.trim()
          ? additionalFeedback.trim()
          : selectedReason;

      await onConfirm(reason);
      setStep(5); // 완료 안내 화면으로 이동
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 5) {
      // 완료 단계에서는 모달을 닫지 않고 처리만 완료
      return;
    }
    setStep(1);
    setSelectedReason('');
    setAdditionalFeedback('');
    onClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return '회원 탈퇴 - 이유 선택';
      case 2:
        return '회원 탈퇴 - 의견 작성';
      case 3:
        return '회원 탈퇴 - 확인';
      case 4:
        return '회원 탈퇴 - 최종 확인';
      case 5:
        return '탈퇴 신청 완료';
      default:
        return '회원 탈퇴';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {getStepTitle()}
          </h2>
          {step !== 5 && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            // Step 1: 이유 선택
            <div>
              <p className="text-sm text-gray-600 mb-4">
                탈퇴하시는 이유를 알려주시면 더 나은 서비스 개선에 도움이
                됩니다.
              </p>

              <div className="space-y-3 mb-6">
                {withdrawalReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="withdrawalReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700"
                >
                  취소
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            // Step 2: 필수 의견 작성
            <div>
              <p className="text-sm text-gray-600 mb-4">
                탈퇴 사유에 대한 자세한 의견을 작성해주세요. (필수)
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선택하신 탈퇴 이유:{' '}
                  <span className="text-red-600">{selectedReason}</span>
                </label>
                <textarea
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  placeholder="불편했던 점이나 개선 의견을 자세히 작성해주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  * 회원님의 소중한 의견은 서비스 개선에 반영됩니다.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            // Step 3: 첫 번째 확인
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  정말 탈퇴하시겠습니까?
                </h3>
                <p className="text-sm text-gray-600">
                  탈퇴 신청 후에는 되돌릴 수 없습니다.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  탈퇴 시 삭제되는 정보:
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 개인정보 및 프로필 정보</li>
                  <li>• 서비스 이용 기록</li>
                  <li>• 예약 내역 및 결제 정보</li>
                  <li>• 작성한 리뷰 및 평점</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            // Step 4: 최종 확인
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  정말로 탈퇴하시겠습니까?
                </h3>
                <p className="text-sm text-red-600 font-medium">
                  이 작업은 되돌릴 수 없습니다!
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-red-800 mb-2">⚠️ 최종 경고</h4>
                <p className="text-sm text-red-700">
                  탈퇴 신청 후 동일한 핸드폰번호로 재가입이 제한될 수 있습니다.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '처리 중...' : '탈퇴 신청'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            // Step 5: 완료 안내
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  탈퇴 신청이 완료되었습니다
                </h3>
                <p className="text-sm text-gray-600">
                  관리자 검토 후 2~5일 내에 처리됩니다.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-blue-800 mb-2">📋 처리 안내</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 관리자가 신청 내용을 검토합니다</li>
                  <li>• 2~5일 내에 탈퇴 처리가 완료됩니다</li>
                  <li>• 처리 완료 시 등록된 이메일로 알림이 발송됩니다</li>
                  <li>• 이 기간 동안 서비스 이용이 제한됩니다</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  그동안 저희 서비스를 이용해주셔서 감사했습니다.
                </p>
                <button
                  onClick={() => (window.location.href = '/auth/signin')}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
