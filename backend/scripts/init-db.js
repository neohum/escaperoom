const db = require('../models');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

/**
 * 데이터베이스 초기화 함수
 */
const initializeDatabase = async () => {
  try {
    logger.info('Initializing database...');
    
    // 데이터베이스 연결 테스트
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // 테이블 동기화 (개발 환경에서만 force: true 사용)
    const isDev = process.env.NODE_ENV === 'development';
    await db.sequelize.sync({ alter: true, force: isDev });
    logger.info(`Database synchronized (alter: true, force: ${isDev})`);
    
    // uploads 디렉토리 생성
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      logger.info('Created uploads directory');
    }
    
    // 샘플 이미지 파일 생성
    const sampleImages = [
      { name: 'sample1.jpg', content: 'Sample Image 1' },
      { name: 'sample2.jpg', content: 'Sample Image 2' }
    ];
    
    for (const img of sampleImages) {
      const imgPath = path.join(uploadsDir, img.name);
      if (!fs.existsSync(imgPath)) {
        fs.writeFileSync(imgPath, img.content);
        logger.info(`Created sample image: ${img.name}`);
      }
    }
    
    // 초기 데이터 생성 (필요한 경우)
    if (isDev) {
      logger.info('Creating sample data...');
      
      // 샘플 콘텐츠 생성
      const sampleContents = [
        {
          title: '샘플 방탈출 게임 1',
          image: '/uploads/sample1.jpg'
        },
        {
          title: '샘플 방탈출 게임 2',
          image: '/uploads/sample2.jpg'
        }
      ];
      
      // 이미 존재하는지 확인 후 생성
      const existingCount = await db.contents.count();
      
      let contentRecords = [];
      
      if (existingCount === 0) {
        contentRecords = await db.contents.bulkCreate(sampleContents);
        logger.info(`Created ${sampleContents.length} sample contents`);
      } else {
        logger.info(`Skipped creating sample contents (${existingCount} records already exist)`);
        // 기존 레코드 가져오기
        contentRecords = await db.contents.findAll({ limit: sampleContents.length });
      }
      
      // main_contents 테이블 데이터 생성
      const mainContentsCount = await db.main_contents.count();
      
      if (mainContentsCount === 0 && contentRecords.length > 0) {
        // 각 콘텐츠에 대한 메인 콘텐츠 생성
        const sampleMainContents = contentRecords.map(content => ({
          uuid: uuidv4(),
          title: content.title,
          content: `<h1>${content.title}</h1><p>방탈출 게임 콘텐츠 예제입니다.</p><p>이곳에 게임 내용이 표시됩니다.</p>`,
          image: content.image,
          contentId: content.id,
          prevUuid: null,
          nextUuid: null,
          version: 1,
          isLatest: true
        }));
        
        await db.main_contents.bulkCreate(sampleMainContents);
        logger.info(`Created ${sampleMainContents.length} sample main contents`);
      } else {
        logger.info(`Skipped creating sample main contents (${mainContentsCount} records already exist)`);
      }
      
      // 기본 사용자 계정 생성 (개발용)
      const usersCount = await db.user.count();
      
      if (usersCount === 0) {
        // 테스트 사용자 생성
        await db.user.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123', // 실제 환경에서는 해싱된 비밀번호를 사용해야 함
          role: 'user'
        });
        logger.info('Created sample user account');
      } else {
        logger.info(`Skipped creating sample user (${usersCount} users already exist)`);
      }
    }
    
    logger.info('Database initialization completed successfully.');
    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// 스크립트가 직접 실행된 경우에만 초기화 실행
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logger.info('Database initialization script completed.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;