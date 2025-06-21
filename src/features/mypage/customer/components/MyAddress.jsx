import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, MapPin, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';
import { useAddressStore } from '../../../../stores/addressStore';

// 주소 관리 페이지
const MyAddress = () => {
  const navigate = useNavigate();
  const { addresses, isLoading, error, fetchAddresses, deleteAddress, clearError } = useAddressStore();
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 주소 목록 가져오기
    fetchAddresses();
  }, [fetchAddresses]);

  const handleBack = () => {
    navigate('/customer/mypage');
  };

  const handleAddAddress = () => {
    navigate('/customer/mypage/address/register');
  };

  const handleEditAddress = (addressId) => {
    navigate(`/customer/mypage/address/edit/${addressId}`);
    setShowMenu(null);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('정말로 이 주소를 삭제하시겠습니까?')) {
      try {
        await deleteAddress(addressId);
        alert('주소가 삭제되었습니다.');
      } catch {
        alert('주소 삭제에 실패했습니다.');
      }
    }
    setShowMenu(null);
  };

  const toggleMenu = (addressId) => {
    setShowMenu(showMenu === addressId ? null : addressId);
  };

  // 에러가 있으면 표시
  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={handleBack} />

      <main className="px-6 py-6" style={{ paddingTop: '80px' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">주소 관리</h2>
          <button
            onClick={handleAddAddress}
            className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">새 주소 등록</span>
          </button>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">주소 목록을 불러오는 중...</p>
          </div>
        )}

        {/* 주소 목록 */}
        {!isLoading && (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">{addr.alias}</span>
                  </div>
                  <div className="relative">
                    <button 
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => toggleMenu(addr.id)}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* 드롭다운 메뉴 */}
                    {showMenu === addr.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                        <button
                          onClick={() => handleEditAddress(addr.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm ml-7">{addr.fullAddress}</p>
              </div>
            ))}
          </div>
        )}

        {/* 주소가 없을 때 표시할 메시지 */}
        {!isLoading && addresses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">등록된 주소가 없습니다</p>
            <button
              onClick={handleAddAddress}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="w-5 h-5 mr-2" />새 주소 등록하기
            </button>
          </div>
        )}
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default MyAddress;
