# 🏠 KBE5 HomeAid Frontend

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.8-38B2AC.svg)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.5-orange.svg)](https://zustand-demo.pmnd.rs/)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [사용자 역할별 기능](#-사용자-역할별-기능)
- [주요 페이지](#-주요-페이지)
- [API 연동](#-api-연동)
- [상태 관리](#-상태-관리)
- [컴포넌트 구조](#-컴포넌트-구조)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)

## 🎯 프로젝트 개요

**KBE5 HomeAid Frontend**는 전문 매니저가 제공하는 홈케어 서비스 플랫폼의 프론트엔드 애플리케이션입니다. 고객, 매니저, 관리자가 각각의 역할에 맞는 기능을 사용할 수 있는 통합 플랫폼입니다.

### 핵심 가치

- 🏠 **편리한 홈케어 서비스**: 청소, 돌봄, 에어컨 청소 등 다양한 서비스
- 👥 **전문 매니저 매칭**: 검증된 매니저와의 안전한 매칭
- 💳 **안전한 결제 시스템**: 다양한 결제 수단 지원
- 📱 **반응형 디자인**: 모바일 우선 설계로 모든 기기에서 최적화

## ✨ 주요 기능

### 🔐 인증 및 권한 관리

- **다중 사용자 역할**: 고객(CUSTOMER), 매니저(MANAGER), 관리자(ADMIN)
- **JWT 토큰 기반 인증**: 안전한 세션 관리
- **OAuth 소셜 로그인**: 카카오, 네이버 등 지원
- **권한별 라우트 보호**: 역할에 따른 페이지 접근 제어

### 🏠 서비스 예약 시스템

- **서비스 카테고리 선택**: 청소, 돌봄, 에어컨 청소 등
- **상세 옵션 선택**: 서비스별 세부 옵션 및 추가 서비스
- **실시간 매니저 매칭**: 위치 기반 매니저 추천
- **결제 시스템**: 카드, 카카오페이, 네이버페이 등

### 👨‍💼 매니저 관리 시스템

- **서비스 체크인**: 현장 도착 및 서비스 시작/완료
- **매칭 요청 관리**: 고객 요청에 대한 응답
- **정산 관리**: 서비스 완료 후 정산 처리
- **프로필 관리**: 개인정보 및 서비스 정보 관리

### 🛠️ 관리자 대시보드

- **통계 대시보드**: 실시간 서비스 현황 및 매출 통계
- **고객 관리**: 고객 목록, 결제 내역, 문의 관리
- **매니저 관리**: 매니저 목록, 정산 관리, 승인 처리
- **예약 관리**: 전체 예약 현황 및 매칭 관리
- **리뷰 관리**: 고객 리뷰 관리 및 응답

### 📱 사용자 경험

- **실시간 알림**: SSE(Server-Sent Events) 기반 실시간 알림
- **반응형 디자인**: 모바일 우선 설계
- **다크모드 지원**: 테마 토글 기능
- **지도 연동**: Google Maps API 기반 위치 서비스

## 🛠️ 기술 스택

### Frontend Framework

- **React 19.1.0**: 최신 React 기능 활용
- **Vite 6.3.5**: 빠른 개발 환경 및 빌드 도구
- **React Router DOM 7.6.0**: 클라이언트 사이드 라우팅

### UI/UX

- **Tailwind CSS 4.1.8**: 유틸리티 퍼스트 CSS 프레임워크
- **Lucide React 0.511.0**: 아이콘 라이브러리
- **React DatePicker 8.4.0**: 날짜 선택 컴포넌트

### 상태 관리

- **Zustand 5.0.5**: 경량 상태 관리 라이브러리
- **React Hooks**: 함수형 컴포넌트 상태 관리

### 차트 및 데이터 시각화

- **Chart.js 4.5.0**: 데이터 시각화
- **React Chart.js 2 5.3.0**: React용 Chart.js 래퍼

### 지도 및 위치 서비스

- **@react-google-maps/api 2.20.6**: Google Maps React 컴포넌트

### 유틸리티

- **Axios 1.9.0**: HTTP 클라이언트
- **clsx 2.1.1**: 조건부 클래스명 유틸리티
- **html2canvas 1.4.1**: HTML을 이미지로 변환
- **jspdf 3.0.1**: PDF 생성

### 개발 도구

- **TypeScript 5.8.3**: 정적 타입 검사
- **ESLint**: 코드 품질 관리
- **Prettier 3.5.3**: 코드 포맷팅

## 📁 프로젝트 구조

```
src/
├── api/                    # API 설정 및 클라이언트
│   ├── config/
│   │   └── api.js         # API 기본 설정
│   └── index.js           # API 인스턴스
├── app/                    # 앱 레벨 컴포넌트
├── assets/                 # 정적 자산
│   ├── db/                # 데이터베이스 파일
│   └── images/            # 이미지 파일
├── components/             # 공통 컴포넌트
│   ├── Button.jsx         # 버튼 컴포넌트
│   ├── Footer.jsx         # 푸터 컴포넌트
│   ├── Header.jsx         # 헤더 컴포넌트
│   ├── Modal.jsx          # 모달 컴포넌트
│   └── ThemeToggle.jsx    # 테마 토글
├── features/              # 기능별 모듈
│   ├── admin/             # 관리자 기능
│   │   ├── components/    # 관리자 컴포넌트
│   │   ├── pages/         # 관리자 페이지
│   │   ├── services/      # 관리자 API 서비스
│   │   └── utils/         # 관리자 유틸리티
│   ├── auth/              # 인증 기능
│   │   ├── components/    # 인증 컴포넌트
│   │   ├── pages/         # 인증 페이지
│   │   ├── routes/        # 인증 라우트
│   │   └── services/      # 인증 서비스
│   ├── board/             # 게시판 기능
│   ├── main/              # 메인 페이지
│   ├── matching/          # 매칭 기능
│   ├── mypage/            # 마이페이지
│   ├── payment/           # 결제 기능
│   ├── reservation/       # 예약 기능
│   ├── review/            # 리뷰 기능
│   └── manager/           # 매니저 기능
├── routes/                # 라우팅 설정
│   ├── AppRoutes.jsx      # 메인 라우트
│   ├── ProtectedRoute.jsx # 보호된 라우트
│   └── protectedAppRoutes.jsx # 권한별 라우트
├── shared/                # 공유 유틸리티
│   ├── constants/         # 상수 정의
│   ├── hooks/             # 커스텀 훅
│   └── utils/             # 유틸리티 함수
├── stores/                # 상태 관리
│   ├── authStore.js       # 인증 상태
│   ├── themeStore.js      # 테마 상태
│   └── ...                # 기타 상태 스토어
├── App.jsx                # 메인 앱 컴포넌트
└── main.jsx               # 앱 진입점
```

## 🚀 설치 및 실행

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/Kernel360/KBE5_HomeAid_FE.git

# 프로젝트 디렉토리 이동
cd KBE5_HomeAid_FE

# 의존성 설치
npm install
# 또는
yarn install
```

### 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev
# 또는
yarn dev
```

### 빌드

```bash
# 프로덕션 빌드
npm run build
# 또는
yarn build

# 빌드 미리보기
npm run preview
# 또는
yarn preview
```

### 코드 품질

```bash
# 린트 검사
npm run lint
# 또는
yarn lint
```

## 👥 사용자 역할별 기능

### 🏠 고객 (CUSTOMER)

- **서비스 예약**: 다양한 홈케어 서비스 예약
- **결제 관리**: 안전한 온라인 결제
- **예약 관리**: 예약 내역 조회 및 취소
- **리뷰 작성**: 서비스 후기 및 평점
- **문의 관리**: 1:1 문의 작성 및 조회
- **주소 관리**: 서비스 주소 등록 및 관리

### 👨‍💼 매니저 (MANAGER)

- **매칭 관리**: 고객 요청에 대한 응답
- **서비스 체크인**: 현장 도착 및 서비스 진행
- **정산 관리**: 서비스 완료 후 정산 처리
- **프로필 관리**: 개인정보 및 서비스 정보 관리
- **문의 관리**: 고객 문의에 대한 응답

### 👨‍💻 관리자 (ADMIN)

- **대시보드**: 실시간 통계 및 현황 모니터링
- **고객 관리**: 고객 목록, 결제 내역 관리
- **매니저 관리**: 매니저 승인, 정산 관리
- **예약 관리**: 전체 예약 현황 및 매칭 관리
- **통계 분석**: 매출, 서비스, 고객 통계
- **리뷰 관리**: 고객 리뷰 관리 및 응답

## 📱 주요 페이지

### 🏠 메인 페이지

- **홈페이지**: 서비스 소개 및 주요 기능 안내
- **이벤트 페이지**: 진행중인 이벤트 및 프로모션
- **공지사항**: 서비스 관련 공지 및 FAQ

### 🔐 인증 페이지

- **로그인**: 일반 로그인 및 소셜 로그인
- **회원가입**: 고객/매니저 선택 및 단계별 가입
- **OAuth 콜백**: 소셜 로그인 처리

### 🛒 예약 시스템

- **서비스 선택**: 카테고리별 서비스 선택
- **옵션 선택**: 서비스별 세부 옵션 선택
- **예약 정보**: 날짜, 시간, 주소 입력
- **결제**: 다양한 결제 수단 지원

### 📊 관리자 대시보드

- **통계 대시보드**: 실시간 데이터 시각화
- **고객 관리**: 고객 목록 및 상세 정보
- **매니저 관리**: 매니저 승인 및 정산
- **예약 관리**: 전체 예약 현황 관리

## 🔌 API 연동

### API 클라이언트 설정

```javascript
// src/api/config/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);
```

### 주요 API 엔드포인트

- **인증**: `/auth/signin`, `/auth/signup`, `/auth/refresh`
- **서비스**: `/services`, `/services/{id}/options`
- **예약**: `/reservations`, `/reservations/{id}`
- **결제**: `/payments`, `/payments/{id}`
- **매칭**: `/matching`, `/matching/{id}`
- **관리자**: `/admin/dashboard`, `/admin/customers`, `/admin/managers`

## 🗃️ 상태 관리

### Zustand 스토어 구조

```javascript
// src/stores/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setUser: (user) => set({ user }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null }),
}));
```

### 주요 스토어

- **authStore**: 사용자 인증 정보
- **themeStore**: 다크모드/라이트모드 설정
- **reservationStore**: 예약 관련 상태
- **matchingStore**: 매칭 관련 상태
- **alertStore**: 실시간 알림 상태

## 🧩 컴포넌트 구조

### 공통 컴포넌트

- **Button**: 재사용 가능한 버튼 컴포넌트
- **Modal**: 모달 다이얼로그 컴포넌트
- **Header**: 네비게이션 헤더
- **Footer**: 하단 네비게이션
- **ThemeToggle**: 테마 전환 토글

### 기능별 컴포넌트

- **관리자**: Dashboard, CustomerList, ManagerList 등
- **예약**: ServiceOption, ServiceRequest, Payment 등
- **매칭**: MatchingList, MatchingDetail, ServiceCheckIn 등
- **리뷰**: ReviewList, ReviewWrite, ReviewDetail 등

## 🛠️ 개발 가이드

### 코드 스타일

- **ESLint**: 코드 품질 및 일관성 유지
- **Prettier**: 코드 포맷팅 자동화
- **TypeScript**: 정적 타입 검사

### 폴더 구조 규칙

- **features/**: 기능별 모듈화
- **components/**: 재사용 가능한 컴포넌트
- **pages/**: 페이지 컴포넌트
- **services/**: API 서비스
- **utils/**: 유틸리티 함수

### 상태 관리 패턴

- **Zustand**: 경량 상태 관리
- **React Hooks**: 컴포넌트 상태
- **Context API**: 전역 상태 (필요시)

### 라우팅 구조

- **공개 라우트**: 인증 불필요
- **보호된 라우트**: 인증 및 권한 필요
- **중첩 라우트**: 레이아웃 공유

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 환경 변수 설정

```bash
# .env.local
VITE_API_BASE_URL=https://api.example.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 빌드 최적화

- **코드 스플리팅**: 라우트별 청크 분리
- **이미지 최적화**: WebP 포맷 사용
- **번들 분석**: 빌드 크기 최적화

## 📞 문의

- **프로젝트 이슈**: [GitHub Issues](https://github.com/Kernel360/KBE5_HomeAid_FE/issues)
- **문의사항**: 프로젝트 관리자에게 연락

---

**KBE5 HomeAid Frontend** - 전문 매니저가 제공하는 홈케어 서비스 플랫폼 🏠✨
