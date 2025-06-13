// src/components/Footer.jsx
import React from 'react';
import { Home, MessageCircle, Star, ClipboardList, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Footer.css';

export default function Footer({ current = '/' }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 사용자 역할에 따른 네비게이션 메뉴 설정
  const getNavItems = () => {
    if (user?.role === 'ROLE_MANAGER') {
      // 매니저용 메뉴
      return [
        { label: '홈', icon: Home, to: '/' },
        { label: '공지사항', icon: MessageCircle, to: '/board' },
        { label: '이벤트', icon: Star, to: '/event' },
        { label: '매칭내역', icon: ClipboardList, to: '/matching/list' },
        { label: '더보기', icon: Menu, to: '/manager/mypage' },
      ];
    } else {
      // 고객용 메뉴 (기본)
      return [
        { label: '홈', icon: Home, to: '/' },
        { label: '공지사항', icon: MessageCircle, to: '/board' },
        { label: '이벤트', icon: Star, to: '/event' },
        {
          label: '이용내역',
          icon: ClipboardList,
          to: '/customer/reservations',
        },
        { label: '더보기', icon: Menu, to: '/customer/mypage' },
      ];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (to) => {
    navigate(to);
  };

  return (
    <footer className="footer-container">
      <div className="footer-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = current === item.to;

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.to)}
              className={`footer-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="footer-icon">
                <IconComponent size={24} strokeWidth={1.5} />
              </div>
              <span className="footer-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
