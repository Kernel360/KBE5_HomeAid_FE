import React, { useState } from 'react';
import './AdminUserManagement.css';
// import { useNavigate } from 'react-router-dom';

const AdminUserManagement = () => {
  // const navigate = useNavigate();

  // Dummy data for demonstration
  const allUsers = [
    {
      id: 1001, // 자동 값
      name: '김고객',
      contact: '010-1234-5678',
      email: 'kim@example.com',
      signupDate: '2023-05-15', // 로그인날짜 필요없음
      lastActivity: '2시간 전', // 필요없음
      initial: '김', // 필요없음
      status: 'active',
    },
    {
      id: 1002,
      name: '황고객',
      contact: '010-1234-5678',
      email: 'hwang@example.com',
      signupDate: '2023-05-15',
      lastActivity: '2시간 전',
      initial: '황',
      status: 'inactive',
    },
    {
      id: 1003,
      name: '박고객',
      contact: '010-5678-1234',
      email: 'park@example.com',
      signupDate: '2023-06-01',
      lastActivity: '1일 전',
      initial: '박',
      status: 'active',
    },
    {
      id: 1004,
      name: '최고객',
      contact: '010-1111-2222',
      email: 'choi@example.com',
      signupDate: '2023-06-05',
      lastActivity: '3시간 전',
      initial: '최',
      status: 'active',
    },
    {
      id: 1005,
      name: '유고객',
      contact: '010-3333-4444',
      email: 'yoo@example.com',
      signupDate: '2023-06-10',
      lastActivity: '5시간 전',
      initial: '유',
      status: 'inactive',
    },
    {
      id: 1006,
      name: '강고객',
      contact: '010-5555-6666',
      email: 'kang@example.com',
      signupDate: '2023-06-15',
      lastActivity: '10시간 전',
      initial: '강',
      status: 'active',
    },
    {
      id: 1007,
      name: '김고객',
      contact: '010-1234-5678',
      email: 'kim@example.com',
      signupDate: '2023-05-15',
      lastActivity: '2시간 전',
      initial: '김',
      status: 'active',
    },
    {
      id: 1008,
      name: '황고객',
      contact: '010-1234-5678',
      email: 'hwang@example.com',
      signupDate: '2023-05-15',
      lastActivity: '2시간 전',
      initial: '황',
      status: 'inactive',
    },
    {
      id: 1009,
      name: '박고객',
      contact: '010-5678-1234',
      email: 'park@example.com',
      signupDate: '2023-06-01',
      lastActivity: '1일 전',
      initial: '박',
      status: 'active',
    },
    {
      id: 1010,
      name: '최고객',
      contact: '010-1111-2222',
      email: 'choi@example.com',
      signupDate: '2023-06-05',
      lastActivity: '3시간 전',
      initial: '최',
      status: 'active',
    },
    {
      id: 1011,
      name: '유고객',
      contact: '010-3333-4444',
      email: 'yoo@example.com',
      signupDate: '2023-06-10',
      lastActivity: '5시간 전',
      initial: '유',
      status: 'inactive',
    },
    {
      id: 1012,
      name: '강고객',
      contact: '010-5555-6666',
      email: 'kang@example.com',
      signupDate: '2023-06-15',
      lastActivity: '10시간 전',
      initial: '강',
      status: 'active',
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', or 'inactive'
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  // 검색/필터링 적용
  const filteredUsers = allUsers.filter((user) => {
    if (filter === 'active' && user.status !== 'active') {
      return false;
    }
    if (filter === 'inactive' && user.status !== 'inactive') {
      return false;
    }
    const query = searchQuery.toLowerCase();
    return (
      user.id.toString().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  // 페이지네이션 적용
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  

  return (
    <div className="admin-user-management">
      <div className="admin-header">
        <h1>사용자 관리</h1>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          전체 ({allUsers.length})
        </button>
        <button
          className={`filter-button ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          활성 ({allUsers.filter((user) => user.status === 'active').length})
        </button>
        <button
          className={`filter-button ${filter === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          비활성 ({allUsers.filter((user) => user.status === 'inactive').length}
          )
        </button>
      </div>

      <div className="advanced-search">
        <div className="search-input-container">
          <span className="search-icon">Q</span>
          <input
            type="text"
            placeholder="사용자 ID, 이름, 이메일로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="dropdown-arrow">↓</div>
      </div>

      <div className="user-list">
        {currentUsers.map((user) => (
          <div key={user.id} className="user-card">
            <input type="checkbox" className="user-checkbox" />
            <div className="user-initial">{user.initial}</div>
            <div className="user-details">
              <h2>{user.name}</h2>
              <p>ID: {user.id}</p>
              <p>연락처: {user.contact}</p>
              <p>이메일: {user.email}</p>
              <p>가입일: {user.signupDate}</p>
              <p>최근 활동: {user.lastActivity}</p>
            </div>
            <div
              className={`user-status ${user.status === 'active' ? 'active' : 'inactive'}`}
            >
              {user.status === 'active' ? '활성' : '비활성'}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {/* Render page numbers dynamically */}
        {Array.from(
          { length: totalPages },
          (
            _,
            index // Use Array.from for dynamic page numbers
          ) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          )
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default AdminUserManagement;
