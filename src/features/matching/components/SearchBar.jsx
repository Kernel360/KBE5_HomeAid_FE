import React from 'react';

/**
 * 검색 바 컴포넌트
 * 순수 컴포넌트로 검색 상태는 부모에서 관리
 */
const SearchBar = ({ searchQuery, onSearchChange, placeholder = "고객명 또는 서비스유형 검색" }) => {
  return (
    <div className="search-section">
      <div className="search-input-wrapper">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
    </div>
  );
};

export default SearchBar;