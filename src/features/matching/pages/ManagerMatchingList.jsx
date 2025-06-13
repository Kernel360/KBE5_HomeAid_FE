import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ManagerMatchingList.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import useMatchingStore from '../../../stores/matchingStore.js';
import { useManagerMatching } from '../hooks/useManagerAPI.js';
import {
  MATCHING_STATUS,
  MATCHING_STATUS_LABELS,
  MATCHING_STATUS_COLORS,
} from '../constants/matchingData.js';

const ManagerMatchingList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // zustand store 사용
  const { setMatchingRequest } = useMatchingStore();

  // API 훅 사용
  const { loading, error, getMatchingList } = useManagerMatching();

  // 매칭 목록 상태
  const [matchingList, setMatchingList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // 탭 정의 (백엔드 상태에 맞게 수정)
  const tabs = ['전체', '매칭 대기', '응답 대기', '매칭 완료', '거절'];

  // 백엔드 상태를 탭 이름으로 매핑
  const getTabNameFromStatus = (status) => {
    switch (status) {
      case 'REQUESTED':
        return '매칭 대기';
      case 'ACCEPTED':
        return '고객 응답 대기';
      case 'CONFIRMED':
        return '매칭 완료';
      case 'REJECTED':
        return '거절됨';
      default:
        return '알 수 없음';
    }
  };

  // 컴포넌트 마운트 시 매칭 리스트 로드
  useEffect(() => {
    loadMatchingList();
  }, [currentPage]); // currentPage가 변경될 때마다 데이터 로드

  // ⭐️ 페이지가 다시 보일 때 데이터 새로고침 (매칭 완료 후 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 페이지 포커스 - 매칭 목록 새로고침');
      loadMatchingList();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 페이지 표시 - 매칭 목록 새로고침');
        loadMatchingList();
      }
    };

    // 윈도우 포커스 이벤트 리스너 추가
    window.addEventListener('focus', handleFocus);
    // 페이지 가시성 변경 이벤트 리스너 추가
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 클린업
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ⭐️ 페이지 경로가 변경될 때마다 데이터 새로고침 (매칭 요청 페이지에서 돌아올 때)
  useEffect(() => {
    if (location.pathname === '/matching/list') {
      console.log('🔄 매칭 목록 페이지로 이동 - 데이터 새로고침');

      // ⭐️ 매칭 완료 후 돌아온 경우 특별한 처리
      if (location.state?.refreshData) {
        console.log('✅ 매칭 완료 후 돌아옴 - 강제 데이터 새로고침', {
          completedMatchingId: location.state.completedMatchingId,
        });

        // 약간의 지연 후 새로고침 (백엔드 업데이트 시간 고려)
        setTimeout(() => {
          loadMatchingList();
        }, 100);
      } else {
        loadMatchingList();
      }
    }
  }, [location.pathname, location.state]);

  const loadMatchingList = async () => {
    try {
      const data = await getMatchingList(currentPage, pageSize);
      console.log('📡 백엔드에서 받은 원본 매칭 데이터:', data);

      // 백엔드 데이터를 UI 형태로 변환
      const transformedData = data.content.map((item) => {
        const transformed = {
          id: item.matchingId,
          customerName: item.customerName || '김고객',
          serviceType: item.serviceType,
          workTime: `${item.reservedDate} ${item.reservedTime}`,
          status: getTabNameFromStatus(item.status),
          statusColor: MATCHING_STATUS_COLORS[item.status],
          originalStatus: item.status,
          estimatedDuration: item.estimatedDuration || 0,
          customerRequest: item.customerRequest,
          address: `${item.latitude}, ${item.longitude}`,
          reservationId: item.reservationId,
          managerStatus: item.managerStatus,
          customerStatus: item.customerStatus,
        };

        console.log(
          `📋 매칭 ID ${item.matchingId}: ${item.status} → ${transformed.status}`,
          {
            원본상태: item.status,
            변환상태: transformed.status,
            색상: transformed.statusColor,
          }
        );

        return transformed;
      });

      console.log('✅ 변환된 매칭 목록:', transformedData);
      setMatchingList(transformedData);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('매칭 목록 로드 실패:', err);
      setMatchingList([]);
    }
  };

  // 탭별 필터링
  const getFilteredList = () => {
    let filtered = matchingList;

    // 탭 필터링
    if (activeTab !== '전체') {
      filtered = filtered.filter((item) => item.status === activeTab);
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.customerName.includes(searchQuery) ||
          item.serviceType.includes(searchQuery) ||
          item.id.toString().includes(searchQuery)
      );
    }

    return filtered;
  };

  // 상세보기 버튼 클릭
  const handleDetailView = (matchingItem) => {
    setSelectedItem(matchingItem);
    setShowDetailModal(true);
  };

  // 모달 닫기
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  // 청소하기 버튼 클릭 (매칭 완료 상태)
  const handleServiceStart = (matchingItem) => {
    // 매칭 정보를 스토어에 저장하고 서비스 체크인 페이지로 이동
    setMatchingRequest({
      matchingId: matchingItem.id,
      customerName: matchingItem.customerName,
      serviceType: matchingItem.serviceType,
      reservedDate: matchingItem.workTime.split(' ')[0],
      reservedTime: matchingItem.workTime.split(' ')[1],
      address: matchingItem.address,
      customerRequest: matchingItem.customerRequest,
      status: MATCHING_STATUS.CONFIRMED,
      estimatedDuration: matchingItem.estimatedDuration,
      reservationId: matchingItem.reservationId,
    });
    navigate('/matching/service-checkin');
  };

  // 매칭하기 버튼 클릭 (매칭 대기 상태)
  const handleMatching = (matchingItem) => {
    console.log('🔄 매칭 요청 페이지로 이동:', {
      matchingId: matchingItem.id,
      status: matchingItem.originalStatus,
    });

    // 매칭 정보를 스토어에 저장하고 매칭 요청 페이지로 이동
    setMatchingRequest({
      matchingId: matchingItem.id,
      customerName: matchingItem.customerName,
      serviceType: matchingItem.serviceType,
      reservedDate: matchingItem.workTime.split(' ')[0],
      reservedTime: matchingItem.workTime.split(' ')[1],
      estimatedDuration: matchingItem.estimatedDuration,
      address: matchingItem.address,
      customerRequest: matchingItem.customerRequest,
      status: matchingItem.originalStatus,
    });

    navigate('/matching/matching-request', {
      state: {
        matchingId: matchingItem.id,
      },
    });
  };

  // 버튼 렌더링 로직 (백엔드 상태 기반)
  const renderActionButtons = (item) => {
    console.log(
      `🔘 버튼 렌더링: ID ${item.id}, 상태: ${item.status}, 원본상태: ${item.originalStatus}`
    );

    switch (item.status) {
      case '매칭 대기': // PENDING_MANAGER_RESPONSE (REQUESTED, PENDING)
        console.log(`  → "매칭하기" 버튼 표시`);
        return (
          <button
            className="action-button matching-button"
            onClick={() => handleMatching(item)}
          >
            매칭하기
          </button>
        );
      case '매칭 완료': // CONFIRMED (매니저가 수락한 상태)
        console.log(`  → "상세보기", "청소하기" 버튼 표시`);
        return (
          <div className="button-group">
            <button
              className="action-button detail-button"
              onClick={() => handleDetailView(item)}
            >
              상세보기
            </button>
            <button
              className="action-button service-button"
              onClick={() => handleServiceStart(item)}
            >
              청소하기
            </button>
          </div>
        );
      case '고객 응답 대기': // PENDING_CUSTOMER_RESPONSE
        console.log(`  → "상세보기" 버튼만 표시 (고객 응답 대기)`);
        return (
          <button
            className="action-button detail-button"
            onClick={() => handleDetailView(item)}
          >
            상세보기
          </button>
        );
      case '거절됨': // REJECTED_BY_MANAGER, REJECTED_BY_CUSTOMER
        console.log(`  → "상세보기" 버튼만 표시 (거절됨)`);
        return (
          <button
            className="action-button detail-button"
            onClick={() => handleDetailView(item)}
          >
            상세보기
          </button>
        );
      default:
        console.log(`  → 알 수 없는 상태, 버튼 없음`);
        return null;
    }
  };

  // 상태별 배지 색상
  const getStatusBadgeClass = (statusColor) => {
    return `status-badge ${statusColor}`;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadMatchingList();
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0); // 탭 변경 시 첫 페이지로 이동
    loadMatchingList();
  };

  return (
    <div className="manager-matching-list-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="manager-matching-list-container">
          <h1 className="page-title">매칭 내역 조회</h1>

          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 검색 바 */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="고객명 또는 서비스유형 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="loading-state">
              <p>로딩 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && !loading && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadMatchingList} className="retry-button">
                다시 시도
              </button>
            </div>
          )}

          {/* 매칭 리스트 */}
          {!loading && !error && (
            <div className="matching-list">
              {getFilteredList().length === 0 ? (
                <div className="empty-state">
                  <p>매칭 내역이 없습니다.</p>
                </div>
              ) : (
                getFilteredList().map((item) => (
                  <div key={item.id} className="matching-item">
                    <div className="item-header">
                      <span className="item-id">#{item.id}</span>
                      <span className={getStatusBadgeClass(item.statusColor)}>
                        {item.status}
                      </span>
                    </div>

                    <div className="item-content">
                      <div className="item-info">
                        <div className="info-row">
                          <span className="label">고객명</span>
                          <span className="value">{item.customerName}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">서비스 유형</span>
                          <span className="value">{item.serviceType}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">일시</span>
                          <span className="value">{item.workTime}</span>
                        </div>
                        {item.price && (
                          <div className="info-row">
                            <span className="label">금액</span>
                            <span className="value price">
                              {item.price.toLocaleString()}원
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="item-actions">
                        {renderActionButtons(item)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 페이지네이션 */}
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="pagination-button"
            >
              이전
            </button>
            <span className="page-info">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="pagination-button"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">매칭 상세 정보</h3>
              <button className="modal-close-button" onClick={closeDetailModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-label">매칭 ID</span>
                  <span className="detail-value">#{selectedItem.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">상태</span>
                  <span
                    className={`detail-value status-${selectedItem.statusColor}`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">고객명</span>
                  <span className="detail-value">
                    {selectedItem.customerName}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">서비스 유형</span>
                  <span className="detail-value">
                    {selectedItem.serviceType}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">일시</span>
                  <span className="detail-value">{selectedItem.workTime}</span>
                </div>
                {selectedItem.estimatedDuration && (
                  <div className="detail-row">
                    <span className="detail-label">예상 소요시간</span>
                    <span className="detail-value">
                      {selectedItem.estimatedDuration}시간
                    </span>
                  </div>
                )}
                {selectedItem.price && (
                  <div className="detail-row">
                    <span className="detail-label">금액</span>
                    <span className="detail-value price-highlight">
                      {selectedItem.price.toLocaleString()}원
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">주소</span>
                  <span className="detail-value">{selectedItem.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">고객 요청사항</span>
                  <span className="detail-value">
                    {selectedItem.customerRequest}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-button close-button"
                onClick={closeDetailModal}
              >
                닫기
              </button>
              {selectedItem.status === '매칭 완료' && (
                <button
                  className="modal-button service-button"
                  onClick={() => {
                    closeDetailModal();
                    handleServiceStart(selectedItem);
                  }}
                >
                  청소하기
                </button>
              )}
              {selectedItem.status === '매칭 대기' && (
                <button
                  className="modal-button matching-button"
                  onClick={() => {
                    closeDetailModal();
                    handleMatching(selectedItem);
                  }}
                >
                  매칭하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer current="/matching/list" />
    </div>
  );
};

export default ManagerMatchingList;
