import React, { useState, useMemo } from 'react';
import './MatchingSystemPage.css';
import MatchingSystemCard from '../components/MatchingSystemCard';

function MatchingSystemPage() {
  // 임시 데이터: 매니저 상태(status) 필드 추가 및 일부 데이터 조정
  const managers = useMemo(
    () => [
      {
        id: 5001,
        name: '김고객',
        managerName: '홍길동', // 매니저명 필드 추가
        userId: 1001,
        phone: '010-1234-5678',
        email: 'kim@example.com',
        date: '2023-06-15 14:00', // 일시 필드 이름 변경
        service: '대청소',
        area: '서울시 강남구',
        status: 'service_completed', // '서비스 완료' 상태 추가
        price: '80,000', // 금액 필드 추가
      },
      {
        id: 5002,
        name: '이고객',
        managerName: '김매니저', // 매니저명 필드 추가
        userId: 1003,
        phone: '010-3456-7890',
        email: 'park@example.com',
        date: '2023-06-20 10:00', // 일시 필드 이름 변경
        service: '일반 청소',
        area: '서울시 강남구',
        status: 'match_completed', // '매칭 완료' 상태 추가
        price: '60,000', // 금액 필드 추가
      },
      {
        id: 5003,
        name: '박고객',
        managerName: '-', // 매니저명 아직 없음
        userId: 1004,
        phone: '010-5678-1234',
        email: 'lee@example.com',
        date: '2023-06-25 14:00', // 희망 일시
        service: '일반 청소',
        area: '서울시 서초구',
        status: 'pending', // '매칭 대기' 상태 유지
        price: null, // 매칭 대기는 금액 없음
      },
      // Add more dummy data as needed to match image quantity/statuses
      {
        id: 5004,
        name: '최고객',
        managerName: '이매니저',
        userId: 1005,
        phone: '010-8765-4321',
        email: 'kim2@example.com',
        date: '2023-07-01 09:00',
        service: '사무실 청소',
        area: '서울시 송파구',
        status: 'service_completed', // '서비스 완료'
        price: '100,000',
      },
      {
        id: 5005,
        name: '정고객',
        managerName: '강매니저',
        userId: 1006,
        phone: '010-2468-1357',
        email: 'kang@example.com',
        date: '2023-07-05 11:00',
        service: '입주 청소',
        area: '서울시 강동구',
        status: 'match_completed', // '매칭 완료'
        price: '200,000',
      },
    ],
    []
  );

  // 매칭 현황 카운트 계산
  const totalMatches = managers.length;
  const inProgressMatches = managers.filter(
    (manager) =>
      manager.status === 'match_completed' ||
      manager.status === 'service_completed'
  ).length; // '매칭 완료' 또는 '서비스 완료'를 진행 중으로 간주
  const pendingMatches = managers.filter(
    (manager) => manager.status === 'pending'
  ).length;

  // 필터 및 검색어 상태 관리
  // 필터 값은 이미지의 버튼 텍스트와 일치시킵니다.
  const [filter, setFilter] = useState('전체'); // 기본 필터: 전체
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태

  // 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [managersPerPage] = useState(3); // 페이지당 매니저 수 (이미지 기준 3개)

  // 검색어 및 필터에 따라 매니저 목록 필터링
  const filteredManagers = useMemo(() => {
    let currentManagers = managers;

    // Apply Search
    if (searchTerm) {
      currentManagers = currentManagers.filter((manager) => {
        // Search across relevant fields
        const searchFields = [
          manager.name,
          manager.managerName, // Search by manager name
          manager.phone,
          manager.email,
          manager.service,
          manager.area,
          manager.id.toString(), // Search by booking number
        ];
        return searchFields.some(
          (field) =>
            field &&
            field.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ); // Case-insensitive search
      });
    }

    // Apply Filter based on button text
    if (filter !== '전체') {
      currentManagers = currentManagers.filter((manager) => {
        if (filter === '매칭 대기') return manager.status === 'pending';
        if (filter === '매칭 완료') return manager.status === 'match_completed';
        if (filter === '서비스 완료')
          return manager.status === 'service_completed';
        return true; // Should not reach here if filters are correctly handled
      });
    }

    return currentManagers;
  }, [managers, searchTerm, filter]); // managers, searchTerm, filter가 변경될 때만 다시 계산

  // 현재 페이지에 해당하는 매니저 목록 계산
  const indexOfLastManager = currentPage * managersPerPage;
  const indexOfFirstManager = indexOfLastManager - managersPerPage;
  const currentManagers = filteredManagers.slice(
    indexOfFirstManager,
    indexOfLastManager
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredManagers.length / managersPerPage);

  // 페이지 변경 함수
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="matching-management-container">
      {/* Header Section */}
      <div className="matching-management-header">
        <p className="matching-management-title">매칭 관리</p>
        <p className="matching-management-description">
          서비스 매칭 현황을 관리하고 추천합니다
        </p>
      </div>

      {/* Matching Status Overview */}
      <div className="matching-status-overview">
        <div className="status-overview-header">
          <i className="fas fa-users"></i>{' '}
          {/* Placeholder icon, replace with actual icon if needed */}
          <span>매칭 현황 관리</span>
        </div>
        <div className="status-cards-row">
          <div className="status-card total">
            <p>{totalMatches}</p>
            <p>총 매칭</p>
          </div>
          <div className="status-card in-progress">
            <p>{inProgressMatches}</p>
            <p>진행 중</p>
          </div>
          <div className="status-card pending">
            <p>{pendingMatches}</p>
            <p>대기 중</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-button ${filter === '전체' ? 'active' : ''}`}
          onClick={() => {
            setFilter('전체');
            setCurrentPage(1); // 필터 변경 시 1페이지로 이동
          }}
        >
          전체
        </button>
        <button
          className={`filter-button ${filter === '매칭 대기' ? 'active' : ''}`}
          onClick={() => {
            setFilter('매칭 대기');
            setCurrentPage(1); // 필터 변경 시 1페이지로 이동
          }}
        >
          매칭 대기
        </button>
        <button
          className={`filter-button ${filter === '매칭 완료' ? 'active' : ''}`}
          onClick={() => {
            setFilter('매칭 완료');
            setCurrentPage(1); // 필터 변경 시 1페이지로 이동
          }}
        >
          매칭 완료
        </button>
        <button
          className={`filter-button ${filter === '서비스 완료' ? 'active' : ''}`}
          onClick={() => {
            setFilter('서비스 완료');
            setCurrentPage(1); // 필터 변경 시 1페이지로 이동
          }}
        >
          서비스 완료
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="고객명 또는 매니저명 검색"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // 검색어 변경 시 1페이지로 이동
          }}
        />
        {/* Add search icon here if needed */}
      </div>

      {/* Manager List (Matching System Cards) */}
      <div className="manager-list">
        {currentManagers.map((manager) => (
          <MatchingSystemCard key={manager.id} manager={manager} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && ( // Only show pagination if there's more than one page
        <div className="pagination">
          {/* 페이지 번호 버튼을 동적으로 생성 */}
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''} // 현재 페이지 버튼에 active 클래스 적용
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchingSystemPage;
