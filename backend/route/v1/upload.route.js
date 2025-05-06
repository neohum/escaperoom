const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../../middleware/auth');
const router = express.Router();

// 라우트 로딩 확인 로그
console.log('Loading upload.route.js...');

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, '../../uploads');
console.log('Upload directory:', uploadDir);

// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

// 스토리지 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Multer destination called');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log('Multer filename called for:', file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 파일 필터
const fileFilter = (req, file, cb) => {
  console.log('Multer fileFilter called for:', file.originalname, file.mimetype);
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('File type allowed:', file.mimetype);
    cb(null, true);
  } else {
    console.log('File type rejected:', file.mimetype);
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

// Multer 에러 핸들러
const handleMulterError = (err, req, res, next) => {
  console.error('Multer error:', err);
  
  if (err instanceof multer.MulterError) {
    console.error('Multer specific error:', err.code);
    return res.status(400).json({
      success: 0,
      message: `파일 업로드 오류: ${err.message}`,
      file: { url: '' }
    });
  } else if (err) {
    console.error('Other upload error:', err.message);
    return res.status(400).json({
      success: 0,
      message: err.message,
      file: { url: '' }
    });
  }
  
  next();
};

// 기본 이미지 업로드 핸들러
const uploadImage = (req, res) => {
  try {
    console.log('uploadImage handler called');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: 0,
        message: '업로드된 파일이 없습니다.',
        file: { url: '' }
      });
    }
    
    console.log('File uploaded:', req.file);
    
    // 파일 URL 생성
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Generated file URL:', fileUrl);
    
    // Editor.js 형식에 맞게 응답
    res.status(200).json({
      success: 1,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: 0,
      message: error.message || 'Failed to upload image',
      file: { url: '' }
    });
  }
};

// URL로 이미지 업로드 핸들러
const uploadImageByUrl = (req, res) => {
  try {
    console.log('uploadImageByUrl handler called');
    console.log('Request body:', req.body);
    
    const { url } = req.body;
    
    if (!url) {
      console.error('No URL provided');
      return res.status(400).json({ 
        success: 0,
        message: 'URL이 제공되지 않았습니다.',
        file: { url: '' }
      });
    }
    
    // 여기서는 URL을 그대로 반환합니다.
    // 실제 구현에서는 URL에서 이미지를 다운로드하고 저장하는 로직을 추가할 수 있습니다.
    
    // Editor.js 형식에 맞게 응답
    res.status(200).json({
      success: 1,
      file: {
        url: url
      }
    });
  } catch (error) {
    console.error('Error uploading image by URL:', error);
    res.status(500).json({ 
      success: 0,
      message: error.message || 'Failed to upload image by URL',
      file: { url: '' }
    });
  }
};

// 라우트 설정 - auth 미들웨어 제거하여 테스트
router.post('/', upload.single('image'), handleMulterError, uploadImage);
router.post('/url', uploadImageByUrl);

// Summernote 이미지 업로드 라우트 추가
router.post('/summernote', upload.single('file'), handleMulterError, (req, res) => {
  try {
    console.log('POST /v1/upload/summernote route hit');
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

// 이미지 업로드 라우트 추가
router.post('/image', upload.single('image'), handleMulterError, (req, res) => {
  try {
    console.log('POST /v1/upload/image route hit');
    
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

// 테스트 라우트
router.get('/test', (req, res) => {
  res.status(200).json({
    success: 1,
    message: 'Upload route is working'
  });
});

// CORS 설정
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

module.exports = router;
