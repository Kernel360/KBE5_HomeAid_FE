  // TODO: 포인트 내역 더미 데이터 - 실제 API 연동 필요
  // API: GET /api/customer/points/history
  // Response: { points: [{ id, date, type, amount, reason, balance }] }
  const pointsHistory = [
    {
      id: 1,
      date: '2025-05-15',
      type: '적립',
      amount: '+500',
      reason: '서비스 이용 적립',
      balance: 1250,
    },
    {
      id: 2,
      date: '2025-05-10',
      type: '사용',
      amount: '-300',
      reason: '할인 쿠폰 구매',
      balance: 750,
    },
    {
      id: 3,
      date: '2025-05-05',
      type: '적립',
      amount: '+800',
      reason: '신규 가입 보너스',
      balance: 1050,
    },
    {
      id: 4,
      date: '2025-05-01',
      type: '적립',
      amount: '+250',
      reason: '리뷰 작성 적립',
      balance: 250,
    },
  ];

  export default pointsHistory;