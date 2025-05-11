// CORS 미들웨어
module.exports = function(req, res, next) {
  // 허용할 도메인 설정
  const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // 개발 환경에서는 모든 도메인 허용 (프로덕션에서는 제거)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // 허용할 헤더
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 허용할 HTTP 메서드
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // 자격 증명 허용
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
};
