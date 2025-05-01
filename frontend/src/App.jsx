import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './components/MainPage.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Headers from './components/Header.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import ResetPassword from './components/ResetPassword.jsx'
import MakeContent from './components/MakeContent.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <Headers />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/make_content" element={<MakeContent />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App