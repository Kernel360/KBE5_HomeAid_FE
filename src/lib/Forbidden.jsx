import React from 'react';

export const Forbidden = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>403 Forbidden</h1>
      <p>접근 권한이 없습니다.</p>
      <p>요청하신 페이지에 접근할 권한이 없습니다.</p>
      <p>관리자에게 문의하거나, <a href="/">홈으로 돌아가기</a></p>
    </div>
  );
}; 