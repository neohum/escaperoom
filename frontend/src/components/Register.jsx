import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import api from '../services/api' // API 서비스 import

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'  // default role
  })
  const [error, setError] = useState('')
  const [serverStatus, setServerStatus] = useState('checking')
  const [serverMessage, setServerMessage] = useState('')
  const navigate = useNavigate()

  // 컴포넌트 마운트 시 서버 테스트
  useEffect(() => {
    const testServer = async () => {
      try {
        console.log('Testing server connection...');
        
        // 1. 기본 fetch 테스트
        try {
          const response = await fetch('http://localhost:3000/status');
          const data = await response.json();
          console.log('Server status (fetch):', data);
          setServerStatus('online');
          setServerMessage(data.message || 'Server is online');
          return;
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
        }
        
        // 2. XMLHttpRequest 테스트
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', 'http://localhost:3000/status', true);
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              console.log('Server status (XHR):', data);
              setServerStatus('online');
              setServerMessage(data.message || 'Server is online');
            } else {
              console.error('XHR error:', xhr.statusText);
              setServerStatus('offline');
              setError(`XHR error: ${xhr.status} ${xhr.statusText}`);
            }
          };
          xhr.onerror = function() {
            console.error('XHR network error');
            setServerStatus('offline');
            setError('XHR network error. Server might be down or CORS issue.');
          };
          xhr.send();
          return;
        } catch (xhrError) {
          console.error('XHR setup error:', xhrError);
        }
        
        // 3. axios 테스트
        try {
          const response = await axios.get('http://localhost:3000/status');
          console.log('Server status (axios):', response.data);
          setServerStatus('online');
          setServerMessage(response.data.message || 'Server is online');
          return;
        } catch (axiosError) {
          console.error('Axios error:', axiosError);
          setServerStatus('offline');
          setError(`Axios error: ${axiosError.message}`);
        }
      } catch (err) {
        console.error('Error testing server:', err);
        setServerStatus('offline');
        setError('Cannot connect to server. Please check if the server is running.');
      }
    };

    testServer();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (serverStatus === 'offline') {
      setError('Server is offline. Please check if the server is running.');
      return;
    }

    try {
      console.log('Sending registration request through proxy');
      
      // 프록시를 통한 요청 (상대 경로 사용)
      const response = await fetch('/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      // Store tokens in localStorage
      if (data.tokens) {
        localStorage.setItem('tokens', JSON.stringify(data.tokens));
      }
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="flex flex-col justify-center flex-1 min-h-full px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="w-auto h-10 mx-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-center text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {serverStatus === 'checking' && (
          <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg">
            Checking server status...
          </div>
        )}
        
        {serverStatus === 'offline' && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            Server is offline. Please check if the server is running.
          </div>
        )}
        
        {serverStatus === 'online' && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            Server is online. {serverMessage}
          </div>
        )}
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 폼 내용 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={serverStatus === 'offline' || serverStatus === 'checking'}
              className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                serverStatus === 'offline' || serverStatus === 'checking'
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
