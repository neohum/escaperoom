// 서버 테스트 스크립트
const http = require('http');

console.log('Testing backend server...');

// 상태 확인 엔드포인트 테스트
http.get('http://localhost:3000/status', (res) => {
  console.log('Status endpoint response code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Status endpoint response:', jsonData);
      
      // 인증 테스트 엔드포인트 테스트
      testAuthEndpoint();
    } catch (e) {
      console.error('Error parsing status response:', e);
      console.error('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error testing status endpoint:', err.message);
});

// 인증 테스트 엔드포인트 테스트
function testAuthEndpoint() {
  http.get('http://localhost:3000/v1/test-auth', (res) => {
    console.log('Auth test endpoint response code:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Auth test endpoint response:', jsonData);
        
        // 로그인 엔드포인트 테스트
        testLoginEndpoint();
      } catch (e) {
        console.error('Error parsing auth test response:', e);
        console.error('Raw response:', data);
      }
    });
  }).on('error', (err) => {
    console.error('Error testing auth endpoint:', err.message);
  });
}

// 로그인 엔드포인트 테스트
function testLoginEndpoint() {
  const data = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('Login endpoint response code:', res.statusCode);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        // 응답이 JSON인지 확인
        const contentType = res.headers['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const jsonData = JSON.parse(responseData);
          console.log('Login endpoint response:', jsonData);
        } else {
          console.error('Login endpoint returned non-JSON response');
          console.error('Content-Type:', contentType);
          console.error('Raw response:', responseData);
        }
      } catch (e) {
        console.error('Error parsing login response:', e);
        console.error('Raw response:', responseData);
      }
    });
  });
  
  req.on('error', (err) => {
    console.error('Error testing login endpoint:', err.message);
  });
  
  req.write(data);
  req.end();
}