const db = require('../models');
const Contents = db.contents;
const contentsService = require('../service/contents.service');

// 모든 콘텐츠 조회
exports.getAllContents = async (req, res) => {
  try {
    console.log('Controller: getAllContents called');
    const contents = await contentsService.getAllContents();
    console.log('Retrieved contents:', contents);
    res.status(200).json(contents);
  } catch (error) {
    console.error('Error getting contents:', error);
    res.status(500).json({ message: error.message || 'Failed to get contents' });
  }
};

// 특정 콘텐츠 조회
exports.getContentById = async (req, res) => {
  try {
    console.log(`Controller: getContentById called with ID: ${req.params.id}`);
    const content = await contentsService.getContentById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(200).json(content);
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({ message: error.message || 'Failed to get content' });
  }
};

// 콘텐츠 생성
exports.createContent = async (req, res) => {
  try {
    console.log('Controller: createContent called');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('No file uploaded or file upload failed');
    }
    
    // 직접 DB에 저장 (서비스 레이어 우회)
    let image = null;
    if (req.file) {
      console.log(`File uploaded: ${req.file.filename}`);
      image = `/uploads/${req.file.filename}`;
    }
    
    const newContent = await Contents.create({
      title: req.body.title,
      image: image
    });
    
    console.log(`Content created with ID: ${newContent.id}`);
    
    res.status(201).json({
      message: 'Content created successfully',
      data: newContent
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: error.message || 'Failed to create content' });
  }
};

// 콘텐츠 수정
exports.updateContent = async (req, res) => {
  try {
    console.log(`Controller: updateContent called with ID: ${req.params.id}`);
    const updatedContent = await contentsService.updateContent(req.params.id, req.body, req.file);
    res.status(200).json({
      message: 'Content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    if (error.message === 'Content not found') {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(500).json({ message: error.message || 'Failed to update content' });
  }
};

// 콘텐츠 삭제
exports.deleteContent = async (req, res) => {
  try {
    console.log(`Controller: deleteContent called with ID: ${req.params.id}`);
    await contentsService.deleteContent(req.params.id);
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    if (error.message === 'Content not found') {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(500).json({ message: error.message || 'Failed to delete content' });
  }
};
