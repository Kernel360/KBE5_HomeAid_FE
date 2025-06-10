# 예약 시스템 인증 정보 활용 가이드

## 🔐 인증 시스템 개요

로그인한 고객의 토큰값과 정보를 예약 시스템에서 완전히 활용할 수 있습니다.

## 🎯 **완료: 로그인 고객 이름 표시 기능 (3개 페이지)**

### **📱 구현된 페이지들**

#### **1. UserServiceOption (`/user/service-option`)**

- 로그인 후 첫 번째 페이지
- 개인화된 인사말: "안녕하세요, [이름]님!"
- 환영 메시지와 고객 배지 표시

#### **2. UserServiceSubOption (`/user/service-sub-option`)** ⭐️ NEW

- 청소 서비스 상세 선택 페이지
- 동적 인사말: "[이름]님, 어떤 청소 서비스가 필요하신가요?"
- 사용자 정보 기반 개인화된 경험

#### **3. UserServiceRequest (`/user/service-request`)** ✅ 기존 구현

- 서비스 요청서 작성 페이지
- 예약자 정보 배너: "예약자: [이름]님 (고객)"
- 로그인 상태 자동 확인 및 리다이렉트

### **🔧 공통 구현 사항**

**1. 인증 상태 관리**

```javascript
// 모든 페이지에서 공통 사용
const { user, accessToken } = useAuthStore();

// 로그인 상태 확인
React.useEffect(() => {
  if (!user || !accessToken) {
    navigate('/auth/signin');
  }
}, [user, accessToken, navigate]);
```

**2. 안전한 이름 처리**

```javascript
const getUserGreeting = () => {
  if (!user) return '안녕하세요, 고객님!';

  let userName = user.name || user.phone || '고객';

  // 중복 "님" 방지
  if (userName.endsWith('님')) {
    userName = userName.slice(0, -1);
  }

  return `안녕하세요, ${userName}님!`;
};
```

**3. 일관된 UI/UX**

- 모든 페이지에서 동일한 스타일링
- 사용자 배지와 환영 메시지
- 그라데이션 디자인 적용

## 🎯 **NEW: 로그인 고객 이름 표시 기능**

### **🐛 문제 해결: "고객님님" 중복 문제**

**문제**: 사용자 이름이 "고객님님"으로 표시되는 중복 "님" 문제
**원인**: 기본값에 이미 "님"이 포함되어 있는데 추가로 "님"을 붙여서 발생

**해결책**:

```javascript
const getUserGreeting = () => {
  if (!user) return '안녕하세요, 고객님!';

  // 기본값을 '고객'으로 설정 (님 제거)
  let userName = user.name || user.phone || '고객';

  // 이미 "님"이 붙어있다면 제거하여 중복 방지
  if (userName.endsWith('님')) {
    userName = userName.slice(0, -1);
  }

  return `안녕하세요, ${userName}님!`;
};
```

### **🧪 개발/테스트 기능**

**1. 다양한 테스트 케이스**

- 정상 사용자 (김철수): 실제 이름이 있는 경우
- 이름 없는 사용자: 전화번호만 있는 경우
- "박고객님": 이미 "님"이 붙은 이름의 경우

**2. 실시간 디버그 정보**

- 현재 로그인된 사용자 정보 표시
- 실제 표시되는 인사말 미리보기
- 로그아웃 버튼으로 상태 초기화

**3. 콘솔 로그**

- 백엔드 응답에서 이름 관련 필드 확인
- 이름 추출 과정 상세 로그
- 테스트 사용자 설정 시 예상 결과 출력

### **UserServiceOption 페이지 (`/user/service-option`)**

로그인 후 고객이 처음 보는 페이지에서 개인화된 인사말을 표시합니다:

```jsx
// 동적 인사말 생성
const getUserGreeting = () => {
  if (!user) return '안녕하세요, 고객님!';

  const userName = user.name || user.phone || '고객님';
  return `안녕하세요, ${userName}님!`;
};

// UI 표시
<h1 className="greeting-text">{getUserGreeting()}</h1>;
{
  user && (
    <div className="user-welcome-info">
      <p className="welcome-message">오늘도 깔끔한 하루 되세요! ✨</p>
      <span className="user-badge">고객</span>
    </div>
  );
}
```

### **사용자 정보 우선순위**

1. `user.name` (백엔드에서 제공하는 실제 이름)
2. `user.phone` (로그인에 사용한 전화번호)
3. `'고객님'` (기본값)

### **로그인 흐름과 사용자 정보 저장**

```javascript
// SignInPage.jsx에서 로그인 성공 시
const user = {
  userId: data.userId || data.id,
  role: data.role,
  name: data.name || data.username || data.customerName || data.managerName,
  phone: data.phone || phone,
  email: data.email,
  ...data, // 기타 모든 백엔드 응답 포함
};

// 이름이 없는 경우 기본값 설정
if (!user.name && user.role === 'ROLE_CUSTOMER') {
  user.name = '고객';
}

useAuthStore.getState().setUser(user);
```

## 📋 인증 정보 활용 방법

### 1. **토큰 자동 포함**

```javascript
// src/features/reservation/api/customerAPI.js
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

### 2. **사용자 정보 접근**

```javascript
// UserServiceRequest.jsx
import { useAuthStore } from '../../../stores/authStore';

const { user, accessToken } = useAuthStore();
// user: { userId, role, name, phone, ... }
// accessToken: JWT 토큰
```

### 3. **예약 시 인증 확인**

```javascript
const handleSubmit = async () => {
  // 로그인 확인
  if (!user || !accessToken) {
    alert('로그인이 필요합니다.');
    navigate('/auth/signin');
    return;
  }

  // 예약 생성 (토큰이 자동으로 헤더에 포함됨)
  const reservation = await createReservation(reservationData);
};
```

## 🎯 활용 가능한 인증 정보

### **사용자 정보 (user 객체)**

- `userId`: 사용자 고유 ID
- `role`: 사용자 권한 (ROLE_CUSTOMER, ROLE_MANAGER, ROLE_ADMIN)
- `name`: 사용자 이름
- `phone`: 전화번호
- 기타 백엔드에서 제공하는 사용자 정보

### **토큰 정보**

- `accessToken`: JWT 액세스 토큰
- 자동으로 모든 API 요청 헤더에 포함
- 백엔드에서 사용자 인증 및 식별에 사용

## 🛡️ 보안 기능

### **자동 인증 확인**

- 토큰이 없으면 로그인 페이지로 리다이렉트
- 401 에러 시 자동 로그아웃 처리
- 권한별 페이지 접근 제어

### **토큰 자동 갱신**

- 토큰 만료 시 자동 refresh 시도
- refresh 실패 시 로그인 페이지로 이동

## 📱 UI 활용

### **사용자 정보 표시**

```jsx
{
  user && (
    <div className="user-info-banner">
      <span>예약자: {user.name || user.phone || '고객님'}</span>
      <span>({user.role === 'ROLE_CUSTOMER' ? '고객' : user.role})</span>
    </div>
  );
}
```

## 🔄 백엔드 연동

### **자동 사용자 식별**

- JWT 토큰을 통해 백엔드에서 자동으로 사용자 식별
- `customerId`는 별도로 전송할 필요 없음
- 예약 데이터에 사용자 정보가 자동 연결

### **API 요청 예시**

```javascript
// 프론트엔드에서 보내는 데이터
const reservationData = {
  subOptionId: 1,
  requestedDate: '2024-01-15',
  requestedTime: '14:00:00',
  // customerId는 JWT 토큰으로 자동 인식
};

// 백엔드에서 받는 실제 데이터
// JWT 토큰 → 사용자 식별 → customerId 자동 추가
```

## ✅ 완료된 기능

- ✅ 토큰 자동 포함 (API 헤더)
- ✅ 사용자 정보 표시 (UI)
- ✅ 로그인 상태 확인
- ✅ 자동 리다이렉트 (미인증 시)
- ✅ 권한별 접근 제어
- ✅ 토큰 만료 처리

## 🚀 사용 방법

1. **로그인 완료** → `authStore`에 사용자 정보 저장
2. **예약 페이지 접근** → 자동 인증 확인
3. **예약 정보 입력** → 사용자 정보 자동 표시
4. **예약 생성** → 토큰과 함께 API 요청
5. **백엔드 처리** → JWT 토큰으로 사용자 식별 후 예약 생성

모든 예약 과정에서 로그인한 고객의 인증 정보가 자동으로 활용됩니다! 🎉
