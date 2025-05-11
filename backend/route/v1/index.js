const express = require('express');
const router = express.Router();

// 인증 라우트 등록
try {
  const authRoutes = require('./auth.route');
  router.use('/auth', authRoutes);
  console.log('Auth routes registered successfully');
} catch (error) {
  console.error('Error registering auth routes:', error);
}

// 사용자 라우트 등록
try {
  const userRoutes = require('./user.route');
  router.use('/users', userRoutes);
  console.log('User routes registered successfully');
} catch (error) {
  console.error('Error registering user routes:', error);
}

// 콘텐츠 라우트 등록
try {
  const contentsRoutes = require('./contents.route');
  router.use('/contents', contentsRoutes);
  console.log('Contents routes registered successfully');
} catch (error) {
  console.error('Error registering contents routes:', error);
}

// 메인 콘텐츠 라우트 등록
try {
  const mainContentsRoutes = require('./main_contents.route');
  router.use('/main-contents', mainContentsRoutes);
  console.log('Main contents routes registered successfully');
} catch (error) {
  console.error('Error registering main contents routes:', error);
}

// 업로드 라우트 등록
try {
  const uploadRoutes = require('./upload.route');
  router.use('/uploads', uploadRoutes);
  console.log('Upload routes registered successfully');
} catch (error) {
  console.error('Error registering upload routes:', error);
}

// 테스트 라우트 추가
router.get('/test', (req, res) => {
  res.json({ message: 'v1 API is working!' });
});

// 인증 테스트 라우트 추가
router.get('/test-auth', (req, res) => {
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

// 라우트 등록 확인 로그
console.log('v1 routes registered:');
console.log('- /v1/auth');
console.log('- /v1/users');
console.log('- /v1/contents');
console.log('- /v1/main-contents');
console.log('- /v1/uploads');
console.log('- /v1/test');
console.log('- /v1/test-auth');

module.exports = router;
