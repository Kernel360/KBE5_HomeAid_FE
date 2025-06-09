import { create } from 'zustand';

const useSignUpStore = create((set) => ({
  // 고객 회원가입 데이터 초기 상태
  customerSignUpData: {
    email: '',
    password: '',
    name: '',
    phone: '',
    birth: '', // YYYY-MM-DD 형식의 문자열
    gender: '', // 'MALE' 또는 'FEMALE'
    address: '',
    addressDetail: '',
  },
  // 매니저 회원가입 데이터 초기 상태
  managerSignUpData: {
    email: '',
    password: '',
    name: '',
    phone: '',
    birth: '', // YYYY-MM-DD 형식의 문자열
    gender: '', // 'MALE' 또는 'FEMALE'
    businessNumber: '', // 사업자 등록 번호
    experience: '', // 경력 사항
    // 파일 정보는 별도 처리가 필요할 수 있음
  },
  // 사용자 유형 (customer 또는 manager)
  userType: '',

  // 고객 회원가입 데이터 업데이트 함수
  setCustomerSignUpData: (data) =>
    set((state) => ({
      customerSignUpData: { ...state.customerSignUpData, ...data },
    })),

  // 매니저 회원가입 데이터 업데이트 함수
  setManagerSignUpData: (data) =>
    set((state) => ({
      managerSignUpData: { ...state.managerSignUpData, ...data },
    })),

  // 사용자 유형 설정 함수
  setUserType: (type) => set({ userType: type }),

  // 회원가입 데이터 초기화 함수 (회원가입 완료 또는 취소 시 사용)
  resetSignUpData: () =>
    set({
      customerSignUpData: {
        email: '',
        password: '',
        name: '',
        phone: '',
        birth: '',
        gender: '',
        address: '',
        addressDetail: '',
      },
      managerSignUpData: {
        email: '',
        password: '',
        name: '',
        phone: '',
        birth: '',
        gender: '',
        businessNumber: '',
        experience: '',
      },
      userType: '',
    }),
}));

export default useSignUpStore; 