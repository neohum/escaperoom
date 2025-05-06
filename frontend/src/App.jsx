import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import MainPage from './components/MainPage.jsx';
import LoginPage from './components/Login.jsx';
import RegisterPage from './components/Register.jsx';
import MakeContent from './components/MakeContent.jsx';
import MakeContentLayout from './pages/MakeContentLayout.jsx';
import MainContent from './components/MainContent.jsx';
import Header from './components/Header.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/make_content" element={<MakeContent />} />
          <Route path="/make_content/:id" element={<MakeContentLayout />} />
          <Route path="/content/:id" element={<MainContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
