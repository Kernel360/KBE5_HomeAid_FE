// src/components/Footer.jsx
import React from 'react';
import { Home, MessageCircle, Star, ClipboardList, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

// TODO: 경로 수정하기
const navItems = [
  { label: '홈', icon: Home, to: '/' },
  { label: '게시판', icon: MessageCircle, to: '/board' },
  { label: '이벤트', icon: Star, to: '/event' },
  { label: '이용내역', icon: ClipboardList, to: '/user/reservations' },
  { label: '더보기', icon: Menu, to: '/' },
];

export default function Footer({ current = '/' }) {
  const navigate = useNavigate();

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
