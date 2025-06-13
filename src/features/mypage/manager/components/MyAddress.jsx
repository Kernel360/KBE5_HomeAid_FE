import { ArrowLeft, Plus, MapPin, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';

// 주소 관리 페이지
const MyAddress = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/manager/mypage');
  };

  const handleAddAddress = () => {
    navigate('/manager/mypage/address/register');
  };

  // TODO: API 연동 후 실제 주소 목록으로 교체
  const addresses = [
    {
      id: 1,
      name: '집',
      address: '서울시 강남구 테헤란로 123',
      isDefault: true,
    },
    {
      id: 2,
      name: '회사',
      address: '서울시 강남구 석촌호수로 456',
      isDefault: false,
    },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={handleBack} />

      <main className="px-6 py-6" style={{ paddingTop: '80px' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">주소 관리</h2>
          <button
            onClick={handleAddAddress}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">새 주소 등록</span>
          </button>
        </div>

        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      기본
                    </span>
                  )}
                </div>
                <button className="text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 text-sm ml-7">{addr.address}</p>
            </div>
          ))}
        </div>

        {/* 주소가 없을 때 표시할 메시지 */}
        {addresses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 주소가 없습니다</p>
            <button
              onClick={handleAddAddress}
              className="bg-blue-600 text-black px-6 py-3 rounded-xl font-medium inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />새 주소 등록하기
            </button>
          </div>
        )}
      </main>

      <Footer current="/manager/mypage" />
    </div>
  );
};

export default MyAddress;
