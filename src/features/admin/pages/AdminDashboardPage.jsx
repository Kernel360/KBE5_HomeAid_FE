import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const navigate = useNavigate();

  const handleMatchingManagementClick = () => {
    navigate('/admin/matchingsystem');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-card">
        {/* Admin Header */}
        <div className="admin-header">
          <div className="admin-header-top">
            <div className="admin-header-profile">
              <div className="admin-header-profile-icon">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  preserveAspectRatio="none"
                >
                  <path d="M20 20H0V0H20V20Z" stroke="white" />
                  <path
                    d="M16.6667 10.8333C16.6667 15 13.75 17.0833 10.2834 18.2916C10.1018 18.3532 9.90466 18.3502 9.72504 18.2833C6.25004 17.0833 3.33337 15 3.33337 10.8333V4.99997C3.33337 4.77895 3.42117 4.56699 3.57745 4.41071C3.73373 4.25443 3.94569 4.16663 4.16671 4.16663C5.83337 4.16663 7.91671 3.16663 9.36671 1.89997C9.54325 1.74913 9.76784 1.66626 10 1.66626C10.2322 1.66626 10.4568 1.74913 10.6334 1.89997C12.0917 3.17497 14.1667 4.16663 15.8334 4.16663C16.0544 4.16663 16.2663 4.25443 16.4226 4.41071C16.5789 4.56699 16.6667 4.77895 16.6667 4.99997V10.8333Z"
                    stroke="white"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 9.99992L9.16667 11.6666L12.5 8.33325"
                    stroke="white"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                className="admin-header-profile-text"
                style={{ minWidth: 0 }}
              >
                <p>관리자</p>
                <p>시스템 관리자</p>
              </div>
            </div>
            <div className="admin-notification-icon">
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                preserveAspectRatio="none"
              >
                <path d="M20 20H0V0H20V20Z" stroke="#666666" />
                <path
                  d="M8.55664 17.5C8.70293 17.7533 8.91332 17.9637 9.16668 18.11C9.42003 18.2563 9.70743 18.3333 9.99997 18.3333C10.2925 18.3333 10.5799 18.2563 10.8333 18.11C11.0866 17.9637 11.297 17.7533 11.4433 17.5"
                  stroke="#666666"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.71833 12.7717C2.60947 12.8911 2.53763 13.0394 2.51155 13.1988C2.48547 13.3582 2.50627 13.5218 2.57142 13.6696C2.63658 13.8174 2.74328 13.943 2.87855 14.0313C3.01381 14.1196 3.17182 14.1666 3.33333 14.1667H16.6667C16.8282 14.1668 16.9862 14.1199 17.1216 14.0318C17.2569 13.9437 17.3637 13.8182 17.4291 13.6705C17.4944 13.5228 17.5154 13.3593 17.4895 13.1999C17.4637 13.0405 17.392 12.892 17.2833 12.7726C16.175 11.6301 15 10.4159 15 6.66675C15 5.34067 14.4732 4.0689 13.5355 3.13121C12.5979 2.19353 11.3261 1.66675 10 1.66675C8.67392 1.66675 7.40215 2.19353 6.46447 3.13121C5.52679 4.0689 5 5.34067 5 6.66675C5 10.4159 3.82417 11.6301 2.71833 12.7717Z"
                  stroke="#666666"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <p className="admin-dashboard-title">HomeAid 관리자 대시보드</p>
        </div>

        {/* Real-time Status */}
        <div className="realtime-status-section">
          <p className="section-title">실시간 현황</p>
          <div className="status-cards-row">
            <div className="status-card users">
              <p>1,247</p>
              <p>총 사용자</p>
            </div>
            <div className="status-card managers">
              <p>89</p>
              <p>활성 매니저</p>
            </div>
          </div>
          <div className="status-cards-row">
            <div className="status-card reservations">
              <p>156</p>
              <p>오늘 예약</p>
            </div>
            <div className="status-card pending">
              <p>23</p>
              <p>승인 대기</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <p className="section-title">빠른 작업</p>
          <div className="quick-action-buttons-row">
            <div
              className="quick-action-button"
              onClick={() => navigate('/admin/users')}
            >
              <div className="quick-action-button-icon users-bg">
                <svg
                  width={24}
                  height={25}
                  viewBox="0 0 24 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  preserveAspectRatio="none"
                >
                  <path d="M24 24.5H0V0.5H24V24.5Z" stroke="#F59E0B" />
                  <path
                    d="M16 21.5V19.5C16 18.4391 15.5786 17.4217 14.8284 16.6716C14.0783 15.9214 13.0609 15.5 12 15.5H6C4.93913 15.5 3.92172 15.9214 3.17157 16.6716C2.42143 17.4217 2 18.4391 2 19.5V21.5"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.62793C16.8578 3.8503 17.6174 4.35119 18.1597 5.05199C18.702 5.75279 18.9962 6.61382 18.9962 7.49993C18.9962 8.38604 18.702 9.24707 18.1597 9.94787C17.6174 10.6487 16.8578 11.1496 16 11.3719"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 21.4999V19.4999C21.9993 18.6136 21.7044 17.7527 21.1614 17.0522C20.6184 16.3517 19.8581 15.8515 19 15.6299"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11.5C11.2091 11.5 13 9.70914 13 7.5C13 5.29086 11.2091 3.5 9 3.5C6.79086 3.5 5 5.29086 5 7.5C5 9.70914 6.79086 11.5 9 11.5Z"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>사용자 관리</p>
            </div>
            <div
              className="quick-action-button"
              onClick={() => navigate('/admin/manager-approval')}
            >
              <div className="quick-action-button-icon managers-bg">
                <svg
                  width={24}
                  height={25}
                  viewBox="0 0 24 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  preserveAspectRatio="none"
                >
                  <path d="M24 24.5H0V0.5H24V24.5Z" stroke="#3B82F6" />
                  <path
                    d="M16 11.5L18 13.5L22 9.5"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 21.5V19.5C16 18.4391 15.5786 17.4217 14.8284 16.6716C14.0783 15.9214 13.0609 15.5 12 15.5H6C4.93913 15.5 3.92172 15.9214 3.17157 16.6716C2.42143 17.4217 2 18.4391 2 19.5V21.5"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11.5C11.2091 11.5 13 9.70914 13 7.5C13 5.29086 11.2091 3.5 9 3.5C6.79086 3.5 5 5.29086 5 7.5C5 9.70914 6.79086 11.5 9 11.5Z"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>매니저 승인</p>
            </div>
          </div>
          <div className="quick-action-buttons-row">
            <div
              className="quick-action-button"
              onClick={handleMatchingManagementClick}
            >
              <div className="quick-action-button-icon matching-bg">
                <svg
                  width={24}
                  height={25}
                  viewBox="0 0 24 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  preserveAspectRatio="none"
                >
                  <path d="M24 24.5H0V0.5H24V24.5Z" stroke="#8B5CF6" />
                  <path
                    d="M8 2.5V6.5"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 2.5V6.5"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 4.5H5C3.89543 4.5 3 5.39543 3 6.5V20.5C3 21.6046 3.89543 22.5 5 22.5H19C20.1046 22.5 21 21.6046 21 20.5V6.5C21 5.39543 20.1046 4.5 19 4.5Z"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 10.5H21"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 16.5L11 18.5L15 14.5"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>매칭 관리</p>
            </div>
            <div className="quick-action-button">
              <div className="quick-action-button-icon analytics-bg">
                <svg
                  width={24}
                  height={25}
                  viewBox="0 0 24 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  preserveAspectRatio="none"
                >
                  <path d="M24 24.5H0V0.5H24V24.5Z" stroke="#EF4444" />
                  <path
                    d="M3 3.5V19.5C3 20.0304 3.21071 20.5391 3.58579 20.9142C3.96086 21.2893 4.46957 21.5 5 21.5H21"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 17.5V9.5"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 17.5V5.5"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 17.5V14.5"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>통계 분석</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="system-status-section">
          <p className="section-title">시스템 상태</p>
          <div className="system-status-card">
            <div className="system-status-icon">
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                preserveAspectRatio="none"
              >
                <path d="M16 16H0V0H16V16Z" stroke="white" />
                <path
                  d="M13.3333 4L5.99996 11.3333L2.66663 8"
                  stroke="white"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="system-status-text" style={{ minWidth: 0 }}>
              <p>모든 시스템 정상 작동</p>
              <p>서버 상태: 양호 | 응답시간: 120ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
