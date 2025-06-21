import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const useAddressStore = create((set) => ({
  // 상태
  addresses: [],
  isLoading: false,
  error: null,

  // 액션들
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // authStore에서 토큰 가져오기
      const accessToken = useAuthStore.getState().accessToken;
      
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      console.log('API 호출 시작:', `${API_BASE_URL}/api/v1/customers/addresses`);
      console.log('토큰 확인:', accessToken ? '토큰 있음' : '토큰 없음');

      const response = await axios.get(`${API_BASE_URL}/api/v1/customers/addresses`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // API 응답 구조에 맞게 data 필드에서 주소 목록 추출
      const addressData = response.data.data || response.data;
      console.log('주소 데이터:', addressData);

      // API 응답에서 필요한 데이터만 추출
      const addressList = addressData.map(item => ({
        id: item.id,
        alias: item.alias,
        address: item.address,
        addressDetail: item.addressDetail,
        fullAddress: item.fullAddress,
        latitude: item.latitude,
        longitude: item.longitude,
      }));

      console.log('변환된 주소 목록:', addressList);

      set({ 
        addresses: addressList, 
        isLoading: false 
      });
      
      return addressList;
    } catch (error) {
      console.error('주소 목록 조회 실패:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 메시지:', error.message);
      set({ 
        error: error.response?.data?.message || '주소 목록을 불러오는데 실패했습니다.', 
        isLoading: false 
      });
      throw error;
    }
  },

  addAddress: async (addressData) => {
    set({ isLoading: true, error: null });
    
    try {
      const accessToken = useAuthStore.getState().accessToken;
      
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await axios.post(`${API_BASE_URL}/api/v1/customers/addresses`, addressData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // API 응답 구조에 맞게 data 필드에서 새 주소 정보 추출
      const newAddressData = response.data.data || response.data;

      // 새 주소를 목록에 추가
      const newAddress = {
        id: newAddressData.id,
        alias: newAddressData.alias,
        address: newAddressData.address,
        addressDetail: newAddressData.addressDetail,
        fullAddress: newAddressData.fullAddress,
        latitude: newAddressData.latitude,
        longitude: newAddressData.longitude,
      };

      set(state => ({
        addresses: [...state.addresses, newAddress],
        isLoading: false
      }));

      return newAddress;
    } catch (error) {
      console.error('주소 추가 실패:', error);
      set({ 
        error: error.response?.data?.message || '주소 추가에 실패했습니다.', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateAddress: async (id, addressData) => {
    set({ isLoading: true, error: null });
    
    try {
      const accessToken = useAuthStore.getState().accessToken;
      
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await axios.put(`${API_BASE_URL}/api/v1/customers/addresses/${id}`, addressData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // API 응답 구조에 맞게 data 필드에서 업데이트된 주소 정보 추출
      const updatedAddressData = response.data.data || response.data;

      // 주소 목록에서 해당 주소 업데이트
      set(state => ({
        addresses: state.addresses.map(addr => 
          addr.id === id ? {
            id: updatedAddressData.id,
            alias: updatedAddressData.alias,
            address: updatedAddressData.address,
            addressDetail: updatedAddressData.addressDetail,
            fullAddress: updatedAddressData.fullAddress,
            latitude: updatedAddressData.latitude,
            longitude: updatedAddressData.longitude,
          } : addr
        ),
        isLoading: false
      }));

      return updatedAddressData;
    } catch (error) {
      console.error('주소 수정 실패:', error);
      set({ 
        error: error.response?.data?.message || '주소 수정에 실패했습니다.', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const accessToken = useAuthStore.getState().accessToken;
      
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      await axios.delete(`${API_BASE_URL}/api/v1/customers/addresses/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // 주소 목록에서 해당 주소 제거
      set(state => ({
        addresses: state.addresses.filter(addr => addr.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('주소 삭제 실패:', error);
      set({ 
        error: error.response?.data?.message || '주소 삭제에 실패했습니다.', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
})); 