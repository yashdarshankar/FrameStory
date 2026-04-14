import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch(err) {
      alert("Login failed");
    }
  };

  return (
    <div className="glass-panel" style={{maxWidth: '400px', margin: '4rem auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <h2>Intelligent Login</h2>
      <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div className="input-group">
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="style-select" 
            style={{backgroundImage: 'none'}} 
            required 
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="style-select" 
            style={{backgroundImage: 'none'}} 
            required 
          />
        </div>
        <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Login</button>
      </form>
      <div style={{marginTop: '1rem', textAlign: 'center'}}>
        <a href="/register" style={{color: 'var(--accent-primary)', textDecoration: 'none'}}>Need an account? Register here.</a>
      </div>
    </div>
  );
}
