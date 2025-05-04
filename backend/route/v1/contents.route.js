const express = require('express');
const router = express.Router();
const contentsController = require('../../controller/contents.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// uploads 디렉토리가 없으면 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Created uploads directory in contents.route.js');
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

// 디버깅용 로그
console.log('Contents routes loaded from contents.route.js');

// 라우트 등록 확인
router.get('/', (req, res) => {
  console.log('GET /v1/contents route hit');
  contentsController.getAllContents(req, res);
});

router.get('/:id', (req, res) => {
  console.log(`GET /v1/contents/${req.params.id} route hit`);
  contentsController.getContentById(req, res);
});

router.post('/', upload.single('image'), (req, res) => {
  console.log('POST /v1/contents route hit');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  contentsController.createContent(req, res);
});

router.put('/:id', upload.single('image'), (req, res) => {
  console.log(`PUT /v1/contents/${req.params.id} route hit`);
  contentsController.updateContent(req, res);
});

router.delete('/:id', (req, res) => {
  console.log(`DELETE /v1/contents/${req.params.id} route hit`);
  contentsController.deleteContent(req, res);
});

// 라우트 등록 확인 로그
console.log('Contents routes registered:');
console.log('- GET /');
console.log('- GET /:id');
console.log('- POST /');
console.log('- PUT /:id');
console.log('- DELETE /:id');

module.exports = router;
