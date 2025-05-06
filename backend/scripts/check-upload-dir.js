const fs = require('fs');
const path = require('path');

// 업로드 디렉토리 경로
const uploadDir = path.join(__dirname, '../uploads');

console.log('Checking upload directory permissions...');
console.log(`Upload directory path: ${uploadDir}`);

// 디렉토리 존재 여부 확인
if (!fs.existsSync(uploadDir)) {
  console.log('Upload directory does not exist. Creating...');
  try {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    console.log('Upload directory created successfully.');
  } catch (error) {
    console.error('Error creating upload directory:', error);
    process.exit(1);
  }
} else {
  console.log('Upload directory exists.');
}

// 디렉토리 권한 확인
try {
  const stats = fs.statSync(uploadDir);
  console.log(`Directory permissions: ${stats.mode.toString(8)}`);
  
  // 쓰기 권한 확인
  fs.accessSync(uploadDir, fs.constants.W_OK);
  console.log('Directory is writable.');
  
  // 테스트 파일 생성 시도
  const testFile = path.join(uploadDir, 'test-write-permission.txt');
  fs.writeFileSync(testFile, 'Test write permission');
  console.log('Test file created successfully.');
  
  // 테스트 파일 삭제
  fs.unlinkSync(testFile);
  console.log('Test file removed successfully.');
  
  console.log('Upload directory is properly configured.');
} catch (error) {
  console.error('Error checking directory permissions:', error);
  console.log('Please ensure the upload directory has proper write permissions.');
  process.exit(1);
}