import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/register`, formData);
      alert("Registration successful, you may now login");
      navigate('/login');
    } catch(err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="glass-panel" style={{maxWidth: '400px', margin: '4rem auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <h2>Register</h2>
      <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
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
        <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Create Account</button>
      </form>
    </div>
  );
}
