import React from 'react';
import { useParams } from 'react-router-dom';

function MatchingSystemActionPage() {
  const { managerId } = useParams();

  return (
    <div>
      <h2>매칭 시스템 액션 페이지</h2>
      <p>매칭 ID: {managerId}</p>
      {/* Add matching details and action forms here */}
    </div>
  );
}

export default MatchingSystemActionPage;
