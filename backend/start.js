/**
 * 서버 시작 스크립트
 * 
 * 이 스크립트는 서버가 자동으로 죽지 않도록 하기 위한 추가 보호 계층을 제공합니다.
 * PM2 없이 직접 실행할 때 사용할 수 있습니다.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 로그 디렉토리 확인 및 생성
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 로그 파일 스트림 생성
const logFile = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });
const errorLogFile = fs.createWriteStream(path.join(logsDir, 'server-error.log'), { flags: 'a' });

// 타임스탬프 함수
function timestamp() {
  return new Date().toISOString();
}

// 서버 시작 함수
function startServer() {
  console.log(`[${timestamp()}] Starting server...`);
  logFile.write(`[${timestamp()}] Starting server...\n`);

  // Node.js 앱 실행
  const server = spawn('node', ['app.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' }
  });

  // 표준 출력 처리
  server.stdout.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`[${timestamp()}] ${message}`);
    logFile.write(`[${timestamp()}] ${message}\n`);
  });

  // 표준 오류 처리
  server.stderr.on('data', (data) => {
    const message = data.toString().trim();
    console.error(`[${timestamp()}] ERROR: ${message}`);
    errorLogFile.write(`[${timestamp()}] ${message}\n`);
  });

  // 서버 종료 처리
  server.on('close', (code) => {
    const message = `Server process exited with code ${code}`;
    console.log(`[${timestamp()}] ${message}`);
    logFile.write(`[${timestamp()}] ${message}\n`);

    // 비정상 종료인 경우 재시작
    if (code !== 0) {
      console.log(`[${timestamp()}] Server crashed. Restarting in 5 seconds...`);
      logFile.write(`[${timestamp()}] Server crashed. Restarting in 5 seconds...\n`);
      
      setTimeout(() => {
        startServer();
      }, 5000);
    }
  });

  // 프로세스 종료 시그널 처리
  process.on('SIGINT', () => {
    console.log(`[${timestamp()}] Received SIGINT. Graceful shutdown...`);
    logFile.write(`[${timestamp()}] Received SIGINT. Graceful shutdown...\n`);
    
    server.kill('SIGTERM');
    
    // 5초 후에도 종료되지 않으면 강제 종료
    setTimeout(() => {
      console.log(`[${timestamp()}] Forcing exit...`);
      process.exit(0);
    }, 5000);
  });
}

// 서버 시작
startServer();