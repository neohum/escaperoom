const express = require('express');
const router = express.Router();
const mainContentsController = require('../../controller/main_contents.controller');
const auth = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// uploads 디렉토리가 없으면 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Created uploads directory in main_contents.route.js');
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

// 라우트 설정
router.post('/', auth(), upload.single('image'), mainContentsController.createMainContent);
router.get('/:uuid', mainContentsController.getMainContentByUuid);
router.patch('/:uuid', auth(), upload.single('image'), mainContentsController.updateMainContent);
router.get('/content/:contentId/latest', mainContentsController.getLatestMainContentByContentId);
router.get('/content/:contentId/versions', mainContentsController.getAllVersionsByContentId);
router.get('/:uuid/history/:direction', mainContentsController.getVersionHistory);

module.exports = router;
