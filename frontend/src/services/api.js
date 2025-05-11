import axios from 'axios';

// 백엔드 서버 URL 직접 지정
const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true  // 필요한 경우 활성화 (쿠키 전송 시)
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    console.log(`Sending request to: ${config.baseURL}${config.url}`);
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens?.access?.token) {
      config.headers.Authorization = `Bearer ${tokens.access.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 오류 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // 서버 연결 오류 처리
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - server might be down');
    }
    
    // 401 Unauthorized 오류 처리
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized - token might be invalid');
      // 로그아웃 처리 또는 토큰 갱신 로직 추가
    }
    
    return Promise.reject(error);
  }
);

export default api;
