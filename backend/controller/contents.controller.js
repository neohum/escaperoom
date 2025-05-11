const db = require('../models');
const Contents = db.contents;

// 모든 콘텐츠 조회
exports.getAllContents = async (req, res) => {
  try {
    console.log('Controller: getAllContents called');
    
    const contents = await Contents.findAll();
    
    res.status(200).json({
      message: 'Contents retrieved successfully',
      data: contents
    });
  } catch (error) {
    console.error('Error retrieving contents:', error);
    res.status(500).json({
      message: 'Failed to retrieve contents',
      error: error.message
    });
  }
};

// 특정 콘텐츠 조회
exports.getContentById = async (req, res) => {
  try {
    console.log(`Controller: getContentById called with id: ${req.params.id}`);
    
    const content = await Contents.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }
    
    res.status(200).json({
      message: 'Content retrieved successfully',
      data: content
    });
  } catch (error) {
    console.error('Error retrieving content:', error);
    res.status(500).json({
      message: 'Failed to retrieve content',
      error: error.message
    });
  }
};

// 콘텐츠 생성
exports.createContent = async (req, res) => {
  try {
    console.log('Controller: createContent called');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('No file uploaded or file upload failed');
    }
    
    // 이미지 경로 설정
    let image = null;
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);
      image = `/uploads/${req.file.filename}`;
    }
    
    // 콘텐츠 생성
    const newContent = await Contents.create({
      title: req.body.title,
      image: image
    });
    
    console.log(`Content created with ID: ${newContent.id}`);
    
    res.status(201).json({
      message: 'Content created successfully',
      id: newContent.id,
      title: newContent.title,
      image: newContent.image,
      data: newContent
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      message: 'Failed to create content',
      error: error.message
    });
  }
};

// 콘텐츠 수정
exports.updateContent = async (req, res) => {
  try {
    console.log(`Controller: updateContent called with id: ${req.params.id}`);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // 콘텐츠 존재 여부 확인
    const content = await Contents.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }
    
    // 업데이트할 데이터 준비
    const updateData = {
      title: req.body.title || content.title
    };
    
    // 이미지가 업로드된 경우 이미지 경로 업데이트
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    // 콘텐츠 업데이트
    await content.update(updateData);
    
    res.status(200).json({
      message: 'Content updated successfully',
      data: await Contents.findByPk(req.params.id)
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      message: 'Failed to update content',
      error: error.message
    });
  }
};

// 콘텐츠 삭제
exports.deleteContent = async (req, res) => {
  try {
    console.log(`Controller: deleteContent called with id: ${req.params.id}`);
    
    // 콘텐츠 존재 여부 확인
    const content = await Contents.findByPk(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }
    
    // 콘텐츠 삭제
    await content.destroy();
    
    res.status(200).json({
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      message: 'Failed to delete content',
      error: error.message
    });
  }
};
