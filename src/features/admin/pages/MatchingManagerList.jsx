import React, { useState } from 'react';
import './MatchingManagerList.css';
import MatchingManagerCard from '../components/MatchingManagerCard';

function MatchingManagerList() {
  // Placeholder data for managers
  const [managers] = useState([
    {
      id: 1001,
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'kim@example.com',
      joinDate: '2023-05-15',
      serviceType: ['일반 청소', '대청소'],
      activityArea: '서울시 강남구',
      status: 'active', // Assuming status for filtering
    },
    {
      id: 1003,
      name: '은길동',
      phone: '010-3456-7890',
      email: 'park@example.com',
      joinDate: '2023-06-20',
      serviceType: ['일반 청소'],
      activityArea: '서울시 강남구',
      status: 'pending', // Assuming status for filtering
    },
    // Add more placeholder data as needed
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  // Filter and search logic
  const filteredManagers = managers.filter((manager) => {
    const matchesFilter = filter === 'all' || manager.status === filter;
    const matchesSearch =
      searchTerm === '' ||
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.phone.includes(searchTerm) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentManagers = filteredManagers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }
    return pageButtons;
  };

  return (
    <div className="manager-list-container">
      <div className="manager-list-header">
        <h2 className="manager-list-title">매니저 목록</h2>
        <p className="manager-list-description">매니저 목록을 관리합니다</p>
      </div>

      <div className="filter-buttons">
        <button
          className={
            filter === 'all' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          className={
            filter === 'active' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('active')}
        >
          활성
        </button>
        <button
          className={
            filter === 'pending' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('pending')}
        >
          승인 대기
        </button>
        <button
          className={
            filter === 'inactive' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('inactive')}
        >
          비활성
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="이름, 연락처 또는 이메일 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="manager-cards-list">
        {currentManagers.map((manager) => (
          <MatchingManagerCard key={manager.id} manager={manager} />
        ))}
      </div>

      <div className="pagination">{renderPaginationButtons()}</div>
    </div>
  );
}

export default MatchingManagerList;
