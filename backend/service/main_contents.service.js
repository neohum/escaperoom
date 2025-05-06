const db = require('../models');
const MainContents = db.main_contents;
const Contents = db.contents;
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * 새 메인 콘텐츠 생성
 * @param {Object} contentData - 콘텐츠 데이터
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} 생성된 메인 콘텐츠 객체
 */
const createMainContent = async (contentData, userId) => {
  try {
    logger.info('Creating new main content');
    logger.info(`Content data: ${JSON.stringify(contentData)}`);
    
    // 콘텐츠 ID 확인
    if (!contentData.contentId) {
      throw new Error('Content ID is required');
    }
    
    // 콘텐츠 존재 여부 확인
    const content = await Contents.findByPk(contentData.contentId);
    if (!content) {
      throw new Error(`Content with ID ${contentData.contentId} not found`);
    }
    
    // 새 UUID 생성 또는 콘텐츠의 UUID 사용
    const uuid = contentData.uuid || content.uuid || uuidv4();
    
    // 이전 버전 UUID 확인 (null이 아닌 경우에만 사용)
    let prevUuid = null;
    if (contentData.prevUuid && contentData.prevUuid !== 'null' && contentData.prevUuid !== 'undefined') {
      // 이전 버전 존재 여부 확인
      const prevVersion = await MainContents.findOne({
        where: { uuid: contentData.prevUuid }
      });
      
      if (prevVersion) {
        prevUuid = contentData.prevUuid;
        logger.info(`Previous version found with UUID: ${prevUuid}`);
      } else {
        logger.warn(`Previous version with UUID ${contentData.prevUuid} not found, setting prevUuid to null`);
      }
    }
    
    // 메인 콘텐츠 생성
    const newMainContent = await MainContents.create({
      uuid,
      title: contentData.title || content.title,
      content: contentData.content,
      image: contentData.image || content.image, // 이미지 필드 추가
      contentId: contentData.contentId,
      prevUuid: prevUuid, // 검증된 이전 UUID 설정
      nextUuid: null, // 다음 UUID는 아직 없음
      version: 1, // 첫 버전
      isLatest: true,
      userId
    });
    
    logger.info(`Main content created with UUID: ${newMainContent.uuid}`);
    return newMainContent;
  } catch (error) {
    logger.error(`Error creating main content: ${error.message}`);
    throw new Error(`Failed to create main content: ${error.message}`);
  }
};

/**
 * 메인 콘텐츠 업데이트 (새 버전 생성)
 * @param {string} uuid - 현재 버전의 UUID
 * @param {Object} contentData - 업데이트할 콘텐츠 데이터
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} 생성된 새 버전의 메인 콘텐츠 객체
 */
const updateMainContent = async (uuid, contentData, userId) => {
  try {
    logger.info(`Updating main content with UUID: ${uuid}`);
    
    // 현재 버전 조회
    const currentVersion = await MainContents.findOne({
      where: { uuid, isLatest: true }
    });
    
    if (!currentVersion) {
      throw new Error(`Main content with UUID ${uuid} not found or not the latest version`);
    }
    
    // 현재 버전이 최신 버전이 아니면 오류
    if (!currentVersion.isLatest) {
      throw new Error(`Cannot update non-latest version. Current latest version is ${currentVersion.version}`);
    }
    
    // 새 UUID 생성
    const newUuid = uuidv4();
    logger.info(`Generated new UUID for updated version: ${newUuid}`);
    
    // 트랜잭션 시작
    const transaction = await db.sequelize.transaction();
    
    try {
      // 현재 버전 업데이트 (더 이상 최신 버전이 아님)
      await currentVersion.update({
        isLatest: false,
        nextUuid: newUuid
      }, { transaction });
      
      logger.info(`Updated current version (${currentVersion.version}) isLatest to false and set nextUuid to ${newUuid}`);
      
      // 새 버전 생성
      const newVersion = await MainContents.create({
        uuid: newUuid,
        title: contentData.title || currentVersion.title,
        content: contentData.content || currentVersion.content,
        image: contentData.image || currentVersion.image, // 이미지 필드 추가
        contentId: currentVersion.contentId,
        prevUuid: uuid, // 현재 버전의 UUID를 이전 UUID로 설정
        nextUuid: null,
        version: currentVersion.version + 1,
        isLatest: true,
        userId
      }, { transaction });
      
      logger.info(`Created new version (${newVersion.version}) with UUID: ${newUuid}`);
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      return newVersion;
    } catch (error) {
      // 트랜잭션 롤백
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`Error updating main content: ${error.message}`);
    throw new Error(`Failed to update main content: ${error.message}`);
  }
};

/**
 * UUID로 메인 콘텐츠 조회
 * @param {string} uuid - 조회할 UUID
 * @returns {Promise<Object>} 메인 콘텐츠 객체
 */
const getMainContentByUuid = async (uuid) => {
  try {
    logger.info(`Fetching main content with UUID: ${uuid}`);
    
    const mainContent = await MainContents.findOne({
      where: { uuid },
      include: [
        {
          model: Contents,
          as: 'content'
        }
      ]
    });
    
    if (!mainContent) {
      throw new Error(`Main content with UUID ${uuid} not found`);
    }
    
    logger.info(`Found main content: ${mainContent.title} (version ${mainContent.version})`);
    return mainContent;
  } catch (error) {
    logger.error(`Error fetching main content: ${error.message}`);
    throw new Error(`Failed to fetch main content: ${error.message}`);
  }
};

/**
 * 콘텐츠 ID로 최신 메인 콘텐츠 조회
 * @param {number} contentId - 콘텐츠 ID
 * @returns {Promise<Object>} 최신 메인 콘텐츠 객체
 */
const getLatestMainContentByContentId = async (contentId) => {
  try {
    logger.info(`Fetching latest main content for content ID: ${contentId}`);
    
    const mainContent = await MainContents.findOne({
      where: { 
        contentId,
        isLatest: true
      },
      include: [
        {
          model: Contents,
          as: 'content'
        }
      ]
    });
    
    if (!mainContent) {
      throw new Error(`No main content found for content ID ${contentId}`);
    }
    
    logger.info(`Found latest main content: ${mainContent.title} (version ${mainContent.version})`);
    return mainContent;
  } catch (error) {
    logger.error(`Error fetching latest main content: ${error.message}`);
    throw new Error(`Failed to fetch latest main content: ${error.message}`);
  }
};

/**
 * 콘텐츠 ID로 모든 버전의 메인 콘텐츠 조회
 * @param {number} contentId - 콘텐츠 ID
 * @returns {Promise<Array>} 메인 콘텐츠 객체 배열
 */
const getAllVersionsByContentId = async (contentId) => {
  try {
    logger.info(`Fetching all versions for content ID: ${contentId}`);
    
    const mainContents = await MainContents.findAll({
      where: { contentId },
      order: [['version', 'DESC']],
      include: [
        {
          model: Contents,
          as: 'content'
        }
      ]
    });
    
    logger.info(`Found ${mainContents.length} versions for content ID ${contentId}`);
    return mainContents;
  } catch (error) {
    logger.error(`Error fetching all versions: ${error.message}`);
    throw new Error(`Failed to fetch all versions: ${error.message}`);
  }
};

/**
 * 메인 콘텐츠 버전 기록 조회
 * @param {string} uuid - 시작 UUID
 * @param {string} direction - 조회 방향 ('prev' 또는 'next')
 * @returns {Promise<Array>} 메인 콘텐츠 객체 배열
 */
const getVersionHistory = async (uuid, direction = 'prev') => {
  try {
    logger.info(`Fetching version history for UUID: ${uuid}, direction: ${direction}`);
    
    const result = [];
    let currentUuid = uuid;
    let currentContent = null;
    
    // 첫 번째 콘텐츠 조회
    currentContent = await MainContents.findOne({
      where: { uuid: currentUuid },
      include: [
        {
          model: Contents,
          as: 'content'
        }
      ]
    });
    
    if (!currentContent) {
      throw new Error(`Main content with UUID ${uuid} not found`);
    }
    
    result.push(currentContent);
    
    // 이전 또는 다음 버전 조회
    while (currentContent) {
      const nextUuid = direction === 'prev' ? currentContent.prevUuid : currentContent.nextUuid;
      
      if (!nextUuid) {
        break;
      }
      
      currentContent = await MainContents.findOne({
        where: { uuid: nextUuid },
        include: [
          {
            model: Contents,
            as: 'content'
          }
        ]
      });
      
      if (currentContent) {
        result.push(currentContent);
      }
    }
    
    logger.info(`Found ${result.length} versions in the ${direction} direction`);
    return result;
  } catch (error) {
    logger.error(`Error fetching version history: ${error.message}`);
    throw new Error(`Failed to fetch version history: ${error.message}`);
  }
};

module.exports = {
  createMainContent,
  updateMainContent,
  getMainContentByUuid,
  getLatestMainContentByContentId,
  getAllVersionsByContentId,
  getVersionHistory
};
