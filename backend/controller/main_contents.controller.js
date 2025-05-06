const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const mainContentsService = require("../service/main_contents.service");


// 새 메인 콘텐츠 생성
const createMainContent = catchAsync(async (req, res) => {
  try {
    console.log('createMainContent controller called');
    console.log('Request body:', req.body);
    
    // prevUuid 값 검증
    if (req.body.prevUuid === 'null' || req.body.prevUuid === 'undefined' || req.body.prevUuid === '') {
      console.log('Setting prevUuid to null');
      req.body.prevUuid = null;
    }
    
    // 이미지 파일이 업로드된 경우
    if (req.file) {
      console.log('Image file uploaded:', req.file.filename);
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    // 사용자 ID 가져오기 (인증된 사용자인 경우)
    const userId = req.user ? req.user.id : null;
    
    // 메인 콘텐츠 생성
    const newMainContent = await mainContentsService.createMainContent(
      req.body,
      userId
    );
    
    console.log(`Main content created with UUID: ${newMainContent.uuid}`);
    
    res.status(201).json(newMainContent);
  } catch (error) {
    console.error('Error creating main content:', error);
    res.status(500).json({ message: error.message || 'Failed to create main content' });
  }
});

// 메인 콘텐츠 업데이트 (새 버전 생성)
const updateMainContent = catchAsync(async (req, res) => {
  try {
    console.log(`updateMainContent controller called for UUID: ${req.params.uuid}`);
    console.log('Request body:', req.body);
    
    // 사용자 ID 가져오기 (인증된 사용자인 경우)
    const userId = req.user ? req.user.id : null;
    
    // 메인 콘텐츠 업데이트
    const updatedMainContent = await mainContentsService.updateMainContent(
      req.params.uuid,
      req.body,
      userId
    );
    
    console.log(`Main content updated, new version: ${updatedMainContent.version}`);
    
    res.status(200).json(updatedMainContent);
  } catch (error) {
    console.error('Error updating main content:', error);
    res.status(500).json({ message: error.message || 'Failed to update main content' });
  }
});

// UUID로 메인 콘텐츠 조회
const getMainContentByUuid = catchAsync(async (req, res) => {
  try {
    console.log(`getMainContentByUuid controller called for UUID: ${req.params.uuid}`);
    
    const mainContent = await mainContentsService.getMainContentByUuid(req.params.uuid);
    
    console.log(`Main content found: ${mainContent.title} (version ${mainContent.version})`);
    
    res.status(200).json(mainContent);
  } catch (error) {
    console.error('Error fetching main content:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message || 'Failed to fetch main content' });
    }
  }
});

// 콘텐츠 ID로 최신 메인 콘텐츠 조회
const getLatestMainContentByContentId = catchAsync(async (req, res) => {
  try {
    console.log(`getLatestMainContentByContentId controller called for content ID: ${req.params.contentId}`);
    
    const contentId = parseInt(req.params.contentId, 10);
    if (isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    // 최신 메인 콘텐츠 조회
    const mainContent = await MainContents.findOne({
      where: { 
        contentId: contentId,
        isLatest: true
      },
      order: [['version', 'DESC']]
    });
    
    if (!mainContent) {
      console.log(`No main content found for content ID: ${contentId}`);
      return res.status(404).json({ message: 'Main content not found' });
    }
    
    console.log(`Latest main content found: ${mainContent.title} (version ${mainContent.version})`);
    
    res.status(200).json(mainContent);
  } catch (error) {
    console.error('Error fetching latest main content:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch main content' });
  }
});

// 콘텐츠 ID로 모든 버전의 메인 콘텐츠 조회
const getAllVersionsByContentId = catchAsync(async (req, res) => {
  try {
    console.log(`getAllVersionsByContentId controller called for content ID: ${req.params.contentId}`);
    
    const mainContents = await mainContentsService.getAllVersionsByContentId(req.params.contentId);
    
    console.log(`Found ${mainContents.length} versions for content ID ${req.params.contentId}`);
    
    res.status(200).json(mainContents);
  } catch (error) {
    console.error('Error fetching all versions:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch all versions' });
  }
});

// 메인 콘텐츠 버전 기록 조회
const getVersionHistory = catchAsync(async (req, res) => {
  try {
    console.log(`getVersionHistory controller called for UUID: ${req.params.uuid}, direction: ${req.params.direction}`);
    
    const mainContents = await mainContentsService.getVersionHistory(
      req.params.uuid,
      req.params.direction
    );
    
    console.log(`Found ${mainContents.length} versions in the ${req.params.direction} direction`);
    
    res.status(200).json(mainContents);
  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch version history' });
  }
});

module.exports = {
  createMainContent,
  updateMainContent,
  getMainContentByUuid,
  getLatestMainContentByContentId,
  getAllVersionsByContentId,
  getVersionHistory
};
