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

  const login = (tokens) => {
    localStorage.setItem('tokens', JSON.stringify(tokens))
    setIsLoggedIn(true)
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