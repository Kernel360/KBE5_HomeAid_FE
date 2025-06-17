 // TODO: 쿠폰 더미 데이터 - 실제 API 연동 필요
  // API: GET /api/customer/coupons
  // Response: { coupons: [{ id, name, discount, minAmount, expiry, status }] }
  export const coupons = [
    {
      id: 1,
      name: '신규 회원 20% 할인',
      discount: '20%',
      minAmount: 30000,
      expiry: '2025-10-28',
      status: 'available',
    },
    {
      id: 2,
      name: '청소 서비스 5,000원 할인',
      discount: '5,000원',
      minAmount: 40000,
      expiry: '2025-10-15',
      status: 'available',
    },
    {
      id: 3,
      name: '첫 주문 30% 할인',
      discount: '30%',
      minAmount: 50000,
      expiry: '2025-01-20',
      status: 'expired',
    },
  ];
  export default coupons;