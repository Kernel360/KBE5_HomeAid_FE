import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerMatchingList.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import useMatchingStore from '../../../stores/matchingStore';
import { useManagerMatching } from '../hooks/useManagerAPI';

const ManagerMatchingList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // zustand store 사용
  const { setMatchingRequest } = useMatchingStore();

  // API 훅 사용
  // eslint-disable-next-line no-unused-vars
  const { loading, error, getMatchingList } = useManagerMatching();

  // 더미 데이터 (실제로는 API에서 가져옴)
  // eslint-disable-next-line no-unused-vars
  const [matchingList, setMatchingList] = useState([
    {
      id: 5001,
      customerName: '김고객',
      serviceType: '일반 청소',
      workTime: '2023-06-15 14:00',
      price: 80000,
      status: '서비스 완료',
      statusColor: 'completed',
    },
    {
      id: 5002,
      customerName: '이고객',
      serviceType: '입주 청소',
      workTime: '2023-06-20 10:00',
      price: 60000,
      status: '매칭 완료',
      statusColor: 'matched',
    },
    {
      id: 5003,
      customerName: '박고객',
      serviceType: '회장 입시',
      workTime: '2023-06-25 14:00',
      price: null,
      status: '서비스 거절',
      statusColor: 'rejected',
    },
    {
      id: 5004,
      customerName: '박고객',
      serviceType: '일반 청소',
      workTime: '2023-06-25 14:00',
      price: null,
      status: '매칭 대기',
      statusColor: 'waiting',
    },
  ]);

  const tabs = ['전체', '매칭 대기', '매칭 완료', '서비스 완료'];

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

  // 청소하기 버튼 클릭
  const handleServiceStart = (matchingItem) => {
    // 매칭 정보를 스토어에 저장하고 서비스 체크인 페이지로 이동
    setMatchingRequest({
      id: matchingItem.id,
      customerName: matchingItem.customerName,
      serviceType: matchingItem.serviceType,
      dateTime: matchingItem.workTime,
      isAccepted: true,
      status: '수락됨',
    });
    navigate('/matching/service-checkin');
  };

  // 매칭하기 버튼 클릭
  const handleMatching = (matchingItem) => {
    // 매칭 정보를 스토어에 저장하고 매칭 요청 페이지로 이동
    setMatchingRequest({
      id: matchingItem.id,
      customerName: matchingItem.customerName,
      serviceType: matchingItem.serviceType,
      dateTime: matchingItem.workTime,
      estimatedEarnings: 80000, // 예상 수입
      address: '서울시 강남구 테헤란로 123',
      customerRequest: '깨끗하게 청소 부탁드립니다.',
      isAccepted: false,
      status: '신규 요청',
    });
    navigate('/matching/matching-request');
  };

  // 버튼 렌더링 로직
  const renderActionButtons = (item) => {
    switch (item.status) {
      case '매칭 대기':
        return (
          <button
            className="action-button matching-button"
            onClick={() => handleMatching(item)}
          >
            매칭하기
          </button>
        );
      case '매칭 완료':
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
      case '서비스 완료':
      case '서비스 거절':
        return (
          <button
            className="action-button detail-button"
            onClick={() => handleDetailView(item)}
          >
            상세보기
          </button>
        );
      default:
        return null;
    }
  };

  // 상태별 배지 색상
  const getStatusBadgeClass = (statusColor) => {
    return `status-badge ${statusColor}`;
  };

  // 컴포넌트 마운트 시 매칭 리스트 로드
  useEffect(() => {
    // TODO: 실제 API 호출
    // getMatchingList().catch(console.error);
  }, []);

  return (
    <div className="manager-matching-list-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="manager-matching-list-container">
          <h1 className="page-title">매칭 내역 조회</h1>

          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
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

          {/* 매칭 리스트 */}
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
                  <span className="detail-value">
                    서울시 강남구 테헤란로 123
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">고객 요청사항</span>
                  <span className="detail-value">
                    깨끗하게 청소 부탁드립니다.
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
