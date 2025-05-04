import { createContext, useState, useEffect, useContext } from 'react'


const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 로드 시 로그인 상태 확인
    checkLoginStatus()
  }, [])

  const checkLoginStatus = () => {
    setLoading(true)
    const tokens = localStorage.getItem('tokens')
    setIsLoggedIn(!!tokens)
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      // Check if we're receiving email and password or tokens directly
      let tokens;
      
      if (typeof email === 'string' && typeof password === 'string') {
        // We received email and password, need to authenticate with the server
        const response = await fetch('http://localhost:3000/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        tokens = data.tokens;
      } else {
        // We received tokens directly (for development mode or from another source)
        tokens = email; // In this case, email parameter contains the tokens
      }

      // Store tokens in localStorage
      localStorage.setItem('tokens', JSON.stringify(tokens));
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // For development mode, allow login with mock tokens if server is not available
      if (process.env.NODE_ENV !== 'production' && 
          error instanceof TypeError && 
          error.message === 'Failed to fetch') {
        
        console.log('Development mode: Creating mock tokens for testing');
        
        // Only proceed with mock login if explicitly requested
        if (window.confirm('Server is not available. Use development mode login?')) {
          const mockTokens = {
            access: {
              token: 'mock-access-token',
              expires: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            },
            refresh: {
              token: 'mock-refresh-token',
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          };
          
          localStorage.setItem('tokens', JSON.stringify(mockTokens));
          setIsLoggedIn(true);
          return true;
        }
      }
      
      // If we reach here, login failed
      throw error;
    }
  }

  const logout = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('tokens'))
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token found')
      }

      const response = await fetch('http://localhost:3000/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken
        })
      })

      if (!response.ok) {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('tokens')
      setIsLoggedIn(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
