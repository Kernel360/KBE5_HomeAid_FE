import { useEffect } from 'react';
import axios from 'axios';

const TestComponent = () => {
  useEffect(() => {
    axios
      .get('http://localhost:8080/')
      .then((res) => {
        console.log('✅ API 성공:', res.data);
      })
      .catch((err) => {
        console.error('❌ API 실패:', err);
      });
  }, []);

  return <div>테스트 중...</div>;
};

export default TestComponent;
