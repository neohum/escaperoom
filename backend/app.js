const dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const cors = require('cors');
const app = express();

// CORS 설정 - 이미지 리소스에 대한 Cross-Origin 허용
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));

// JSON 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routeManager = require('./route/route.manager.js')
const db = require("./models/index");
const bodyParser = require('body-parser')
const swaggerDocs = require('./swagger.js')
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const helmet = require('helmet');
const xss = require('xss-clean');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 보안 설정 - Cross-Origin 이미지 로딩을 위한 설정 추가
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));
app.use(xss());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors({
  origin: 'http://localhost:5173', // 프론트엔드 서버 주소
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 데이터베이스 동기화
db.sequelize.sync({ force: false, alter: true })
  .then(() => {
    console.log("Database synchronized successfully");
  })
  .catch((err) => {
    console.log("Failed to sync database: " + err.message);
  });

// jwt authentication
app.use(passport.initialize());

// 정적 파일 서빙 설정
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log(`Serving static files from: ${path.join(__dirname, 'uploads')}`);

// uploads 디렉토리가 없으면 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

// 정적 파일 제공 설정
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Static file serving configured for:', path.join(__dirname, 'uploads'));


// 디버깅을 위한 로그 추가
app.use((req, res, next) => {
  if (req.url.startsWith('/uploads')) {
    console.log(`Static file request: ${req.url}`);
  }
  next();
});

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Saving file to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// 파일 필터
const fileFilter = (req, file, cb) => {
  // 허용할 이미지 타입
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  console.log(`File mimetype: ${file.mimetype}`);
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(`Rejected file type: ${file.mimetype}`);
    cb(new Error('지원되지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP만 허용됩니다.'), false);
  }
};

// 업로드 미들웨어
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

// CORS 설정 확인
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 라우트 등록 - 명확하게 로그 추가
console.log('Registering routes...');

// 업로드 라우트 등록 확인
const uploadsRoute = require('./route/v1/uploads.route');
console.log('Uploads route loaded:', Object.keys(uploadsRoute));
app.use('/v1/uploads', uploadsRoute);
console.log('Registered route: /v1/uploads');

// 다른 라우트 등록
app.use('/v1/auth', require('./route/v1/auth.route'));
app.use('/v1/contents', require('./route/v1/contents.route'));
app.use('/v1/main-contents', require('./route/v1/main_contents.route'));
app.use('/v1/upload', require('./route/v1/upload.route')); // 기존 upload 라우트도 유지

// 정적 파일 제공
app.use('/uploads', express.static('uploads'));
console.log('Static file serving configured for: /uploads');

// 서버 시작 시 라우트 목록 출력 (디버깅용)
console.log('All registered routes:');
app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly on the app
        console.log(`[Route] ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if(middleware.name === 'router'){ // router middleware
        middleware.handle.stack.forEach(function(handler){
            if(handler.route){
                const path = handler.route.path;
                const methods = Object.keys(handler.route.methods);
                console.log(`[Router] ${methods} ${path}`);
            }
        });
    }
});

// 전역 예외 처리 추가
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // 로그에 기록하지만 프로세스는 종료하지 않음
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 로그에 기록하지만 프로세스는 종료하지 않음
});

// 서버 시작 부분 수정 (파일 끝부분에 추가)
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 서버 오류 처리
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying again in 10 seconds...`);
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 10000);
  }
});

// 연결 종료 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});
