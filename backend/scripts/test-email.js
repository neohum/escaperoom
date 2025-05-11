require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Tests email connection and sends a test email if specified
 */
async function testEmailConnection() {
  console.log('Testing email connection...');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found. Please create one with your email settings.');
    console.log('Example .env file:');
    console.log(`
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
    `);
    return;
  }
  
  // Validate environment variables
  const missingVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'].filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
    return;
  }
  
  const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add timeout to prevent hanging connections
    connectionTimeout: 10000
  };

  let emailTransporter;
  try {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      emailTransporter = nodemailer.createTransport(emailConfig);
      // Verify connection configuration
      emailTransporter.verify(function(error, success) {
        if (error) {
          console.error(`Email configuration error: ${error.message}`);
        } else {
          console.log('Email server is ready to send messages');
        }
      });
    } else {
      console.warn('Email configuration incomplete. Email functionality will be unavailable.');
    }
  } catch (error) {
    console.error(`Failed to create email transporter: ${error.message}`);
    return;
  }
  
  console.log('Email configuration:', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass ? '[REDACTED]' : undefined
  });
  
  try {
    console.log('Attempting to verify connection...');
    // Verify connection configuration
    const verification = await emailTransporter.verify();
    console.log('Email verification successful:', verification);
    
    if (process.env.TEST_SEND === 'true') {
      const recipient = process.env.TEST_RECIPIENT || process.env.EMAIL_USER;
      console.log(`Sending test email to: ${recipient}`);
      
      // Send a test email
      const info = await emailTransporter.sendMail({
        from: `"Escape Room App" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: 'Test Email from Escape Room App',
        text: 'This is a test email from your Node.js Escape Room application.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a4a4a;">Email Test Successful</h2>
            <p>This is a test email from your Node.js Escape Room application.</p>
            <p>If you received this email, your email configuration is working correctly.</p>
            <p style="color: #888; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `
      });
      
      console.log('Test email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Email configuration error:');
    console.error('- Error name:', error.name);
    console.error('- Error message:', error.message);
    
    // Provide troubleshooting guidance based on error
    console.log('\n=== Troubleshooting Guidance ===');
    
    if (error.code === 'ENOTFOUND') {
      console.log('✘ Cannot resolve SMTP server hostname. Check your EMAIL_HOST value.');
      console.log('  Common EMAIL_HOST values:');
      console.log('  - Gmail: smtp.gmail.com');
      console.log('  - Outlook/Hotmail: smtp.office365.com');
      console.log('  - Yahoo: smtp.mail.yahoo.com');
    } else if (error.code === 'EAUTH') {
      console.log('✘ Authentication failed. Check your EMAIL_USER and EMAIL_PASS values.');
      if (emailConfig.host.includes('gmail')) {
        console.log('  For Gmail:');
        console.log('  1. Make sure you have 2FA enabled on your Google account');
        console.log('  2. Generate an "App Password" at https://myaccount.google.com/apppasswords');
        console.log('  3. Use that App Password in your EMAIL_PASS environment variable');
      }
    } else if (error.code === 'ESOCKET') {
      console.log('✘ Socket connection error. Check your EMAIL_PORT and EMAIL_SECURE values.');
      console.log('  Common port configurations:');
      console.log('  - Port 587 with EMAIL_SECURE=false (STARTTLS)');
      console.log('  - Port 465 with EMAIL_SECURE=true (SSL/TLS)');
    } else if (error.message.includes('Missing credentials')) {
      console.log('✘ Missing or incorrect credentials. Ensure EMAIL_USER and EMAIL_PASS are set correctly.');
    }
    
    console.log('\nMake sure your .env file is correctly set up and the email service allows SMTP access.');
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  testEmailConnection()
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

module.exports = { testEmailConnection };