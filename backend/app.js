const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

// CORS 미들웨어 적용
app.use(cors(corsOptions));

// OPTIONS 요청에 대한 응답
app.options('*', cors(corsOptions));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// 라우트 등록 확인
console.log('Registering routes...');

// 인증 라우트
const authRoute = require('./route/v1/auth.route');
console.log('Auth routes loaded');
app.use('/v1/auth', authRoute);

// 테스트 라우트
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is working!' });
});

// 상태 확인 라우트
app.get('/status', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'Backend server is running!'
  });
});

// 라우트 테스트
app.get('/v1/test-auth', (req, res) => {
  res.json({
    message: 'Auth routes are accessible',
    endpoints: [
      { method: 'POST', path: '/v1/auth/register', description: 'Register a new user' },
      { method: 'POST', path: '/v1/auth/login', description: 'Login with email and password' },
      { method: 'POST', path: '/v1/auth/logout', description: 'Logout (requires refresh token)' },
      { method: 'POST', path: '/v1/auth/refresh-tokens', description: 'Refresh access token' }
    ]
  });
});

// 오류 처리 미들웨어 (모든 라우트 등록 후 마지막에 추가)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // API 요청에 대해서는 JSON 응답 반환
  if (req.path.startsWith('/v1/') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // 그 외의 요청에 대해서는 HTML 오류 페이지 반환
  res.status(err.statusCode || 500).send(`
    <html>
      <head><title>Error</title></head>
      <body>
        <h1>Error: ${err.message || 'Internal Server Error'}</h1>
        ${process.env.NODE_ENV === 'development' ? `<pre>${err.stack}</pre>` : ''}
      </body>
    </html>
  `);
});

// 404 처리 미들웨어 (모든 라우트 등록 후 마지막에 추가)
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  
  // API 요청에 대해서는 JSON 응답 반환
  if (req.path.startsWith('/v1/') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(404).json({
      message: `Not Found: ${req.method} ${req.path}`
    });
  }
  
  // 그 외의 요청에 대해서는 HTML 오류 페이지 반환
  res.status(404).send(`
    <html>
      <head><title>Not Found</title></head>
      <body>
        <h1>Not Found: ${req.method} ${req.path}</h1>
      </body>
    </html>
  `);
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`CORS enabled for origins: ${corsOptions.origin.join(', ')}`);
});
