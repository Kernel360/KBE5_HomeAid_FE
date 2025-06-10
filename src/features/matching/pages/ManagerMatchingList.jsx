import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ManagerMatchingList.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { useManagerMatching } from '../hooks/useManagerAPI';
import {
  MATCHING_STATUS,
  MATCHING_STATUS_LABELS,
  MATCHING_STATUS_COLORS,
} from '../constants/matchingData';
import { apiService } from '../../../store/api';
import useMatchingStore from '../store/useMatchingStore';

const ManagerMatchingList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const { activeReservation, setActiveMatching, setActiveReservation } = useMatchingStore();

  // zustand store 사용
  // const { setMatchingRequest } = useMatchingStore();

  // API 훅 사용
  const { loading, error, getMatchingList } = useManagerMatching();

  // 매칭 목록 상태
  const [matchingList, setMatchingList] = useState([]);

  // 탭 정의 (백엔드 상태에 맞게 수정)
  const tabs = ['전체', '매칭 대기', '고객 응답 대기', '매칭 완료', '거절됨'];

  // 백엔드 상태를 탭 이름으로 매핑 (현재 사용하지 않지만 나중에 필요할 수 있음)

  const fetchMatching = async () => {
    const response = await apiService.manager.getAllMatcings();
    setMatchingList(response.data.data.content)
  }

  useEffect(() => {
    fetchMatching();
  }, []);

  const fetchReservation = async (reservationId) => {
    const response = await apiService.reservation.getById(reservationId);
    console.log('단건 예약 정보', response.data.data);

    setSelectedItem(response.data.data)
    // return response.data.data;
  }


  const loadMatchingList = async () => {
    try {
      const data = await getMatchingL
      ist();
      console.log('📡 백엔드에서 받은 원본 매칭 데이터:', data);

      // 백엔드 데이터를 UI 형태로 변환
      const transformedData = data.map((item) => {
        const transformed = {
          id: item.matchingId,
          customerName: item.customerName || '김고객',
          serviceType: item.serviceType,
          workTime: `${item.reservedDate} ${item.reservedTime}`,
          price: item.price,
          status: MATCHING_STATUS_LABELS[item.status],
          statusColor: MATCHING_STATUS_COLORS[item.status],
          originalStatus: item.status, // 원본 상태 보존
          estimatedDuration: item.estimatedDuration,
          customerRequest: item.customerRequest,
          address: item.address || '주소 정보 없음', // 실제 주소 데이터 사용
          // 추가 정보
          reservationId: item.reservationId,
          subOptionId: item.subOptionId,
          totalDuration: item.totalDuration,
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
    } catch (err) {
      console.error('매칭 목록 로드 실패:', err);
      // 에러 시 빈 배열 설정
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
  const handleDetailView = (reservationId) => {
    console.log('mathcing detail ', reservationId)
    setSelectedItem(reservationId);
    setActiveReservation(reservationId);
    fetchReservation(reservationId);
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
    });
    navigate('/matching/service-checkin');
  };

  // 매칭하기 버튼 클릭 (매칭 대기 상태)
  const handleMatching = (matching) => {
    // 매칭 정보를 스토어에 저장하고 매칭 요청 페이지로 이동
    // setMatchingRequest({
    //   matchingId: matchingItem.id,
    //   customerName: matchingItem.customerName,
    //   serviceType: matchingItem.serviceType,
    //   reservedDate: matchingItem.workTime.split(' ')[0],
    //   reservedTime: matchingItem.workTime.split(' ')[1],
    //   estimatedDuration: matchingItem.estimatedDuration,
    //   address: matchingItem.address,
    //   customerRequest: matchingItem.customerRequest,
    //   status: MATCHING_STATUS.PENDING_MANAGER_RESPONSE,
    // });
    console.log('매칭하기 버튼', matching);
    setActiveMatching(matching)
    setActiveReservation(matching.reservationId);
    navigate('/matching/matching-request');
  };

  // 버튼 렌더링 로직 (백엔드 상태 기반)
  const renderActionButtons = (item) => {
    switch (item.status) {
      case 'REQUESTED': // 관리자가 매칭 시켜준 상태
        return (
          <button
            className="action-button matching-button"
            onClick={() => handleMatching(item)}
          >
            수락하기
          </button>
        );
      case 'CONFIRMED': // CONFIRMED (고객이 수락한 상태)
        return (
          <div className="button-group">
            <button
              className="action-button detail-button"
              onClick={() => handleDetailView(item.reservationId)}
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
      case 'ACCEPTED': //매니저가 수락한 상태 고객응답 대기
        return (
          <button
            className="action-button detail-button"
            onClick={() => handleDetailView(item.reservationId)}
          >
            상세보기
          </button>
        );
      case 'REJECTED': // CONFIREMD이 안되고 고객이 거절한 상태
        return (
          <button
            className="action-button detail-button"
            onClick={() => handleDetailView(item.reservationId)}
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
  const getStatusBadgeClass = (status) => {
    return `status-badge ${MATCHING_STATUS_COLORS[status]}`;
  };

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
              {matchingList.length === 0 ? (
                <div className="empty-state">
                  <p>매칭 내역이 없습니다.</p>
                </div>
              ) : (
                matchingList.map((item) => (
                  <div key={item.matchingId} className="matching-item">
                    <div className="item-header">
                      <span className="item-id">#{item.matchingId}</span>
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.statusDisplay}
                      </span>
                    </div>

                    <div className="item-content">
                      <div className="item-info">
                        <div className="info-row">
                          <span className="label">고객명,현재는아이디</span>
                          <span className="value">{item.customerId}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">서비스 유형</span>
                          <span className="value">{item.subOptionName}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">일시</span>
                          <span className="value">{item.scheduleDateTime}</span>
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
                {/* <div className="detail-row">
                  <span className="detail-label">매칭 ID</span>
                  <span className="detail-value">#{selectedItem.id}</span>
                </div> */}
                <div className="detail-row">
                  <span className="detail-label">예약 상태</span>
                  <span
                    className={`detail-value status-${selectedItem.statusColor}`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                {/* <div className="detail-row">
                  <span className="detail-label">고객명</span>
                  <span className="detail-value">
                    {selectedItem.customerName}
                  </span>
                </div> */}
                <div className="detail-row">
                  <span className="detail-label">서비스 유형</span>
                  <span className="detail-value">
                    {selectedItem.subOptionName}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">일시</span>
                  <span className="detail-value">{selectedItem.requestDate}</span>
                  <span className="detail-value">{selectedItem.requestTime}</span>
                </div>
                {selectedItem.totalDuration && (
                  <div className="detail-row">
                    <span className="detail-label">예상 소요시간</span>
                    <span className="detail-value">
                      {selectedItem.totalDuration}분
                    </span>
                  </div>
                )}
                {selectedItem.totalPrice && (
                  <div className="detail-row">
                    <span className="detail-label">금액</span>
                    <span className="detail-value price-highlight">
                      {selectedItem.totalPrice}원
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
                    {selectedItem.customerMemo}
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
              {selectedItem.status === 'REQUESTED' && (
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
