import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, Film, ChevronRight } from 'lucide-react';

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
      alert("Verification failed. Please check your credentials.");
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
      {/* Left Feature Side: Cinematic Branding */}
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
        {/* Animated Background Element */}
        <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'pulse 10s infinite alternate'
        }}></div>

        <div style={{position: 'relative', zIndex: 10}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
                <div style={{background: 'white', color: 'var(--accent-primary)', padding: '0.75rem', borderRadius: '1rem'}}>
                    <Film size={32} />
                </div>
                <h1 style={{fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700}}>FrameStory</h1>
            </div>
            
            <h2 style={{fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 700}}>The Future of <br/> Cinematic Insight.</h2>
            <p style={{fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '400px'}}>
                Sign in to access your personal vault, unlock premium narrators, and export 4K neural stories.
            </p>
            
            <div style={{marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <div style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%'}}><CheckCircle2 size={16} /></div>
                    <span>AI-Powered Multi-Voice Narration</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <div style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%'}}><CheckCircle2 size={16} /></div>
                    <span>Timeless Script Regeneration Studio</span>
                </div>
            </div>
        </div>
      </div>

      {/* Right Form Side: Auth Panel */}
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
                <h3 style={{fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem'}}>Welcome Back</h3>
                <p style={{color: 'var(--text-secondary)'}}>Access your creative workspace.</p>
            </div>

            <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div className="input-group">
                    <label>Email Address</label>
                    <div style={{position: 'relative'}}>
                        <Mail size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                        <input 
                            type="text" 
                            placeholder="director@framestory.ai"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="auth-input" 
                            style={{paddingLeft: '3rem'}} 
                            required 
                        />
                    </div>
                </div>

                <div className="input-group">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <label>Password</label>
                        <a href="#" style={{fontSize: '0.875rem', color: 'var(--accent-primary)', textDecoration: 'none'}}>Forgot password?</a>
                    </div>
                    <div style={{position: 'relative'}}>
                        <Lock size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} />
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="auth-input" 
                            style={{paddingLeft: '3rem'}} 
                            required 
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{marginTop: '1rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
                    Sign Into Studio <LogIn size={20} />
                </button>
            </form>

            <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <button 
                    className="cinematic-button" 
                    style={{width: '100%', height: '56px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}
                    onClick={() => navigate('/')}
                >
                    Continue as Guest <ChevronRight size={18} />
                </button>
                
                <p style={{textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)'}}>
                    Don't have an account? <Link to="/register" style={{color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700}}>Register Studio</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

const CheckCircle2 = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
