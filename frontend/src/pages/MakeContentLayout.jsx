import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import SummernoteEditor from '../components/SummernoteEditor.jsx';

export default function MakeContentLayout() {
  const [content, setContent] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contentUuid, setContentUuid] = useState(null);
  const [prevUuid, setPrevUuid] = useState(null);
  
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlContentUuid = queryParams.get('uuid');
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  console.log('Rendering MakeContentLayout', { id, isLoading, contentUuid, prevUuid });
  
  // 로그인 상태 체크
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // URL 파라미터 처리
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const uuid = queryParams.get('uuid');
    const prevUuidParam = queryParams.get('prevUuid');
    
    console.log('URL parameters:', { uuid, prevUuid: prevUuidParam });
    
    if (uuid) {
      setContentUuid(uuid);
      console.log('Content UUID set from URL:', uuid);
    }
    
    // prevUuid 처리 - 명시적으로 'null'인 경우 null로 설정
    if (prevUuidParam === 'null') {
      console.log('Setting prevUuid to null');
      setPrevUuid(null);
    } else if (prevUuidParam) {
      setPrevUuid(prevUuidParam);
      console.log('Previous UUID set from URL:', prevUuidParam);
    }
  }, [location.search]);

  // 콘텐츠 데이터 가져오기
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching content for ID: ${id}`);
        const response = await axios.get(`http://localhost:3000/v1/contents/${id}`);
        console.log('Content fetched:', response.data);
        
        // 응답 형식 확인 및 처리
        let contentData;
        if (response.data.content) {
          // 응답이 { content: {...} } 형식인 경우
          contentData = response.data.content;
        } else {
          // 응답이 직접 콘텐츠 객체인 경우
          contentData = response.data;
        }
        
        if (!contentData || !contentData.title) {
          throw new Error('유효한 콘텐츠 데이터가 없습니다.');
        }
        
        setContent(contentData);
        
        // 메인 콘텐츠 가져오기 시도
        try {
          const mainContentResponse = await axios.get(
            `http://localhost:3000/v1/main-contents/content/${id}/latest`
          );
          
          console.log('Main content fetched:', mainContentResponse.data);
          
          if (mainContentResponse.data.content) {
            // 문자열이 아닌 경우 JSON.stringify 처리
            const contentStr = typeof mainContentResponse.data.content === 'string' 
              ? mainContentResponse.data.content 
              : JSON.stringify(mainContentResponse.data.content);
            
            setEditorContent(contentStr);
          }
          
          setContentUuid(mainContentResponse.data.uuid);
          setPrevUuid(mainContentResponse.data.prevUuid);
        } catch (mainContentError) {
          console.error('Error fetching main content:', mainContentError);
          // 메인 콘텐츠가 없는 경우 빈 에디터 초기화
          setEditorContent('');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('콘텐츠를 불러오는 데 실패했습니다: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id]);

  // 콘텐츠 저장 핸들러
  const handleSave = async (editorContent) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // 토큰 가져오기
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      let headers = {
        'Content-Type': 'application/json'
      };
      if (tokens && tokens.access && tokens.access.token) {
        headers['Authorization'] = `Bearer ${tokens.access.token}`;
      }
      
      let response;
      
      if (id) {
        console.log(`Saving content for ID: ${id}, UUID: ${contentUuid || 'new'}`);
        
        if (!content) {
          throw new Error('콘텐츠 정보를 찾을 수 없습니다.');
        }
        
        // 컨텐츠 데이터 준비
        const contentData = {
          content: editorContent,
          title: content.title,
          contentId: parseInt(id)
        };
        
        // contentUuid가 있으면 기존 main-content 업데이트, 없으면 새로 생성
        if (contentUuid) {
          // 기존 메인 콘텐츠 업데이트 (새 버전 생성)
          console.log('Updating existing main content with UUID:', contentUuid);
          response = await axios.patch(
            `http://localhost:3000/v1/main-contents/${contentUuid}`,
            contentData,
            { headers }
          );
        } else {
          // 새 메인 콘텐츠 생성
          console.log('Creating new main content for contentId:', id);
          contentData.prevUuid = prevUuid; // 이전 UUID 설정
          
          response = await axios.post(
            'http://localhost:3000/v1/main-contents',
            contentData,
            { headers }
          );
          
          // 새로 생성된 UUID 저장
          if (response.data && response.data.uuid) {
            setContentUuid(response.data.uuid);
          }
        }
        
        console.log('Main content saved:', response.data);
        setSuccess('콘텐츠가 성공적으로 저장되었습니다!');
        
        // 성공 후 메인 페이지로 리디렉션
        setTimeout(() => {
          navigate(`/content/${id}`);
        }, 2000);
      } else {
        // 새 콘텐츠 생성 (이미 이미지와 제목이 있는 경우)
        setError('먼저 이미지와 제목을 등록해야 합니다.');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      
      if (error.response) {
        setError(error.response.data.message || `서버 오류: ${error.response.status}`);
      } else if (error.request) {
        setError('서버로부터 응답이 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
      } else {
        setError(`오류: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">방탈출 게임 콘텐츠 편집</h1>
      
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
      
      {content && (
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold">{content.title}</h2>
          {content.image && (
            <img 
              src={content.image.startsWith('http') 
                ? content.image 
                : `http://localhost:3000${content.image}`}
              alt={content.title}
              className="object-cover w-full mb-4 rounded max-h-64"
              crossOrigin="anonymous"
            />
          )}
        </div>
      )}
      
      {!content && id && (
        <div className="p-4 mb-4 text-yellow-700 bg-yellow-100 rounded">
          <p>콘텐츠 정보를 불러오는 중이거나 찾을 수 없습니다.</p>
          <p className="mt-2 text-sm">
            ID: {id}, UUID: {contentUuid || '없음'}
          </p>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          콘텐츠 내용
        </label>
        
        <SummernoteEditor 
          initialContent={editorContent} 
          onSave={handleSave}
          placeholder="내용을 입력하세요..."
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          취소
        </button>
      </div>
    </div>
  );
}

