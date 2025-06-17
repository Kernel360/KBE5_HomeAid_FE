import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';


const CouponsView = ({ onBack, coupons}) => {
    return (
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
                onBackClick = {onBack}
            />

            <div className="px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900">쿠폰함</h3>
                {/* TODO: 하드코딩된 사용가능 쿠폰 개수 - API에서 실시간 쿠폰 개수 조회 필요 */}
                <p className="text-sm text-gray-500 mt-1">
                    사용 가능한 쿠폰:{' '}
                    <span className="font-bold text-green-600">2장</span>
                </p>
            </div>

            <main className="px-6 py-6">
                <div className="space-y-4">
                    {/* TODO: coupons 배열을 실제 API 데이터로 교체 필요 */}
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className={`rounded-lg border p-4 ${coupon.status === 'available'
                                    ? 'bg-white border-green-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4
                                        className={`font-semibold ${coupon.status === 'available' ? 'text-gray-900' : 'text-gray-500'}`}
                                    >
                                        {coupon.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        최소 주문금액: {coupon.minAmount.toLocaleString()}원
                                    </p>
                                </div>
                                <div
                                    className={`text-right ${coupon.status === 'available' ? 'text-green-600' : 'text-gray-400'}`}
                                >
                                    <p className="text-lg font-bold">{coupon.discount}</p>
                                    <p className="text-xs">할인</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">만료일: {coupon.expiry}</p>
                                <div
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${coupon.status === 'available'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    {coupon.status === 'available' ? '사용 가능' : '만료됨'}
                                </div>
                            </div>

                            {coupon.status === 'available' && (
                                <button className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                    {/* TODO: 쿠폰 사용 기능 구현 필요 - API: POST /api/customer/coupons/use */}
                                    사용하기
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <Footer current="/customer/mypage" />
        </div>
    );

}

export default CouponsView;