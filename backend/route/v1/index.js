const express = require('express');
const router = express.Router();

// 모든 라우트 가져오기
const authRouter = require('./auth.route');
// 다른 라우트들도 필요하다면 여기에 추가

// 라우트 등록
router.use('/auth', authRouter);
// 다른 라우트들도 필요하다면 여기에 추가

// 라우트 등록 확인 로그
console.log('API v1 routes registered');

module.exports = router;
