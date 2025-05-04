import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MainPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 콘텐츠 데이터 가져오기
    const fetchContents = async () => {
      try {
        console.log('Fetching contents from http://localhost:3000/v1/contents');
        const response = await fetch('http://localhost:3000/v1/contents');
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch contents');
        }
        
        const data = await response.json();
        console.log('Fetched contents:', data);
        
        setContents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching contents:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  if (loading) {
    return <div className="py-24 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="py-24 text-center text-red-600">Error: {error}</div>;
  }

  // 콘텐츠가 없는 경우
  if (contents.length === 0) {
    return (
      <div className="py-24 bg-white sm:py-32">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 text-balance sm:text-5xl">
              방탈출 2.0
            </h2>
            <p className="mt-2 text-gray-600 text-lg/8">새로운 방탈출을 경험하세요.</p>
            <p className="mt-6 text-gray-500">등록된 콘텐츠가 없습니다. 새 콘텐츠를 만들어보세요!</p>
            <Link
              to="/make_content"
              className="inline-block px-4 py-2 mt-4 text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              콘텐츠 만들기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-white sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 text-balance sm:text-5xl">
            방탈출 2.0
          </h2>
          <p className="mt-2 text-gray-600 text-lg/8">새로운 방탈출을 경험하세요.</p>
        </div>
        <div className="grid max-w-2xl grid-cols-1 mx-auto mt-16 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {contents.map((content) => (
            <article key={content.id} className="flex flex-col items-start justify-between">
              <div className="relative w-full">
                {content.image ? (
                  <img
                    alt={content.title}
                    src={`http://localhost:3000${content.image}`}
                    className="object-cover w-full bg-gray-100 aspect-video rounded-2xl sm:aspect-2/1 lg:aspect-3/2"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full bg-gray-200 aspect-video rounded-2xl sm:aspect-2/1 lg:aspect-3/2">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
              <div className="max-w-xl">
                <div className="flex items-center mt-8 text-xs gap-x-4">
                  <time dateTime={new Date(content.createdAt).toISOString()} className="text-gray-500">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="relative group">
                  <h3 className="mt-3 font-semibold text-gray-900 text-lg/6 group-hover:text-gray-600">
                    <Link to={`/content/${content.id}`}>
                      <span className="absolute inset-0" />
                      {content.title}
                    </Link>
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
