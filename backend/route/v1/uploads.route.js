const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../../middleware/auth');

// 라우트 로딩 확인 로그
console.log('Loading uploads.route.js...');

// uploads 디렉토리가 없으면 생성
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Saving file to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
  fileFilter: function (req, file, cb) {
    // 이미지 파일만 허용
    console.log('Checking file type:', file.originalname, file.mimetype);
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Multer 에러 핸들러 미들웨어
const handleMulterError = (err, req, res, next) => {
  console.error('Multer error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: 0,
        message: '파일 크기가 너무 큽니다. 최대 10MB까지 허용됩니다.'
      });
    }
    return res.status(400).json({
      success: 0,
      message: `업로드 오류: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: 0,
      message: err.message
    });
  }
  next();
};

// 테스트 라우트
router.get('/test', (req, res) => {
  console.log('GET /v1/uploads/test route hit');
  res.status(200).json({
    success: true,
    message: 'Uploads route is working'
  });
});

// 이미지 업로드 라우트
router.post('/image', auth(), upload.single('image'), handleMulterError, (req, res) => {
  try {
    console.log('POST /v1/uploads/image route hit');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: 0,
        message: 'No file uploaded'
      });
    }
    
    console.log('File uploaded:', req.file);
    
    // 파일 URL 생성
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Editor.js가 기대하는 응답 형식으로 반환
    res.status(200).json({
      success: 1,
      file: {
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: 0,
      message: error.message || 'Failed to upload image'
    });
  }
});

// Summernote 이미지 업로드 라우트 (인증 선택적)
// 개발 환경에서는 인증 없이 테스트할 수 있도록 함
const authMiddleware = process.env.NODE_ENV === 'production' ? auth() : (req, res, next) => next();

router.post('/summernote', authMiddleware, upload.single('file'), handleMulterError, (req, res) => {
  try {
    console.log('POST /v1/uploads/summernote route hit');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: 0,
        message: 'No file uploaded'
      });
    }
    
    console.log('File uploaded:', req.file);
    
    // 파일 URL 생성
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Generated file URL:', fileUrl);
    
    // Summernote가 기대하는 응답 형식으로 반환
    res.status(200).json({
      url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading Summernote image:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: 0,
      message: error.message || 'Failed to upload image'
    });
  }
});

// URL로 이미지 업로드 라우트
router.post('/url', auth(), async (req, res) => {
  try {
    console.log('POST /v1/uploads/url route hit');
    console.log('Request body:', req.body);
    
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: 0,
        message: 'URL is required'
      });
    }
    
    // 여기서는 URL을 그대로 반환합니다.
    // 실제 구현에서는 URL에서 이미지를 다운로드하고 저장하는 로직을 추가할 수 있습니다.
    
    // Editor.js가 기대하는 응답 형식으로 반환
    res.status(200).json({
      success: 1,
      file: {
        url: url
      }
    });
  } catch (error) {
    console.error('Error processing image URL:', error);
    res.status(500).json({ 
      success: 0,
      message: error.message || 'Failed to process image URL'
    });
  }
});

// 라우트 등록 확인 로그
console.log('Uploads routes registered:');
console.log('- GET /test');
console.log('- POST /image');
console.log('- POST /summernote');
console.log('- POST /url');

module.exports = router;
