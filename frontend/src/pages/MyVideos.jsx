import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Video } from 'lucide-react';

export default function MyVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/my-videos`);
        setVideos(response.data);
      } catch (err) {
        console.error("Failed to fetch videos.");
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="glass-panel" style={{margin: '2rem auto', maxWidth: '800px'}}>
      <h2 style={{marginBottom: '2rem'}}>My Videos</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {videos.map(v => (
          <div key={v.id} style={{
            background: 'var(--bg-surface)', 
            padding: '1rem', 
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <Video size={24} color="var(--accent-primary)" />
              <div>
                <h4 style={{margin: 0}}>Job ID: {v.id.substring(0,8)}...</h4>
                <p style={{margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Persona: {v.persona}</p>
              </div>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                <span style={{
                    color: v.status === 'COMPLETED' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                  {v.status}
                </span>
                
                 {v.status === 'COMPLETED' && v.video_url && (
                   <div style={{display: 'flex', gap: '0.5rem'}}>
                      <a 
                        href={`/edit/${v.id}`}
                        style={{
                          background: 'var(--accent-primary)',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Edit Story
                      </a>
                      <a 
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${v.video_url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          background: 'var(--bg-surface-low)',
                          border: '1px solid var(--accent-primary)',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        View Video
                      </a>
                   </div>
                 )}
            </div>
          </div>
        ))}
        {videos.length === 0 && <p>No videos uploaded yet.</p>}
      </div>
    </div>
  );
}
