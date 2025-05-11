// 서버 시작 전 모델 관계 확인
const express = require('express');
const app = express();
const config = require('./config/config');

// 업로드 디렉토리 확인
const path = require('path');
const fs = require('fs');
const { expression } = require('joi');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
} else {
  console.log(`Uploads directory exists: ${uploadsDir}`);
  
  // 디렉토리 권한 확인
  try {
    fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
    console.log('Uploads directory is readable and writable');
  } catch (err) {
    console.error('Uploads directory permission error:', err);
  }
}

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});
