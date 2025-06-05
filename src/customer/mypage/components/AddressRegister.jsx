import { ArrowLeft, MapPin, Search } from "lucide-react";
import { useState } from "react";

const AddressRegister = ({ onBack, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        detail: '',
        isDefault: false
    });

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
                <button onClick={onBack} className="mr-4">
                    <ArrowLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">주소 상세</h1>
            </header>

            <main className="px-6 py-6">
                <div className="space-y-6">
                    {/* 주소 등록 */}
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-600 text-sm mb-6">주소 입력 시 지도가 표시됩니다</p>
                        <button
                            type="button"
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center mx-auto"
                        >
                            <MapPin className="w-5 h-5 mr-2" />
                            현재 위치 사용하기
                        </button>
                    </div>

                    {/* 주소 검색 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="font-medium text-gray-900 mb-4">새 주소 등록</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">주소 검색</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="도로명, 지번, 건물명으로 검색"
                                        className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <Search className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">상세 주소</label>
                                <input
                                    type="text"
                                    placeholder="동/호수 등 상세 주소를 입력"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.detail}
                                    onChange={(e) => setFormData({...formData, detail: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">주소 별명</label>
                                <input
                                    type="text"
                                    placeholder="예: 집, 회사, 학교"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="default-address"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                                />
                                <label htmlFor="default-address" className="ml-2 text-sm text-gray-700">
                                    기본 주소로 설정
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 저장 버튼 */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium"
                    >
                        주소 저장하기
                    </button>
                </div>
            </main>
        </div>
    );
};
export default AddressRegister;