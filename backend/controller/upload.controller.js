const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');
const axios = require('axios');

// 이미지 업로드 컨트롤러
const uploadImage = catchAsync(async (req, res) => {
  try {
    console.log('uploadImage controller called');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: 0,
        message: '업로드된 파일이 없습니다.',
        file: { url: '' }
      });
    }
    
    console.log('File uploaded:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
    
    // 이미지 경로 설정 - 항상 /uploads로 시작하도록
    const imagePath = `/uploads/${req.file.filename}`;
    console.log('Image path set to:', imagePath);
    
    // 파일 접근 가능 여부 확인
    const fullPath = path.join(__dirname, '..', 'uploads', req.file.filename);
    console.log('Full file path:', fullPath);
    
    try {
      fs.accessSync(fullPath, fs.constants.F_OK);
      console.log('File is accessible');
    } catch (err) {
      console.error('File not accessible:', err.message);
      return res.status(500).json({
        success: 0,
        message: '파일 접근 오류: ' + err.message,
        file: { url: '' }
      });
    }
    
    // Editor.js 형식에 맞게 응답
    const response = {
      success: 1,
      file: {
        url: imagePath,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    };
    
    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: 0,
      message: '이미지 업로드에 실패했습니다: ' + (error.message || '알 수 없는 오류'),
      file: { url: '' }
    });
  }
});

// URL로 이미지 업로드 컨트롤러
const uploadImageByUrl = catchAsync(async (req, res) => {
  try {
    console.log('uploadImageByUrl controller called');
    console.log('Request body:', req.body);
    
    const { url } = req.body;
    
    if (!url) {
      console.error('No URL provided');
      return res.status(400).json({ 
        success: 0,
        message: 'URL이 제공되지 않았습니다.',
        file: { url: '' }
      });
    }
    
    console.log('Downloading image from URL:', url);
    
    // URL에서 이미지 다운로드
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    console.log('Image downloaded, content type:', response.headers['content-type']);
    
    // 파일 확장자 결정
    const contentType = response.headers['content-type'];
    let extension = 'jpg'; // 기본값
    
    if (contentType) {
      if (contentType.includes('png')) extension = 'png';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
      else if (contentType.includes('gif')) extension = 'gif';
      else if (contentType.includes('webp')) extension = 'webp';
    }
    
    // 파일명 생성
    const filename = `url-${Date.now()}.${extension}`;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    console.log('Saving image to:', filePath);
    
    // 파일 저장
    fs.writeFileSync(filePath, Buffer.from(response.data));
    
    // 이미지 경로 설정
    const imagePath = `/uploads/${filename}`;
    console.log('Image path set to:', imagePath);
    
    // Editor.js 형식에 맞게 응답
    const responseData = {
      success: 1,
      file: {
        url: imagePath,
        name: filename,
        size: response.data.length,
        type: contentType
      }
    };
    
    console.log('Sending response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error uploading image by URL:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: 0,
      message: 'URL 이미지 업로드에 실패했습니다: ' + (error.message || '알 수 없는 오류'),
      file: { url: '' }
    });
  }
});

module.exports = {
  uploadImage,
  uploadImageByUrl
};
