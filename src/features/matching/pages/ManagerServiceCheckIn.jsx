import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ManagerServiceCheckIn.css'; // Import CSS file for styling
// import api from '@/services/apiClient'; // Import api client
import { useMatchingRequestStatus } from '../../../contexts/MatchingRequestStatusContext';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';

const ManagerServiceCheckIn = () => {
  const navigate = useNavigate(); // Get navigate function
  const { requestAccepted } = useMatchingRequestStatus(); // Get the shared state from context

  // Placeholder data - replace with actual data fetching logic
  const [serviceDetails, setServiceDetails] = useState({
    customerName: '김고객',
    serviceType: '대청소',
    dateTime: '2023-06-15 14:00',
    address: '서울시 강남구 테헤란로 123',
    checkInStatus: '미완료',
    checkOutStatus: '미완료',
  });

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  // TODO: File Upload State and Handlers (remove or implement later)
  // const [showFileUpload, setShowFileUpload] = useState(false);
  // const [selectedFile, setSelectedFile] = useState(null);

  // TODO: Fetch actual service details on component mount
  // useEffect(() => {
  //   const fetchServiceDetails = async () => {
  //     try {
  //       const response = await api.get('/api/v1/manager/service-details'); // Replace with actual endpoint
  //       if (response.data) {
  //         setServiceDetails(response.data);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch service details:', error);
  //       alert('서비스 상세 정보를 불러오는데 실패했습니다.');
  //     }
  //   };
  //   fetchServiceDetails();
  // }, []);

  const handleMatchingHistoryClick = () => {
    navigate('/matching/matching-request'); // Navigate to the new matching request page
  };

  const handleCheckIn = () => {
    setShowCheckInModal(true);
  };

  const handleCheckOut = () => {
    setShowCheckOutModal(true);
  };

  const confirmCheckIn = async () => {
    try {
      // TODO: Replace with actual check-in API call
      console.log('체크인 확인됨. API 호출 예정.');
      // const response = await api.patch('/api/v1/manager/checkin', { serviceId: serviceDetails.id }); // Replace with actual endpoint and payload

      // Assuming API call is successful, update state
      setServiceDetails((prevDetails) => ({
        ...prevDetails,
        checkInStatus: '완료',
      }));
      alert('체크인이 완료되었습니다.');
    } catch (error) {
      console.error('체크인 실패:', error);
      alert('체크인에 실패했습니다.');
    } finally {
      setShowCheckInModal(false);
    }
  };

  const confirmCheckOut = async () => {
    try {
      // TODO: Replace with actual check-out API call
      console.log('체크아웃 확인됨. API 호출 예정.');
      // const response = await api.patch('/api/v1/manager/checkout', { serviceId: serviceDetails.id }); // Replace with actual endpoint and payload

      // Assuming API call is successful, update state
      setServiceDetails((prevDetails) => ({
        ...prevDetails,
        checkOutStatus: '완료',
      }));
      alert('체크아웃이 완료되었습니다.');
    } catch (error) {
      console.error('체크아웃 실패:', error);
      alert('체크아웃에 실패했습니다.');
    } finally {
      setShowCheckOutModal(false);
    }
  };

  const cancelCheckIn = () => {
    setShowCheckInModal(false);
  };

  const cancelCheckOut = () => {
    setShowCheckOutModal(false);
  };

  // TODO: File Upload State and Handlers (remove or implement later)
  // const handleFileSelect = (event) => {
  //   // Get the selected file from the input
  //   const file = event.target.files ? event.target.files[0] : null;
  //   setSelectedFile(file);
  // };

  // const handleFileUpload = async () => {
  //   if (!selectedFile) {
  //     alert('파일을 선택해주세요.');
  //     return;
  //   }
  //   try {
  //     // TODO: Implement actual file upload API call
  //     console.log('파일 등록 버튼 클릭됨. 파일 업로드 API 호출 예정:', selectedFile);
  //     // Example using FormData for file upload:
  //     // const formData = new FormData();
  //     // formData.append('file', selectedFile);
  //     // const response = await api.post('/api/v1/upload', formData); // Replace with actual endpoint
  //     // Assuming file upload and registration is successful, update checkout status
  //     setServiceDetails(prevDetails => ({
  //       ...prevDetails,
  //       checkOutStatus: '완료',
  //     }));
  //     alert('파일 등록 및 체크아웃이 완료되었습니다.');
  //     setShowFileUpload(false); // Hide file upload interface
  //     setSelectedFile(null); // Clear selected file
  //   } catch (error) {
  //     console.error('파일 업로드 실패:', error);
  //     alert('파일 업로드에 실패했습니다.');
  //   } 논리입니다.
  // };

  const isCheckInComplete = serviceDetails.checkInStatus === '완료';
  const isCheckOutComplete = serviceDetails.checkOutStatus === '완료';
  // 버튼 활성화는 매칭 요청이 수락되었는지 여부와 체크인/체크아웃 상태에만 의존합니다.
  const isCheckinButtonEnabled =
    requestAccepted && !isCheckInComplete && !isCheckOutComplete;
  const isCheckoutButtonEnabled =
    requestAccepted && isCheckInComplete && !isCheckOutComplete;

  // 디버깅을 위한 콘솔 출력
  console.log('ManagerServiceCheckIn 상태:', {
    requestAccepted,
    isCheckInComplete,
    isCheckOutComplete,
    isCheckinButtonEnabled,
    isCheckoutButtonEnabled,
  });

  return (
    <div className="manager-service-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="manager-service-checkin-container">
          {/* <h1>매니저 화면</h1> */}

          <div className="matching-details">
            <button
              className="matching-history-button"
              onClick={handleMatchingHistoryClick}
            >
              매칭 내역 확인
            </button>
          </div>

          {/* Map will be placed here */}
          <div className="service-map">
            {/* TODO: Integrate map library and display map here */}
            {/* Example: <MapComponent address={serviceDetails.address} /> */}
            지도가 표시될 영역
          </div>

          <div className="service-progress">
            <h2>서비스 진행</h2>
            {/* TODO: Dynamically update status badge text */}
            <span className="status-badge">
              {isCheckInComplete
                ? isCheckOutComplete
                  ? '서비스 완료'
                  : '서비스 진행 중'
                : '체크인 필요'}
            </span>

            <div className="details-card">
              <div className="detail-item">
                <span className="label">고객명</span>
                <span className="value">{serviceDetails.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="label">서비스 유형</span>
                <span className="value">{serviceDetails.serviceType}</span>
              </div>
              <div className="detail-item">
                <span className="label">날짜 및 시간</span>
                <span className="value">{serviceDetails.dateTime}</span>
              </div>
              <div className="detail-item">
                <span className="label">주소</span>
                <span className="value">{serviceDetails.address}</span>
              </div>
            </div>
          </div>

          <div className="checkin-checkout-status">
            <h3>체크인/체크아웃 상태</h3>
            <div className="status-card">
              <div className="status-item">
                <span className="label">체크인</span>
                <span
                  className="value"
                  style={{ color: isCheckInComplete ? 'green' : 'red' }}
                >
                  {serviceDetails.checkInStatus}
                </span>
              </div>
              <div className="status-item">
                <span className="label">체크아웃</span>
                <span
                  className="value"
                  style={{ color: isCheckOutComplete ? 'green' : 'red' }}
                >
                  {serviceDetails.checkOutStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="checkin-button"
              onClick={handleCheckIn}
              disabled={!isCheckinButtonEnabled}
            >
              체크인 하기
            </button>
            <button
              className="checkout-button"
              onClick={handleCheckOut}
              disabled={!isCheckoutButtonEnabled}
            >
              체크아웃 하기
            </button>
          </div>

          {/* Check-in Confirmation Modal */}
          {showCheckInModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <p>체크인 하시겠습니까?</p>
                <button onClick={confirmCheckIn}>확인</button>
                <button onClick={cancelCheckIn}>취소</button>
              </div>
            </div>
          )}

          {/* Check-out Confirmation Modal */}
          {showCheckOutModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <p>체크아웃 하시겠습니까?</p>
                <button onClick={confirmCheckOut}>확인</button>
                <button onClick={cancelCheckOut}>취소</button>
              </div>
            </div>
          )}

          {/* File Upload Interface (TODO: Implement or remove) */}
          {/*
          {showFileUpload && (
            <div className="modal-overlay"> 
              <div className="modal-content"> 
                <p>파일을 등록해주세요.</p>
                <input type="file" onChange={handleFileSelect} />
                {selectedFile && <p>선택된 파일: {selectedFile.name}</p>}
                <button onClick={handleFileUpload} disabled={!selectedFile}>파일 등록</button>
              </div>
            </div>
          )}
          */}
        </div>
      </div>
      <Footer current="/matching/service-checkin" />
    </div>
  );
};

export default ManagerServiceCheckIn;
