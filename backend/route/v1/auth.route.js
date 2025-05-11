const express = require('express');
const validate = require('../../middleware/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controller/auth.controller');

const router = express.Router();

// 라우트 등록 확인
console.log('Setting up auth routes...');

// 테스트 라우트
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// 회원가입
router.post('/register', validate(authValidation.register), authController.register);

// 로그인
router.post('/login', validate(authValidation.login), authController.login);

// 로그아웃
router.post('/logout', validate(authValidation.logout), authController.logout);

// 토큰 갱신
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

// 비밀번호 찾기
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);

// 비밀번호 재설정
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

// 라우트 등록 확인 로그
console.log('Auth routes registered:');
console.log('- GET /v1/auth/test');
console.log('- POST /v1/auth/register');
console.log('- POST /v1/auth/login');
console.log('- POST /v1/auth/logout');
console.log('- POST /v1/auth/refresh-tokens');
console.log('- POST /v1/auth/forgot-password');
console.log('- POST /v1/auth/reset-password');

module.exports = router;
