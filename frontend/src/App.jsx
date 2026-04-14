import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { AudioLines } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import MyVideos from './pages/MyVideos';
import UploadDashboard from './pages/UploadDashboard';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function Layout({ children }) {
  const { isAuthenticated, logout } = useAuthStore();
  
  return (
    <div className="app-container">
      <header>
        <div className="brand" onClick={() => window.location.href='/'} style={{cursor: 'pointer'}}>
          <AudioLines size={28} color="var(--accent-primary)" />
          <span>FrameStory</span>
        </div>
        {isAuthenticated && (
            <div style={{display: 'flex', gap: '1rem'}}>
                <a href="/" style={{color: 'white', textDecoration: 'none'}}>New Video</a>
                <a href="/my-videos" style={{color: 'white', textDecoration: 'none'}}>My Videos</a>
                <button onClick={logout} style={{background: 'transparent', border: '1px solid var(--accent-primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: '0.5rem', cursor: 'pointer'}}>Logout</button>
            </div>
        )}
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><UploadDashboard /></ProtectedRoute>} />
          <Route path="/my-videos" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
