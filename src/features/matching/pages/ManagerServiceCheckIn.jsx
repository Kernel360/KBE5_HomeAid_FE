import React, { useEffect, useState } from 'react';
import './ManagerServiceCheckIn.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import Modal from '../../../components/Modal.jsx';
import useReservationStore from '../store/reservationStore.js';
import { apiService } from '@/api';


const ManagerServiceCheckIn = () => {
  const reservationId = useReservationStore.getState().reservationId;
  const [reservation, setReservation] = useState({});
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [checkStatus, setCheckStatus] = useState({
    checkIn: false,
    checkOut: false,
  });
  const [workLog, setWorkLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueContent, setIssueContent] = useState('');
  const [issueFiles, setIssueFiles] = useState([]);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueData, setIssueData] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState(new Set());
  const [isEdited, setIsEdited] = useState(false);

  // 로컬 스토리지에서 체크 상태 불러오기
  const getStoredCheckStatus = () => {
    const stored = localStorage.getItem(`checkStatus_${reservationId}`);
    if (stored) {
      try {
        const parsedStatus = JSON.parse(stored);
        console.log('🔍 로컬 스토리지에서 불러온 상태:', parsedStatus);
        return parsedStatus;
      } catch (error) {
        console.error('로컬 스토리지 파싱 오류:', error);
      }
    }
    return { checkIn: false, checkOut: false };
  };

  // 로컬 스토리지에 체크 상태 저장하기
  const saveCheckStatus = (status) => {
    localStorage.setItem(
      `checkStatus_${reservationId}`,
      JSON.stringify(status)
    );
    console.log('🔍 로컬 스토리지에 상태 저장:', status);
  };

  // 체크 상태 업데이트 (로컬 스토리지와 함께)
  const updateCheckStatus = (newStatus) => {
    console.log('🔍 체크 상태 업데이트:', newStatus);
    setCheckStatus(newStatus);
    saveCheckStatus(newStatus);
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    console.log('위치 정보 요청 시작...');

    const options = {
      enableHighAccuracy: true, // 높은 정확도
      timeout: 5000, // 5초 타임아웃
      maximumAge: 0, // 캐시된 위치정보를 사용하지 않음
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('위치 정보 가져오기 성공:', position.coords);
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('위치 정보 상세 에러:', {
          code: error.code,
          message: error.message,
        });

        let errorMessage = '위치 정보를 가져오는데 실패했습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 정보 접근 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              '위치 정보를 사용할 수 없습니다. GPS 신호가 약하거나 위치 서비스가 꺼져있을 수 있습니다.';
            break;
          case error.TIMEOUT:
            errorMessage =
              '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
            break;
        }

        alert(errorMessage);
      },
      options // 옵션 추가
    );
  };

  // 이슈 데이터 불러오기
  const fetchIssueData = async () => {
    try {
      const response = await apiService.workLog.getIssue(reservationId);
      console.log('서버 응답 데이터:', response.data.data);
      setIssueData(response.data.data);
      if (response.data.data) {
        setIssueContent(response.data.data.content || '');
        // 서버에서 받은 이미지 데이터를 그대로 사용
        setCurrentImages(response.data.data.images || []);
        setDeletedImageIds(new Set()); // 초기화
        setIsEdited(false); // 초기화
      }
    } catch (error) {
      console.error('이슈 데이터 로딩 실패:', error);
    }
  };

  // 예약 상세 정보 불러오기 (apiService.reservation.getById만 사용)
  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await apiService.reservation.getById(reservationId);
      console.log(
        '🔍 reservation API 전체 응답:',
        JSON.stringify(response.data, null, 2)
      );
      console.log('🔍 reservation.data.data:', response.data.data);
      console.log(
        '🔍 workLog 전체 구조:',
        JSON.stringify(response.data.data.workLog, null, 2)
      );
      setReservation(response.data.data);

      // 로컬 스토리지에서 상태 확인
      const storedStatus = getStoredCheckStatus();

      // 체크인/아웃 상태 설정
      const reservationData = response.data.data;
      let serverStatus = { checkIn: false, checkOut: false };

      if (reservationData.workLog) {
        const workLog = reservationData.workLog;
        console.log('🔍 workLog 존재함:', workLog);
        console.log('🔍 checkInTime:', workLog.checkInTime);
        console.log('🔍 checkOutTime:', workLog.checkOutTime);

        serverStatus = {
          checkIn:
            workLog.checkInTime !== null && workLog.checkInTime !== undefined,
          checkOut:
            workLog.checkOutTime !== null && workLog.checkOutTime !== undefined,
        };
        console.log('🔍 서버에서 계산된 체크 상태:', serverStatus);
      } else if (
        reservationData.workLogs &&
        Array.isArray(reservationData.workLogs) &&
        reservationData.workLogs.length > 0
      ) {
        // workLogs 배열로 온 경우 처리
        const workLog = reservationData.workLogs[0];
        console.log('🔍 workLogs 배열에서 첫 번째 workLog:', workLog);

        serverStatus = {
          checkIn:
            workLog.checkInTime !== null && workLog.checkInTime !== undefined,
          checkOut:
            workLog.checkOutTime !== null && workLog.checkOutTime !== undefined,
        };
        console.log('🔍 서버에서 계산된 체크 상태 (배열):', serverStatus);
      } else {
        console.log('🔍 workLog가 없음 - 서버 상태는 초기값');
      }

      // 로컬 스토리지 상태와 서버 상태 중 더 진행된 상태를 사용
      const finalStatus = {
        checkIn: storedStatus.checkIn || serverStatus.checkIn,
        checkOut: storedStatus.checkOut || serverStatus.checkOut,
      };

      console.log('🔍 최종 적용될 상태:', finalStatus);
      console.log('🔍 로컬 스토리지 상태:', storedStatus);
      console.log('🔍 서버 상태:', serverStatus);

      updateCheckStatus(finalStatus);

      // 체크아웃이 완료된 경우 이슈 데이터 로드
      if (finalStatus.checkOut) {
        fetchIssueData();
      }
    } catch (error) {
      console.error('예약 정보 로딩 실패:', error);
      alert('예약 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLog = async () => {
    try {
      setLoading(true);
      const response = await apiService.workLog.getWorkLog(reservation.matchingId);
      setWorkLog(response.data.data);
    } catch (error) {
      console.error('체크인/아웃 상태 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    if (reservationId) {
      // 초기 로드 시 로컬 스토리지에서 상태 복원
      const storedStatus = getStoredCheckStatus();
      if (storedStatus.checkIn || storedStatus.checkOut) {
        setCheckStatus(storedStatus);
      }
      fetchReservation();
    }

    if (reservation?.matchingId) {
      fetchWorkLog();
    }
  }, [reservation?.matchingId]);


  const status = workLog?.status;
  const 체크인완료 = status !== 'NOT_STARTED';
  const 체크아웃완료 = status === 'CHECKOUT';
  
  const 체크인버튼활성 = status === 'NOT_STARTED';
  const 체크아웃버튼활성 = status === 'CHECKIN';

  // 디버깅을 위한 상태 변화 로그
  // useEffect(() => {
  //   console.log('🔍 현재 체크 상태:', checkStatus);
  //   console.log('  - 체크인:', checkStatus.checkIn ? '완료' : '미완료');
  //   console.log('  - 체크아웃:', checkStatus.checkOut ? '완료' : '미완료');
  //   console.log('  - 체크인 버튼 활성화:', !checkStatus.checkIn && !loading);
  //   console.log(
  //     '  - 체크아웃 버튼 활성화:',
  //     checkStatus.checkIn && !checkStatus.checkOut && !loading
  //   );
  // }, [checkStatus, loading]);

  const toggleCheckInModal = () => {
    setShowCheckInModal(!showCheckInModal);
  };

  const toggleCheckOutModal = () => {
    setShowCheckOutModal(!showCheckOutModal);
  };

  const handleCheckIn = () => {
    if (!currentLocation) {
      alert('위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.');
      return;
    }
    console.log('체크인 버튼 클릭 - 현재 위치 정보:', {
      위도: currentLocation.lat,
      경도: currentLocation.lng,
    });
    toggleCheckInModal();
  };

  const handleCheckOut = () => {
    if (!currentLocation) {
      alert('위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.');
      return;
    }
    console.log('체크아웃 버튼 클릭 - 위치 정보:', {
      위도: currentLocation.lat,
      경도: currentLocation.lng,
    });
    toggleCheckOutModal();
  };

  const confirmCheckIn = async () => {
    try {
      setLoading(true);
      if (!currentLocation) {
        throw new Error('위치 정보를 가져오는데 실패했습니다.');
      }

      if (!reservationId) {
        throw new Error('예약 ID가 없습니다. 예약을 선택해주세요.');
      }

      // 이미 체크인된 상태인지 확인
      if (workLog?.status === 'CHECKIN') {
        alert('이미 체크인이 완료되었습니다.');
        toggleCheckInModal();
        return;
      }

      const requestData = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      };
    
      await apiService.workLog.checkIn(reservation.matchingId, requestData);


      alert('체크인이 완료되었습니다.');
      toggleCheckInModal();
      await fetchWorkLog();

    } catch (error) {
      console.error('체크인 실패:', error);
      console.error('에러 상세:', error.response?.data);
      console.error('에러 상태:', error.response?.status);

      // 이미 체크인된 경우 상태 업데이트
      if (error.response?.data?.code === 'ALREADY_COMPLETED_WORKLOG') {
        updateCheckStatus({
          checkIn: true,
          checkOut: false,
        });
        alert('이미 체크인이 완료된 상태입니다.');
      } else {
        alert(error.response?.data?.message || '체크인에 실패했습니다.');
      }

      toggleCheckInModal();
    } finally {
      setLoading(false);
    }
  };

  const confirmCheckOut = async () => {
    try {
      setLoading(true);
      if (!currentLocation) {
        throw new Error('위치 정보를 가져오는데 실패했습니다.');
      }

      // 위치 정보만 전송
      await apiService.workLog.checkOut(reservation.matchingId, {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      });


      alert('체크아웃이 완료되었습니다.');
      toggleCheckOutModal();
      await fetchWorkLog();
    } catch (error) {
      console.error('체크아웃 실패:', error);
      alert(error.response?.data?.message || '체크아웃에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷 변환 함수
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const handleImageDelete = (imageId) => {
    console.log('이미지 삭제 시도 - 실제 이미지 ID:', imageId);
    setDeletedImageIds(prev => {
      const newSet = new Set([...prev, imageId]);
      console.log('삭제 예정인 이미지 ID들:', Array.from(newSet));
      return newSet;
    });
    setIsEdited(true);
  };

  const handleIssueSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmittingIssue(true);

    try {
      const formData = new FormData();
      formData.append('content', issueContent);
      
      // 새로 추가된 파일들 추가
      if (issueFiles.length > 0) {
        issueFiles.forEach((file) => {
          formData.append('files', file);
        });
      }

      // 삭제할 이미지 ID들을 전송
      if (deletedImageIds.size > 0) {
        const deleteIds = Array.from(deletedImageIds);
        console.log('전송할 삭제 이미지 ID들:', deleteIds);
        
        // 각 ID를 개별적으로 추가
        deleteIds.forEach(id => {
          formData.append('deleteImageIds', id.toString());
        });

        // FormData 내용 확인
        console.log('=== FormData 전송 내용 ===');
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
        console.log('========================');
      }

      if (issueData) {
        // 수정
        console.log('수정 요청 데이터:', {
          content: issueContent,
          files: issueFiles,
          deleteImageIds: Array.from(deletedImageIds)
        });
        const response = await apiService.workLog.updateIssue(issueData.id, formData);
        console.log('수정 응답:', response.data);
        if (response.data.success) {
          alert('특이사항이 수정되었습니다.');
          setShowIssueModal(false);
          setDeletedImageIds(new Set());
          setIssueFiles([]);
          setIsEdited(false);
          // 데이터 새로고침
          await fetchIssueData();
        }
      } else {
        // 새로 생성
        const response = await apiService.workLog.createIssue(reservationId, formData);
        if (response.data.success) {
          alert('특이사항이 저장되었습니다.');
          setShowIssueModal(false);
          setIsEdited(false);
          // 데이터 새로고침
          await fetchIssueData();
        }
      }
    } catch (error) {
      console.error('특이사항 저장 실패:', error);
      console.error('에러 상세:', error.response?.data);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleContentChange = (e) => {
    setIssueContent(e.target.value);
    setIsEdited(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setIssueFiles(files);
    setIsEdited(true);
  };

  const renderIssueModalContent = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label className="block mb-2 font-medium">
          서비스 이슈 내용
        </label>
        <textarea
          value={issueContent}
          onChange={handleContentChange}
          placeholder="서비스 중 발생한 이슈나 특이사항을 입력해주세요."
          className="issue-textarea"
        />
      </div>

      <div className="file-input-wrapper">
        <label className="block mb-2 font-medium">
          사진 첨부
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        {issueFiles.length > 0 && (
          <div className="file-count">
            ✓ {issueFiles.length}개의 파일이 선택됨
          </div>
        )}
      </div>

      {currentImages.length > 0 && (
        <div className="mt-4">
          <label className="block mb-2 font-medium">현재 첨부된 이미지</label>
          <div className="attached-images">
            {currentImages
              .filter(image => !deletedImageIds.has(image.id))
              .map((image) => (
                <div key={image.id} className="image-item">
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image-link"
                  >
                    {image.originalName}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleImageDelete(image.id)}
                    className="delete-image-btn"
                    title="이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="manager-service-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="manager-service-checkin-container">
          <div className="service-progress">
            <h2>서비스 진행</h2>

            <div className="details-card">
              <div className="detail-item">
                <span className="label">서비스 옵션</span>
                <span className="value">
                  {reservation.serviceOptionName || '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">가격</span>
                <span className="value">
                  {reservation.totalPrice != null
                    ? reservation.totalPrice.toLocaleString() + '원'
                    : '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">예상 소요시간</span>
                <span className="value">
                  {reservation.totalDuration
                    ? reservation.totalDuration + ' 시간'
                    : '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">시작시간</span>
                <span className="value">
                  {formatDateTime(reservation.startTime)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">주소</span>
                <span className="value">
                  {reservation.address} {reservation.addressDetail}
                </span>
              </div>
            </div>

            <div className="service-progress">
              <h2>체크인/체크아웃 상태</h2>

              <div className="status-cards-container">
                <div className="status-card-item">
                  <div className="status-label">체크인</div>
                  <div
                    className={`status-badge ${체크인완료 ? 'completed' : 'pending'}`}
                  >
                    {체크인완료 ? '완료' : '미완료'}
                  </div>
                </div>
                <div className="status-card-item">
                  <div className="status-label">체크아웃</div>
                  <div
                    className={`status-badge ${체크아웃완료 ? 'completed' : 'pending'}`}
                  >
                    {체크아웃완료 ? '완료' : '미완료'}
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="checkin-button"
                  onClick={handleCheckIn}
                  disabled={!체크인버튼활성}
                >
                  체크인 하기
                </button>
                <button
                  className="checkout-button"
                  onClick={handleCheckOut}
                  disabled={!체크아웃버튼활성}
                >
                  체크아웃 하기
                </button>
              </div>
            </div>

            {!체크아웃버튼활성 && (
              <div className="action-buttons" style={{ marginTop: '12px' }}>
                    <button
                  className="issue-button"
                  onClick={() => setShowIssueModal(true)}
                >
                  {issueData ? '특이사항 수정' : '특이사항 작성'}
                    </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer current="/matching/service-checkin" />

      {/* Check-in Modal */}
      <Modal
        open={showCheckInModal}
        title="체크인 확인"
        message="서비스 체크인을 진행하시겠습니까?"
        onClose={() => setShowCheckInModal(false)}
        onConfirm={confirmCheckIn}
        confirmText={'확인'}
        showCancel={true}
      />

      {/* Check-out Modal */}
      <Modal
        open={showCheckOutModal}
        title="체크아웃"
        message="체크아웃을 진행하시겠습니까?"
        onClose={() => setShowCheckOutModal(false)}
        onConfirm={confirmCheckOut}
        confirmText={loading ? '처리 중...' : '확인'}
        showCancel={true}
      />

      {/* Issue Modal */}
      <Modal
        open={showIssueModal}
        title={issueData ? '특이사항 수정' : '특이사항 작성'}
        onClose={() => {
          setShowIssueModal(false);
          setIssueContent(issueData?.content || '');
          setIssueFiles([]);
          setDeletedImageIds(new Set());
          const imagesWithIds = (issueData?.images || []).map((image, index) => ({
            ...image,
            id: index + 1
          }));
          setCurrentImages(imagesWithIds);
          setIsEdited(false);
        }}
        onConfirm={handleIssueSubmit}
        confirmText={isSubmittingIssue ? '저장 중...' : '저장'}
        confirmDisabled={!isEdited && !issueFiles.length}
        showCancel={true}
      >
        <div className="issue-modal-content">
          {renderIssueModalContent()}
        </div>
      </Modal>
    </div>
  );
};

export default ManagerServiceCheckIn;
