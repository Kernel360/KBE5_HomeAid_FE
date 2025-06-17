import React from 'react';

/**
 * 페이지네이션 컴포넌트
 * 순수 컴포넌트로 페이지 상태는 부모에서 관리
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="pagination-button"
      >
        이전
      </button>
      <span className="page-info">
        {currentPage + 1} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="pagination-button"
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;