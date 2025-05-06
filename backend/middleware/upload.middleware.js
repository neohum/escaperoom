const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(__dirname, '../uploads');
console.log(`Upload middleware - uploads directory: ${uploadDir}`);

if (!fs.existsSync(uploadDir)) {
  console.log(`Creating uploads directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}

// 스토리지 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Multer destination called for file: ${file.originalname}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log(`Multer filename called for file: ${file.originalname}`);
    // 원본 파일명에서 확장자 추출
    const ext = path.extname(file.originalname).toLowerCase();
    // 타임스탬프와 원본 파일명 조합으로 유니크한 파일명 생성
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    console.log(`Generated unique filename: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

// 파일 필터 설정
const fileFilter = (req, file, cb) => {
  console.log(`Multer fileFilter called for file: ${file.originalname}, mimetype: ${file.mimetype}`);
  
  // 허용할 이미지 타입
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log(`File type ${file.mimetype} is allowed`);
    cb(null, true);
  } else {
    console.log(`File type ${file.mimetype} is not allowed`);
    cb(new Error('지원되지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 허용됩니다.'), false);
  }
};

// Multer 설정
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
    // Multer 관련 에러
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: 0,
        message: '파일 크기가 너무 큽니다. 최대 10MB까지 허용됩니다.',
        file: { url: '' }
      });
    }
    return res.status(400).json({
      success: 0,
      message: `Multer 업로드 오류: ${err.message}`,
      file: { url: '' }
    });
  } else if (err) {
    // 기타 에러
    return res.status(400).json({
      success: 0,
      message: err.message,
      file: { url: '' }
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError
};
