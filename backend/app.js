const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const routeManager = require('./route/route.manager.js')
const db = require("./models/index");
const cors = require('cors')
const bodyParser = require('body-parser')
const swaggerDocs = require('./swagger.js')
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const helmet = require('helmet');
const xss = require('xss-clean');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 보안 설정
app.use(helmet());
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
db.sequelize.sync({ force: false })
  .then(() => {
    console.log("Database synchronized successfully");
  })
  .catch((err) => {
    console.log("Failed to sync database: " + err.message);
  });

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// 업로드된 파일을 제공하기 위한 정적 경로 설정
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Static file serving set up for /uploads directory');

// uploads 디렉토리가 없으면 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Created uploads directory');
}

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
  fileFilter: function (req, file, cb) {
    // 이미지 파일만 허용
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// 기존 /contents 경로를 /v1/contents로 리디렉션 (라우트 등록 전에 설정)
app.all('/contents', (req, res) => {
  console.log(`Redirecting ${req.method} request from /contents to /v1/contents`);
  res.redirect(307, `/v1/contents`);
});

app.all('/contents/:id', (req, res) => {
  console.log(`Redirecting ${req.method} request from /contents/${req.params.id} to /v1/contents/${req.params.id}`);
  res.redirect(307, `/v1/contents/${req.params.id}`);
});

// 라우트 등록 순서 변경
// 1. 콘텐츠 라우트 직접 등록 (중요: 라우트 매니저보다 먼저)
const contentsRoute = require('./route/v1/contents.route');
app.use('/v1/contents', contentsRoute);

// 2. 라우트 매니저를 통한 등록
routeManager(app);

// 3. Swagger 문서 설정
swaggerDocs(app, process.env.PORT);

// 파일 업로드 테스트 엔드포인트
app.post('/test-upload', upload.single('image'), (req, res) => {
  console.log('POST /test-upload route hit');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  res.status(200).json({
    message: 'File uploaded successfully',
    file: {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    }
  });
});

// 직접 /contents 라우트 추가 (테스트용)
app.get('/contents', (req, res) => {
  console.log('GET /contents route hit directly');
  res.redirect(307, '/v1/contents');
});

app.post('/contents', upload.single('image'), (req, res) => {
  console.log('POST /contents route hit directly');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    // 파일이 업로드된 경우 이미지 경로 저장
    let image = null;
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);
      image = `/uploads/${req.file.filename}`;
    }
    
    // 데이터베이스에 저장
    db.contents.create({
      title: req.body.title,
      image: image
    }).then(newContent => {
      console.log(`Content created with ID: ${newContent.id}`);
      
      res.status(201).json({
        message: 'Content created successfully',
        data: newContent
      });
    }).catch(error => {
      console.error('Error creating content:', error);
      res.status(500).json({ message: error.message || 'Failed to create content' });
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: error.message || 'Failed to create content' });
  }
});

// 테스트 엔드포인트 추가
app.get('/v1/contents-test', (req, res) => {
  console.log('GET /v1/contents-test route hit');
  res.status(200).json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// 직접 /v1/contents POST 라우트 추가 (테스트용)
app.post('/v1/contents-direct', upload.single('image'), (req, res) => {
  console.log('POST /v1/contents-direct route hit');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    // 파일이 업로드된 경우 이미지 경로 저장
    let image = null;
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);
      image = `/uploads/${req.file.filename}`;
    }
    
    // 데이터베이스에 저장
    db.contents.create({
      title: req.body.title,
      image: image
    }).then(newContent => {
      console.log(`Content created with ID: ${newContent.id}`);
      
      res.status(201).json({
        message: 'Content created successfully',
        data: newContent
      });
    }).catch(error => {
      console.error('Error creating content:', error);
      res.status(500).json({ message: error.message || 'Failed to create content' });
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: error.message || 'Failed to create content' });
  }
});

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).json({
        status: 'fail',
        code  : 500,
        error : `Can't find ${err.stack}`
    });
});

// 404 handler 수정
app.use(function (req, res, next) {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    res.status(404).json({
        status: 'fail',
        code  : 404,
        error : `Can't find ${req.originalUrl}`,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// 서버 시작 시 추가 디버깅 정보
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
  
  // 등록된 모든 라우트 출력
  console.log('\nAll registered routes:');
  
  // Express 라우터 스택 출력
  function printRoutes(stack, prefix = '') {
    stack.forEach(function(layer) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
        console.log(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        // 라우터 미들웨어인 경우 재귀적으로 처리
        const newPrefix = prefix + (layer.regexp.toString().indexOf('\\/(?=\\/|$)') >= 0 ? '' : layer.regexp.toString().replace(/[^\/]*$/, '').replace(/\\|\^|\$|\?/g, ''));
        printRoutes(layer.handle.stack, newPrefix);
      }
    });
  }
  
  printRoutes(app._router.stack);
  
  console.log('\nServer is ready to accept requests');
});
