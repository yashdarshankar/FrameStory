import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Video, ChevronRight, Play, Settings, RefreshCcw } from 'lucide-react';
import { useAuthStore } from '../store';

export default function MyVideos() {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/my-videos`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setVideos(response.data);
      } catch (err) {
        console.error("Failed to fetch videos.");
      }
    }
    fetchVideos();
  }, [token]);

  return (
    <div className="main-layout" style={{gridTemplateColumns: 'minmax(0, 1fr)'}}>
      <section className="main-stage">
        <div className="glass-panel" style={{marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
                <h1 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>Creative Arcade</h1>
                <p style={{color: 'var(--text-secondary)'}}>Your library of AI-enhanced neural stories.</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/')}>+ Narrate New Video</button>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem'}}>
            {videos.map(v => (
            <div key={v.id} className="glass-panel" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div className="video-player-container" style={{height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-low)'}}>
                    <Video size={48} color="var(--accent-primary)" style={{opacity: 0.3}} />
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div>
                        <h4 style={{margin: 0, fontSize: '1.125rem'}}>Story #{v.id.substring(0,8)}</h4>
                        <p style={{margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Persona: <strong>{v.persona}</strong></p>
                    </div>
                    <span style={{
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        background: v.status === 'COMPLETED' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface-high)',
                        color: v.status === 'COMPLETED' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {v.status}
                    </span>
                </div>
                
                <div style={{display: 'flex', gap: '0.75rem', marginTop: 'auto'}}>
                    {v.status === 'COMPLETED' && (
                        <>
                            <button 
                                className="btn-primary" 
                                style={{flex: 1, fontSize: '0.9rem'}}
                                onClick={() => navigate(`/?polling=${v.id}`)}
                            >
                                <Play size={16} /> View
                            </button>
                            <button 
                                className="cinematic-button" 
                                style={{flex: 1, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center'}}
                                onClick={() => navigate(`/edit/${v.id}`)}
                            >
                                <Settings size={16} /> Edit Script
                            </button>
                        </>
                    )}
                </div>
            </div>
            ))}
        </div>
        
        {videos.length === 0 && (
            <div className="glass-panel" style={{textAlign: 'center', padding: '4rem'}}>
                <Video size={64} color="var(--accent-primary)" style={{opacity: 0.2, marginBottom: '1rem'}} />
                <h2>No stories yet</h2>
                <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>Upload your first video to start building your archive.</p>
                <button className="btn-primary" onClick={() => navigate('/')}>Begin First Story</button>
            </div>
        )}
      </section>
    </div>
  );
}
