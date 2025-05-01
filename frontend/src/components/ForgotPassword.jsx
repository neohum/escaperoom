import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setNote('');
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/v1/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset email sent! Please check your inbox.');
      
      // 서버에서 추가 정보를 제공하는 경우 표시
      if (response.data.note) {
        setNote(response.data.note);
      }
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Forgot Password
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
            <p>{message}</p>
            {note && <p className="mt-2 text-sm">{note}</p>}
            <p className="mt-2 text-xs">
              <a 
                href="https://mailtrap.io/inboxes" 
                target="_blank"
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Visit Mailtrap inbox →
              </a>
            </p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
          <h3 className="font-medium mb-2">Using Mailtrap for Testing</h3>
          <p className="mb-2">
            This is a test environment. All emails will be sent to Mailtrap instead of real email addresses.
          </p>
          <p>
            To view sent emails, you need to:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Log in to your Mailtrap account</li>
            <li>Go to the inbox configured for this application</li>
            <li>Check for the password reset email</li>
          </ol>
        </div>
      </div>
    </div>
  );
}