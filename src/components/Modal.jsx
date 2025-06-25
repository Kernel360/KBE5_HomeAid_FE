import React, { useEffect } from 'react';

/**
 * props:
 * - open: boolean (모달 열림 여부)
 * - title: string (제목)
 * - message: string (본문)
 * - onClose: function (닫기 콜백)
 * - onConfirm: function (확인 콜백, 있으면 확인 버튼 노출)
 * - confirmText: string (확인 버튼 텍스트)
 * - cancelText: string (취소 버튼 텍스트)
 * - showCancel: boolean (취소 버튼 노출 여부)
 * - children: ReactNode (커스텀 내용)
 */
const Modal = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
  showCancel = false,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    // ESC 키로 닫기
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,37,41,0.18)] transition-opacity duration-300 animate-fadeIn"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-xs w-full mx-4 p-7 relative animate-modalPop border border-gray-100"
        style={{ minWidth: 280 }}
        onClick={e => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          aria-label="닫기"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        {/* 제목 */}
        {title && (
          <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ lineHeight: 1.3 }}>{title}</h3>
        )}
        {/* 본문 */}
        {message && (
          <div className="text-base text-gray-700 mb-6 whitespace-pre-line" style={{ lineHeight: 1.6 }}>{message}</div>
        )}
        {/* 커스텀 내용 */}
        {children}
        {/* 버튼 영역 */}
        <div className={`flex ${showCancel ? 'justify-between' : 'justify-center'} gap-3 mt-2`}>
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 min-h-[40px] px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="flex-1 min-h-[40px] px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.25s; }
        @keyframes modalPop { from { transform: translateY(40px) scale(0.98); opacity: 0; } to { transform: none; opacity: 1; } }
        .animate-modalPop { animation: modalPop 0.25s cubic-bezier(.4,1.6,.6,1) }
      `}</style>
    </div>
  );
};

export default Modal; 