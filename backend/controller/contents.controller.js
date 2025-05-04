const db = require('../models');
const Contents = db.contents;

// 모든 콘텐츠 조회
exports.getAllContents = async (req, res) => {
  try {
    const contents = await Contents.findAll();
    res.status(200).json(contents);
  } catch (error) {
    console.error('Error getting contents:', error);
    res.status(500).json({ message: 'Failed to get contents' });
  }
};

// 특정 콘텐츠 조회
exports.getContentById = async (req, res) => {
  try {
    const content = await Contents.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(200).json(content);
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({ message: 'Failed to get content' });
  }
};

// 콘텐츠 생성
exports.createContent = async (req, res) => {
  try {
    // 이미지 파일 처리는 multer 미들웨어를 통해 이루어집니다
    const { title } = req.body;
    let image = null;
    
    if (req.file) {
      // 파일이 업로드된 경우, 파일 경로 저장
      image = req.file.path;
    }
    
    const newContent = await Contents.create({
      title,
      image
    });
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: 'Failed to create content' });
  }
};

// 콘텐츠 수정
exports.updateContent = async (req, res) => {
  try {
    const content = await Contents.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    const { title } = req.body;
    let updateData = { title };
    
    if (req.file) {
      // 새 이미지가 업로드된 경우
      updateData.image = req.file.path;
    }
    
    await content.update(updateData);
    res.status(200).json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
};

// 콘텐츠 삭제
exports.deleteContent = async (req, res) => {
  try {
    const content = await Contents.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    await content.destroy();
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Failed to delete content' });
  }
};