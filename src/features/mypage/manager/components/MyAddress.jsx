import { ArrowLeft, Plus, MapPin, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
      <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">주소 관리</h1>
        </div>
        <button onClick={handleAddAddress}>
          <Plus className="w-6 h-6 text-blue-600" />
        </button>
      </header>

      <main className="px-6 py-6">
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
                <button className="text-gray-400" onClick={handleAddAddress}>
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 text-sm ml-7">{addr.address}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default MyAddress;
