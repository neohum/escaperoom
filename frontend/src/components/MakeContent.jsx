import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function MakeContent() {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // 로그인 상태 체크
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 컴포넌트 언마운트 시 객체 URL 해제
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이전 미리보기 URL 해제
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setImage(file);
      // 미리보기 URL 생성
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleImageClick = () => {
    // 숨겨진 파일 input을 클릭
    fileInputRef.current.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    // 이미지 및 미리보기 초기화
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImage(null);
    setPreviewUrl('');
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // FormData를 사용하여 이미지 포함 데이터 전송
      const formData = new FormData();
      formData.append('title', title);
      if (image) {
        formData.append('image', image);
        console.log('Image appended to FormData:', image.name);
      }

      // 토큰 가져오기 (인증이 필요한 경우)
      let headers = {};
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      if (tokens && tokens.access && tokens.access.token) {
        headers['Authorization'] = `Bearer ${tokens.access.token}`;
        console.log('Authorization header added');
      }
      
      // Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 설정)
      console.log('Sending request to http://localhost:3000/v1/contents');
      const response = await fetch('http://localhost:3000/v1/contents', {
        method: 'POST',
        headers: headers,
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers]));

      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create content');
        }
        
        setSuccess('Content created successfully!');
        console.log('Content created successfully:', data);
        
        // 폼 초기화
        setTitle('');
        setImage(null);
        setPreviewUrl('');
        
        // 성공 후 메인 페이지로 리디렉션
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const text = await response.text();
        console.log('Response text:', text);
        
        if (!response.ok) {
          throw new Error('Failed to create content');
        }
        
        setSuccess('Content created successfully!');
        
        // 폼 초기화
        setTitle('');
        setImage(null);
        setPreviewUrl('');
        
        // 성공 후 메인 페이지로 리디렉션
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating content:', err);
      
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to the server. Please check that the backend server is running.');
      } else {
        setError(err.message || 'Failed to create content. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 디버깅 도구 추가
  

  // 라우트 테스트 함수 추가
  const testRoutes = async () => {
    try {
      const response = await fetch('http://localhost:3000/routes-test');
      const data = await response.json();
      console.log('Available routes:', data.routes);
      
      // POST /v1/contents 경로가 있는지 확인
      const hasContentsRoute = data.routes.some(route => 
        route.path === '/v1/contents' && route.methods.includes('POST')
      );
      
      console.log('Has POST /v1/contents route:', hasContentsRoute);
      
      if (!hasContentsRoute) {
        setError('POST /v1/contents route is not registered on the server');
      }
    } catch (err) {
      console.error('Error testing routes:', err);
    }
  };

  // 컴포넌트 마운트 시 라우트 테스트
  useEffect(() => {
    testRoutes();
  }, []);

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">1. 새로운 방탈출 게임 만들기</h1>
      
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="block w-full py-4 mt-1 border-2 border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            대표 이미지
          </label>
          <div 
            onClick={handleImageClick}
            className="flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
          >
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <div className="relative flex flex-col items-center">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="object-contain mb-3 rounded max-h-48" 
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600 focus:outline-none"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <p className="text-xs text-gray-500">
                    Click to change image
                  </p>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">Click to upload an image</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </>
              )}
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="sr-only"
              />
            </div>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating...' : 'Create Content'}
          </button>
        </div>
      </form>
      
    </div>
  );
}
