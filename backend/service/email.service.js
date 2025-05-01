const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

// Mailtrap을 사용한 이메일 테스트 설정
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD
  }
});

// 메일 서버 연결 테스트
if (process.env.NODE_ENV !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to Mailtrap email server'))
    .catch((err) => {
      logger.warn('Unable to connect to Mailtrap email server. Check your credentials.');
      logger.error(err.message);
    });
}

// 이메일 전송 함수
const sendEmail = async (to, subject, text) => {
  try {
    // from 주소를 환경 변수에서 가져옴
    const msg = { 
      from: process.env.EMAIL_FROM || '"Escape Room" <noreply@escaperoom.com>', 
      to, 
      subject, 
      text 
    };
    
    logger.info(`Attempting to send email to ${to} with subject: ${subject}`);
    logger.info(`Using SMTP credentials: ${process.env.MAILTRAP_USER}`);
    
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
  const subject = 'Reset password';
  const resetPasswordUrl = `http://localhost:5173/reset-password?token=${token}`;
  const text = `Dear user,
  
To reset your password, click on this link: ${resetPasswordUrl}

If you did not request any password resets, then ignore this email.

Thanks,
Escape Room Team`;

  return await sendEmail(to, subject, text);
};

// 이메일 인증 메일 전송
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `http://localhost:5173/verify-email?token=${token}`;
  const text = `Dear user,
  
To verify your email, click on this link: ${verificationEmailUrl}

If you did not create an account, then ignore this email.

Thanks,
Escape Room Team`;

  return await sendEmail(to, subject, text);
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
