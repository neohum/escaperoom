const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const contentsController = require('../../controller/contents.controller');

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating uploads directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

// 모든 콘텐츠 조회
router.get('/', (req, res) => {
  console.log('GET /v1/contents route hit');
  contentsController.getAllContents(req, res);
});

// 특정 콘텐츠 조회
router.get('/:id', (req, res) => {
  console.log(`GET /v1/contents/${req.params.id} route hit`);
  contentsController.getContentById(req, res);
});

// 콘텐츠 생성
router.post('/', upload.single('image'), (req, res) => {
  console.log('POST /v1/contents route hit');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  contentsController.createContent(req, res);
});

// 콘텐츠 수정
router.put('/:id', upload.single('image'), (req, res) => {
  console.log(`PUT /v1/contents/${req.params.id} route hit`);
  contentsController.updateContent(req, res);
});

// 콘텐츠 삭제
router.delete('/:id', (req, res) => {
  console.log(`DELETE /v1/contents/${req.params.id} route hit`);
  contentsController.deleteContent(req, res);
});

// 라우트 등록 확인 로그
console.log('Contents routes registered:');
console.log('- GET /v1/contents');
console.log('- GET /v1/contents/:id');
console.log('- POST /v1/contents');
console.log('- PUT /v1/contents/:id');
console.log('- DELETE /v1/contents/:id');

module.exports = router;
