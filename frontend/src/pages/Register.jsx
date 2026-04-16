import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Film, ChevronRight, CheckCircle } from 'lucide-react';

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
      
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, formData);
      alert("Account created successfully!");
      navigate('/login');
    } catch(err) {
      alert("Registration failed. Account might already exist.");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '40% 60%',
      background: 'var(--bg-base)',
      overflow: 'hidden'
    }}>
      {/* Left Feature Side: Cinematic Branding (Consistent with Login) */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-gradient-start), var(--accent-gradient-end))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{position: 'relative', zIndex: 10}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
                <div style={{background: 'white', color: 'var(--accent-primary)', padding: '0.75rem', borderRadius: '1rem'}}>
                    <Film size={32} />
                </div>
                <h1 style={{fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700}}>FrameStory</h1>
            </div>
            
            <h2 style={{fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 700}}>Join the Pro <br/> Editorial Suite.</h2>
            <p style={{fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '400px'}}>
                Create your account to save infinite cinematic stories, unlock all AI narrators, and access the Timeless Studio.
            </p>
            
            <div style={{marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <CheckCircle size={20} color="rgba(255,255,255,0.6)" />
                    <span>Unlimited 4K Neural Narrations</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <CheckCircle size={20} color="rgba(255,255,255,0.6)" />
                    <span>Cloud Storage for Cinematic Assets</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <CheckCircle size={20} color="rgba(255,255,255,0.6)" />
                    <span>Priority Processing Queue</span>
                </div>
            </div>
        </div>
      </div>

      {/* Right Form Side: Reg Panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        background: 'var(--bg-base)'
      }}>
        <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '3rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)'
        }}>
            <div style={{marginBottom: '2.5rem'}}>
                <h3 style={{fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem'}}>Begin Your Journey</h3>
                <p style={{color: 'var(--text-secondary)'}}>Create your FrameStory credentials.</p>
            </div>

            <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div className="input-group">
                    <label>Preferred Email</label>
                    <div style={{position: 'relative'}}>
                        <Mail size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                        <input 
                            type="text" 
                            placeholder="creator@framestory.ai"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="auth-input" 
                            style={{paddingLeft: '3rem'}} 
                            required 
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Secure Password</label>
                    <div style={{position: 'relative'}}>
                        <Lock size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                        <input 
                            type="password" 
                            placeholder="Create a strong password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="auth-input" 
                            style={{paddingLeft: '3rem'}} 
                            required 
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{marginTop: '1rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem'}}>
                    Initialize Account <UserPlus size={20} />
                </button>
            </form>

            <div style={{marginTop: '2rem', textAlign: 'center'}}>
                <p style={{color: 'var(--text-secondary)'}}>
                    Already have a studio? <Link to="/login" style={{color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700}}>Sign In Here</Link>
                </p>
                <button 
                    className="cinematic-button" 
                    style={{width: '100%', height: '50px', background: 'transparent', border: '1px solid var(--glass-border)', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                    onClick={() => navigate('/')}
                >
                    Back to Guest Mode <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
