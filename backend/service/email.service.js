const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

// Nate 메일 서버를 사용한 이메일 설정
const transport = nodemailer.createTransport({
  host: "smtp.mail.nate.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NATE_EMAIL_USER, // Nate 이메일 계정
    pass: process.env.NATE_EMAIL_PASSWORD// Nate 이메일 비밀번호
  }
});

// 메일 서버 연결 테스트
if (process.env.NODE_ENV !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to Nate email server'))
    .catch((err) => {
      logger.warn('Unable to connect to Nate email server. Check your credentials.');
      logger.error(err.message);
    });
}

// 이메일 전송 함수
const sendEmail = async (to, subject, text) => {
  try {
    // from 주소를 환경 변수에서 가져옴
    const msg = { 
      from: process.env.EMAIL_FROM || '"Escape Room" <your-nate-email@nate.com>', 
      to, 
      subject, 
      text 
    };
    
    logger.info(`Attempting to send email to ${to} with subject: ${subject}`);
    logger.info(`Using SMTP credentials: ${process.env.NATE_EMAIL_USER}`);
    
    // 이메일 전송
    const info = await transport.sendMail(msg);
    logger.info(`Email sent successfully to ${to}, message ID: ${info.messageId}`);
    
    return {
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    if (error.code) {
      logger.error(`Error code: ${error.code}`);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// 비밀번호 재설정 이메일 전송
const sendResetPasswordEmail = async (to, token) => {
  const subject = '비밀번호 재설정';
  // 프론트엔드 URL을 환경 변수에서 가져오거나 기본값 사용
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetPasswordUrl = `${frontendUrl}/reset-password?token=${token}`;
  const text = `안녕하세요,
  
비밀번호를 재설정하려면 다음 링크를 클릭하세요: ${resetPasswordUrl}

비밀번호 재설정을 요청하지 않았다면 이 이메일을 무시하세요.

감사합니다,
Escape Room 팀`;

  return await sendEmail(to, subject, text);
};

// 이메일 인증 메일 전송
const sendVerificationEmail = async (to, token) => {
  const subject = '이메일 인증';
  // 프론트엔드 URL을 환경 변수에서 가져오거나 기본값 사용
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationEmailUrl = `${frontendUrl}/verify-email?token=${token}`;
  const text = `안녕하세요,
  
이메일을 인증하려면 다음 링크를 클릭하세요: ${verificationEmailUrl}

계정을 만들지 않았다면 이 이메일을 무시하세요.

감사합니다,
Escape Room 팀`;

  return await sendEmail(to, subject, text);
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
