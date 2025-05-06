import { useState, useRef } from 'react';

export default function SimpleEditor({ 
  initialContent = '', 
  onSave, 
  readOnly = false,
  placeholder = '내용을 입력하세요...'
}) {
  const [content, setContent] = useState(initialContent || '');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const fileInputRef = useRef(null);

  // 이미지 업로드 함수
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // 토큰 가져오기
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      let headers = {};
      if (tokens && tokens.access && tokens.access.token) {
        headers['Authorization'] = `Bearer ${tokens.access.token}`;
      }
      
      // 이미지 업로드 엔드포인트 시도
      const endpoints = [
        'http://localhost:3000/v1/uploads/image',
        'http://localhost:3000/v1/upload/image'
      ];
      
      let uploadError = null;
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to upload image to ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: formData
          });
          
          if (response.ok) {
            console.log(`Successfully uploaded to ${endpoint}`);
            break;
          }
        } catch (error) {
          console.error(`Error uploading to ${endpoint}:`, error);
          uploadError = error;
        }
      }
      
      if (!response || !response.ok) {
        throw uploadError || new Error('이미지 업로드에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      // 이미지 URL 구성
      let imageUrl;
      if (data.file && data.file.url) {
        imageUrl = data.file.url.startsWith('http') 
          ? data.file.url 
          : `http://localhost:3000${data.file.url.startsWith('/') ? '' : '/'}${data.file.url}`;
      } else if (data.url) {
        imageUrl = data.url.startsWith('http') 
          ? data.url 
          : `http://localhost:3000${data.url.startsWith('/') ? '' : '/'}${data.url}`;
      } else {
        throw new Error('응답에서 이미지 URL을 찾을 수 없습니다.');
      }
      
      console.log('Final image URL:', imageUrl);
      
      // 이미지 태그를 콘텐츠에 추가
      const imgTag = `\n<img src="${imageUrl}" alt="업로드된 이미지" style="max-width: 100%; display: block; margin: 10px auto;">\n`;
      setContent(prevContent => prevContent + imgTag);
      
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드에 실패했습니다: ' + error.message);
    }
  };

  // 파일 입력 처리
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // 이미지 URL 추가
  const addImageUrl = (e) => {
    e.preventDefault();
    if (imageUrl) {
      const imgTag = `\n<img src="${imageUrl}" alt="이미지" style="max-width: 100%; display: block; margin: 10px auto;">\n`;
      setContent(prevContent => prevContent + imgTag);
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  // 저장 함수
  const handleSave = () => {
    if (onSave) {
      onSave(content);
    } else {
      console.log(content);
    }
  };

  return (
    <div className="simple-editor">
      {!readOnly && (
        <div className="mb-4 border-b pb-2">
          <div className="flex flex-wrap gap-1 mb-2">
            <button
              type="button"
              onClick={() => document.execCommand('bold')}
              className="px-2 py-1 border rounded text-sm"
            >
              굵게
            </button>
            <button
              type="button"
              onClick={() => document.execCommand('italic')}
              className="px-2 py-1 border rounded text-sm"
            >
              기울임
            </button>
            <button
              type="button"
              onClick={() => document.execCommand('underline')}
              className="px-2 py-1 border rounded text-sm"
            >
              밑줄
            </button>
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className="px-2 py-1 border rounded text-sm"
            >
              이미지 URL
            </button>
            <label className="px-2 py-1 border rounded text-sm cursor-pointer bg-blue-50">
              이미지 업로드
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                ref={fileInputRef}
              />
            </label>
          </div>
          
          {showImageInput && (
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="border rounded px-2 py-1 flex-grow mr-2"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                추가
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="border rounded p-4 min-h-[300px]">
        {readOnly ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[300px] focus:outline-none resize-none"
          />
        )}
      </div>
      
      {!readOnly && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}
