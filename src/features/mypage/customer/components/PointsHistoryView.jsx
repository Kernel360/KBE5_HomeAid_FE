import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';



  // 포인트 내역 페이지 컴포넌트
  const PointsHistoryView = ({ onBack, point}) => (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header
        showBackButton={true}
        onBackClick= {onBack}
      />

      <div className="px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900">포인트 내역</h3>
        {/* TODO: 하드코딩된 현재 포인트 값 - API에서 실시간 포인트 조회 필요 */}
        <p className="text-sm text-gray-500 mt-1">
          현재 보유: <span className="font-bold text-orange-600">1,250P</span>
        </p>
      </div>

      <main className="px-6 py-6">
        <div className="space-y-4">
          {/* TODO: pointsHistory 배열을 실제 API 데이터로 교체 필요 */}
          {point.map((point) => (
            <div
              key={point.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{point.reason}</p>
                  <p className="text-sm text-gray-500">{point.date}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${point.type === '적립' ? 'text-blue-600' : 'text-red-600'}`}
                  >
                    {point.amount}P
                  </p>
                  <p className="text-sm text-gray-500">
                    잔액: {point.balance}P
                  </p>
                </div>
              </div>
              <div
                className={`inline-block px-2 py-1 rounded text-xs ${
                  point.type === '적립'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {point.type}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );

  export default PointsHistoryView;