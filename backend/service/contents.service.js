const db = require('../models');
const Contents = db.contents;
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

/**
 * 모든 콘텐츠 조회
 * @returns {Promise<Array>} 콘텐츠 목록
 */
const getAllContents = async () => {
  try {
    console.log('Service: getAllContents called');
    const contents = await Contents.findAll({
      order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${contents.length} contents`);
    return contents;
  } catch (error) {
    console.error(`Error fetching all contents: ${error.message}`);
    throw new Error('Failed to fetch contents');
  }
};

/**
 * ID로 콘텐츠 조회
 * @param {number} id - 콘텐츠 ID
 * @returns {Promise<Object>} 콘텐츠 객체
 */
const getContentById = async (id) => {
  try {
    logger.info(`Fetching content with ID: ${id}`);
    const content = await Contents.findByPk(id);
    if (!content) {
      logger.warn(`Content with ID ${id} not found`);
      throw new Error('Content not found');
    }
    return content;
  } catch (error) {
    logger.error(`Error fetching content by ID ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * 새 콘텐츠 생성
 * @param {Object} contentData - 콘텐츠 데이터
 * @param {Object} file - 업로드된 파일 정보
 * @returns {Promise<Object>} 생성된 콘텐츠 객체
 */
const contentCreate = async (contentData, file) => {
  try {
    logger.info('Creating new content');
    logger.info(`Content data: ${JSON.stringify(contentData)}`);
    logger.info(`File: ${file ? JSON.stringify({
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      filename: file.filename
    }) : 'No file'}`);
    
    // 파일이 업로드된 경우 이미지 경로 저장
    let image = null;
    if (file) {
      logger.info(`File uploaded: ${file.filename}`);
      image = `/uploads/${file.filename}`;
      logger.info(`Image path set to: ${image}`);
    }
    
    // 데이터베이스에 콘텐츠 생성
    const newContent = await Contents.create({
      title: contentData.title,
      image: image
    });
    
    logger.info(`Content created with ID: ${newContent.id}`);
    return newContent;
  } catch (error) {
    logger.error(`Error creating content: ${error.message}`);
    throw new Error(`Failed to create content: ${error.message}`);
  }
};

/**
 * 콘텐츠 업데이트
 * @param {number} id - 콘텐츠 ID
 * @param {Object} contentData - 업데이트할 콘텐츠 데이터
 * @param {Object} file - 업로드된 파일 정보
 * @returns {Promise<Object>} 업데이트된 콘텐츠 객체
 */
const updateContent = async (id, contentData, file) => {
  try {
    logger.info(`Updating content with ID: ${id}`);
    
    const content = await Contents.findByPk(id);
    if (!content) {
      logger.warn(`Content with ID ${id} not found for update`);
      throw new Error('Content not found');
    }
    
    // 업데이트할 데이터 준비
    const updateData = {
      title: contentData.title
    };
    
    // 새 이미지가 업로드된 경우
    if (file) {
      logger.info(`New file uploaded: ${file.filename}`);
      
      // 기존 이미지 파일 삭제 (있는 경우)
      if (content.image) {
        const oldImagePath = path.join(__dirname, '..', content.image.replace(/^\//, ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          logger.info(`Deleted old image: ${oldImagePath}`);
        }
      }
      
      // 새 이미지 경로 저장
      updateData.image = `/uploads/${file.filename}`;
    }
    
    // 콘텐츠 업데이트
    await content.update(updateData);
    logger.info(`Content with ID ${id} updated successfully`);
    
    return await Contents.findByPk(id);
  } catch (error) {
    logger.error(`Error updating content with ID ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * 콘텐츠 삭제
 * @param {number} id - 콘텐츠 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
const deleteContent = async (id) => {
  try {
    logger.info(`Deleting content with ID: ${id}`);
    
    const content = await Contents.findByPk(id);
    if (!content) {
      logger.warn(`Content with ID ${id} not found for deletion`);
      throw new Error('Content not found');
    }
    
    // 이미지 파일 삭제 (있는 경우)
    if (content.image) {
      const imagePath = path.join(__dirname, '..', content.image.replace(/^\//, ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        logger.info(`Deleted image: ${imagePath}`);
      }
    }
    
    // 콘텐츠 삭제
    await content.destroy();
    logger.info(`Content with ID ${id} deleted successfully`);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting content with ID ${id}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getAllContents,
  getContentById,
  contentCreate,
  updateContent,
  deleteContent
};
