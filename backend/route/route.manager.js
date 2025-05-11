const express = require('express');
const cors = require('cors');
const authRoute = require('./v1/auth.route');
const userRoute = require('./v1/user.route');
const contentRoute = require('./v1/contents.route');

const router = express.Router();

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// 라우트 등록 로그 추가
console.log('Setting up route manager...');

// v1 API 라우트
const v1Routes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/contents',
    route: contentRoute,
  },
];

// 라우트 매니저 함수
const routeManager = (app) => {
  console.log('Initializing route manager...');
  
  // CORS 미들웨어 적용
  app.use(cors(corsOptions));
  console.log('CORS middleware applied');
  
  // v1 라우트 등록
  const v1Router = express.Router();
  
  v1Routes.forEach((route) => {
    try {
      v1Router.use(route.path, route.route);
      console.log(`Registered route: /v1${route.path}`);
    } catch (error) {
      console.error(`Error registering route /v1${route.path}:`, error);
    }
  });
  
  // v1 라우터 등록
  app.use('/v1', v1Router);
  console.log('v1 router registered');
  
  // 루트 라우트 (CORS 적용)
  app.options('/', cors(corsOptions)); // 프리플라이트 요청 처리
  app.get('/', cors(corsOptions), (req, res) => {
    res.json({ 
      message: 'Welcome to the API',
      endpoints: [
        { path: '/status', method: 'GET', description: 'Check server status' },
        { path: '/test', method: 'GET', description: 'Test endpoint' },
        { path: '/v1/auth/register', method: 'POST', description: 'Register a new user' },
        { path: '/v1/auth/login', method: 'POST', description: 'Login' }
      ]
    });
  });
  
  console.log('Route manager setup complete with CORS enabled.');
};

module.exports = routeManager;
