const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// CORS 미들웨어 적용
app.use(cors(corsOptions));
console.log('CORS enabled for origins:', corsOptions.origin);

// JSON 파싱 미들웨어
app.use(express.json());

// URL 인코딩 미들웨어
app.use(express.urlencoded({ extended: true }));

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating uploads directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log(`Serving static files from: ${path.join(__dirname, 'uploads')}`);

// 라우트 등록 확인 로그 추가
console.log('Registering routes...');

// API 버전 v1 라우트 등록
try {
  const v1Routes = require('./route/v1');
  app.use('/v1', v1Routes);
  console.log('v1 routes registered successfully');
} catch (error) {
  console.error('Error registering v1 routes:', error);
}

// 라우트 등록 후 로그
console.log('Routes registered successfully');

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

// 라우트 목록 확인 라우트
app.get('/routes-test', (req, res) => {
  const routes = [];
  
  // Express 앱의 라우터 스택을 순회하며 등록된 라우트 수집
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // 라우트가 직접 등록된 경우
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods).map(method => method.toUpperCase())
      });
    } else if (middleware.name === 'router') {
      // 라우터가 등록된 경우 (예: app.use('/v1', v1Router))
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.toString().includes('/v1')
            ? `/v1${handler.route.path}`
            : handler.route.path;
          
          routes.push({
            path,
            methods: Object.keys(handler.route.methods).map(method => method.toUpperCase())
          });
        }
      });
    }
  });
  
  res.json({
    message: 'Available routes',
    routes
  });
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

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`CORS enabled for origins: ${corsOptions.origin.join(', ')}`);
});

module.exports = app;
