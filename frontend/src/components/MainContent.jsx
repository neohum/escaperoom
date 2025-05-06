import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SummernoteEditor from './SummernoteEditor.jsx';

export default function MainContent() {
  const [content, setContent] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contentUuid, setContentUuid] = useState(null);
  const [prevUuid, setPrevUuid] = useState(null);
  
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // 콘텐츠 불러오기
  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log(`Fetching content with ID: ${id}`);
        
        // 토큰 가져오기
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        let headers = {
          'Content-Type': 'application/json'
        };
        if (tokens && tokens.access && tokens.access.token) {
          headers['Authorization'] = `Bearer ${tokens.access.token}`;
        }
        
        // 콘텐츠 정보 가져오기
        const contentResponse = await fetch(`http://localhost:3000/v1/contents/${id}`, { headers });
        
        if (!contentResponse.ok) {
          throw new Error(`콘텐츠를 찾을 수 없습니다: ${contentResponse.status}`);
        }
        
        const contentData = await contentResponse.json();
        console.log('Content fetched:', contentData);
        setContent(contentData);
        
        // 메인 콘텐츠 가져오기 시도
        try {
          const mainContentResponse = await fetch(
            `http://localhost:3000/v1/main-contents/content/${id}/latest`,
            { headers }
          );
          
          if (mainContentResponse.ok) {
            const mainContentData = await mainContentResponse.json();
            console.log('Main content fetched:', mainContentData);
            
            // 콘텐츠 데이터 처리
            if (mainContentData.content) {
              // 문자열이 아닌 경우 JSON.stringify 처리
              const contentStr = typeof mainContentData.content === 'string' 
                ? mainContentData.content 
                : JSON.stringify(mainContentData.content);
              
              setEditorContent(contentStr);
            } else {
              setEditorContent('');
            }
            
            setContentUuid(mainContentData.uuid);
            setPrevUuid(mainContentData.prevUuid);
          }
        } catch (mainContentError) {
          console.error('Error fetching main content:', mainContentError);
          // 메인 콘텐츠가 없는 경우 빈 에디터 초기화
          setEditorContent('');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('콘텐츠를 불러오는 데 실패했습니다: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id]);

  // 콘텐츠 저장 핸들러
  const handleSave = async (content) => {
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
        console.log(`Updating content with ID: ${id} and UUID: ${contentUuid}`);
        
        // 메인 콘텐츠 존재 여부 확인
        try {
          // 최신 메인 콘텐츠 조회 시도
          const mainContentResponse = await fetch(
            `http://localhost:3000/v1/main-contents/content/${id}/latest`,
            { headers }
          );
          
          if (mainContentResponse.ok) {
            const mainContentData = await mainContentResponse.json();
            console.log('Existing main content found:', mainContentData);
            
            // 기존 메인 콘텐츠 업데이트 (새 버전 생성)
            response = await fetch(
              `http://localhost:3000/v1/main-contents/${mainContentData.uuid}`,
              {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                  content: content,
                  title: content?.title,
                  image: content?.image
                })
              }
            );
            
            console.log('Main content updated:', response);
          } else {  // 메인 콘텐츠가 존재하지 않는 경우, 새 메인 콘텐츠 생성
            console.log('No existing main content found, creating new one');
            
            response = await fetch(
              'http://localhost:3000/v1/main-contents',
              {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  content: content,
                  title: content?.title,
                  contentId: id,
                  uuid: contentUuid,
                  prevUuid: prevUuid
                })
              }
            );
            
            console.log('New main content created:', response);
          }
        }
        catch (error) {
          console.error('Error checking main content existence:', error);
        }
      }
      
      if (response && response.ok) {
        setSuccess('콘텐츠가 성공적으로 저장되었습니다!');
        
        // 성공 후 메인 페이지로 리디렉션
        setTimeout(() => {
          navigate(`/content/${id}`);
        }, 2000);
      } else {
        throw new Error('콘텐츠 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setError('콘텐츠 저장에 실패했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }
  
  return (
    <div className="max-w-4xl p-6 mx-auto">
      {!content && id && (
        <div className="p-4 mb-4 bg-yellow-100 text-yellow-700 rounded">
          <p>콘텐츠 정보를 불러오는 중이거나 찾을 수 없습니다.</p>
          <p className="mt-2 text-sm">
            ID: {id}, UUID: {contentUuid || '없음'}
          </p>
        </div>
      )}
      
      <SummernoteEditor 
        initialContent={editorContent} 
        onSave={handleSave} 
        readOnly={!isLoggedIn}
      />
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
    </div>
  );
}
