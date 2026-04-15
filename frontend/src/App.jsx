import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from './store';
import { AudioLines, Sun, Moon } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import MyVideos from './pages/MyVideos';
import UploadDashboard from './pages/UploadDashboard';
import ScriptEditor from './pages/ScriptEditor';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function Layout({ children, theme, toggleTheme }) {
  const { isAuthenticated, logout } = useAuthStore();
  
  return (
    <div className="app-wrapper">
      <header className="main-header">
        <div className="brand" onClick={() => window.location.href='/'} style={{cursor: 'pointer'}}>
          <AudioLines size={28} color="var(--accent-primary)" />
          <span>FrameStory</span>
        </div>
        <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
          <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
            <Link to="/" className="nav-link">New Video</Link>
            {isAuthenticated ? (
              <>
                <Link to="/my-videos" className="nav-link">My Vault</Link>
                <button onClick={logout} className="cinematic-button" style={{padding: '0.5rem 1.25rem', fontSize: '0.85rem'}}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="nav-link" style={{color: 'var(--accent-primary)', fontWeight: 700}}>Login</Link>
            )}
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <BrowserRouter>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<UploadDashboard />} />
          <Route path="/my-videos" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
          <Route path="/edit/:jobId" element={<ScriptEditor />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
