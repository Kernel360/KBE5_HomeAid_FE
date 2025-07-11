import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// 개발/테스트용 결제 유틸리티 함수들을 전역으로 등록
// import './utils/paymentUtils.js';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <>
    {/* <BrowserRouter> */}
    <App />
    {/* </BrowserRouter> */}
    </>
  // </React.StrictMode>
);
