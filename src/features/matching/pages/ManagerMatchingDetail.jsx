

const ManagerMatchingDetail = ({ showDetailModal, setShowDetailModal, selectedItem, setSelectedItem, handleServiceStart, handleMatching}) => {
      // 모달 닫기
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

    return (
        showDetailModal && selectedItem && (
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
        )

    )

}

export default ManagerMatchingDetail;