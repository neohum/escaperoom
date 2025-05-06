import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="mb-4 text-4xl font-bold text-red-600">404</h1>
      <h2 className="mb-6 text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
      <p className="mb-8 text-gray-600">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Link
        to="/"
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}