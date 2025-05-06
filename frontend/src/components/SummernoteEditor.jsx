import { useEffect, useRef } from 'react';

export default function SummernoteEditor({ 
  initialContent = '', 
  onSave, 
  readOnly = false,
  placeholder = '내용을 입력하세요...'
}) {
  const editorRef = useRef(null);
  const summernoteInitialized = useRef(false);

  useEffect(() => {
    // jQuery와 Summernote가 로드되었는지 확인
    if (window.jQuery && window.jQuery.summernote && !summernoteInitialized.current) {
      const $editor = window.jQuery(editorRef.current);
      
      // Summernote 초기화
      $editor.summernote({
        lang: 'ko-KR',
        placeholder: placeholder,
        tabsize: 2,
        height: 400,
        toolbar: [
          
          ['font', ['bold', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']], // 글자 크기 옵션 추가
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture', 'video']],
          ['view', ['fullscreen', 'codeview', 'help']]
        ],
        fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '30', '36', '50', '72'], // 다양한 글자 크기 옵션
        callbacks: {
          onImageUpload: function(files) {
            // 이미지 업로드 처리
            for (let i = 0; i < files.length; i++) {
              uploadImage(files[i], this);
            }
          }
        }
      });
      
      // 초기 콘텐츠 설정
      if (initialContent) {
        $editor.summernote('code', initialContent);
      }
      
      // 읽기 전용 모드 설정
      if (readOnly) {
        $editor.summernote('disable');
      }
      
      summernoteInitialized.current = true;
      
      // 컴포넌트 언마운트 시 Summernote 제거
      return () => {
        if (summernoteInitialized.current) {
          $editor.summernote('destroy');
          summernoteInitialized.current = false;
        }
      };
    }
    
    // jQuery나 Summernote가 아직 로드되지 않은 경우 대기
    const checkInterval = setInterval(() => {
      if (window.jQuery && window.jQuery.summernote && !summernoteInitialized.current) {
        clearInterval(checkInterval);
        // 다시 useEffect 실행
        const $editor = window.jQuery(editorRef.current);
        
        // Summernote 초기화
        $editor.summernote({
          lang: 'ko-KR',
          placeholder: placeholder,
          tabsize: 2,
          height: 400,
          toolbar: [
            
            ['font', ['bold', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']], // 글자 크기 옵션 추가
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
          ],
          fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '30', '36', '50', '72'], // 다양한 글자 크기 옵션
          callbacks: {
            onImageUpload: function(files) {
              // 이미지 업로드 처리
              for (let i = 0; i < files.length; i++) {
                uploadImage(files[i], this);
              }
            }
          }
        });
        
        // 초기 콘텐츠 설정
        if (initialContent) {
          $editor.summernote('code', initialContent);
        }
        
        // 읽기 전용 모드 설정
        if (readOnly) {
          $editor.summernote('disable');
        }
        
        summernoteInitialized.current = true;
      }
    }, 100);
    
    return () => {
      clearInterval(checkInterval);
      if (summernoteInitialized.current && window.jQuery) {
        window.jQuery(editorRef.current).summernote('destroy');
        summernoteInitialized.current = false;
      }
    };
  }, [initialContent, placeholder, readOnly]);

  // 이미지 업로드 함수
  const uploadImage = async (file, editor) => {
    try {
      console.log('Uploading file:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('file', file); // Summernote API는 'file' 필드명 사용
      
      // 토큰 가져오기
      const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
      let headers = {};
      if (tokens && tokens.access && tokens.access.token) {
        headers['Authorization'] = `Bearer ${tokens.access.token}`;
      }
      
      // 여러 엔드포인트 시도
      const endpoints = [
        'http://localhost:3000/v1/upload/summernote',  // 첫 번째로 시도할 엔드포인트
        'http://localhost:3000/v1/uploads/summernote',
        'http://localhost:3000/v1/upload/image',
        'http://localhost:3000/v1/uploads/image',
        'http://localhost:3000/v1/upload'
      ];
      
      let response = null;
      let responseData = null;
      let error = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to upload image to ${endpoint}`);
          
          // 엔드포인트에 따라 필드명 변경
          const endpointFormData = new FormData();
          if (endpoint.includes('/image') || endpoint === 'http://localhost:3000/v1/upload') {
            endpointFormData.append('image', file);
          } else {
            endpointFormData.append('file', file);
          }
          
          response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: endpointFormData
          });
          
          if (response.ok) {
            console.log(`Successfully uploaded to ${endpoint}`);
            responseData = await response.json();
            console.log('Upload response:', responseData);
            break;
          } else {
            const errorText = await response.text();
            console.error(`Error response from ${endpoint}:`, response.status, errorText);
          }
        } catch (err) {
          console.error(`Error uploading to ${endpoint}:`, err);
          error = err;
        }
      }
      
      if (!response || !response.ok || !responseData) {
        throw error || new Error('모든 업로드 엔드포인트가 실패했습니다.');
      }
      
      // 이미지 URL 구성 (다양한 응답 형식 처리)
      let imageUrl;
      if (responseData.url) {
        // Summernote 응답 형식
        imageUrl = responseData.url;
      } else if (responseData.file && responseData.file.url) {
        // Editor.js 응답 형식
        imageUrl = responseData.file.url;
      } else {
        console.error('Unknown response format:', responseData);
        throw new Error('응답에서 이미지 URL을 찾을 수 없습니다.');
      }
      
      // 상대 URL을 절대 URL로 변환
      if (imageUrl.startsWith('/')) {
        imageUrl = `http://localhost:3000${imageUrl}`;
      }
      
      console.log('Final image URL:', imageUrl);
      
      // 에디터에 이미지 삽입
      window.jQuery(editor).summernote('insertImage', imageUrl, function($image) {
        $image.css('max-width', '100%');
      });
      
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드에 실패했습니다: ' + error.message);
    }
  };

  // 저장 함수
  const handleSave = () => {
    if (onSave && window.jQuery && summernoteInitialized.current) {
      const content = window.jQuery(editorRef.current).summernote('code');
      onSave(content);
    }
  };

  return (
    <div className="summernote-editor">
      <div ref={editorRef}></div>
      
      {!readOnly && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}
