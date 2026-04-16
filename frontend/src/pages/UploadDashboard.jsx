import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store';
import { UploadCloud, CheckCircle2, Video, Lock, ChevronRight, Play, FileText, AudioLines, Download, RefreshCw } from 'lucide-react';

export default function UploadDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [style, setStyle] = useState('Documentary');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pollId = params.get('polling');
    if (pollId && !jobId) {
        setJobId(pollId);
        setStatus("REGENERATING_AUDIO");
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setJobId(null);
      setStatus(null);
    }
  };

  const submitVideo = async () => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('style', style);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload-video`, formData);
      setJobId(response.data.job_id);
      setStatus("PENDING");
    } catch (error) {
      alert("Error uploading video.");
    }
  };

  useEffect(() => {
    let intervalId;
    const pollStatus = async () => {
      if (!jobId || status === "COMPLETED" || status === "FAILED") return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/status/${jobId}`);
        setStatus(res.data.status);
        if (res.data.status === "COMPLETED") {
          const resData = await axios.get(`${import.meta.env.VITE_API_URL}/result/${jobId}`);
          setResult(resData.data);
          const dlData = await axios.get(`${import.meta.env.VITE_API_URL}/download/${jobId}`);
          setDownloadUrl(dlData.data.url);
        }
      } catch (err) { console.error(err); }
    };
    if (jobId && status !== "COMPLETED") {
      pollStatus();
      intervalId = setInterval(pollStatus, 3000);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [jobId, status]);

  const personas = [
    { id: 'Documentary', name: 'Documentary', icon: '🎬', premium: false },
    { id: 'Funny', name: 'Roast/Comedy', icon: '😂', premium: true },
    { id: 'Sports', name: 'Sports Guru', icon: '🏟️', premium: true },
    { id: 'Spanish', name: 'Spanish Explorer', icon: '🇪🇸', premium: true },
    { id: 'French', name: 'French Gourmet', icon: '🇫🇷', premium: true },
    { id: 'Japanese', name: 'Japanese Sensei', icon: '🇯🇵', premium: true },
  ];

  return (
    <div className="main-layout">
      {/* Left Sidebar: Persona Selector */}
      <aside className="sidebar-panel">
        <div className="glass-panel">
          <h3 className="card-title">Choose Voice Persona</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {personas.map(p => (
              <div 
                key={p.id} 
                className={`persona-item ${style === p.id ? 'active' : ''}`}
                onClick={() => (!p.premium || isAuthenticated) && setStyle(p.id)}
                style={{opacity: p.premium && !isAuthenticated ? 0.6 : 1}}
              >
                <span style={{fontSize: '1.5rem'}}>{p.icon}</span>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, fontSize: '0.9rem'}}>{p.name}</div>
                  <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>
                    {p.premium && !isAuthenticated ? 'Premium Only' : 'HD Narration'}
                  </div>
                </div>
                {p.premium && !isAuthenticated ? <Lock size={14} /> : <ChevronRight size={14} />}
              </div>
            ))}
          </div>
          {!isAuthenticated && <p style={{marginTop: '1rem', fontSize: '0.75rem', color: 'var(--accent-primary)'}}>Log in to unlock all voices.</p>}
        </div>
      </aside>

      {/* Main Content: Upload or Results */}
      <section className="main-stage" style={{padding: '1rem'}}>
        {!jobId ? (
          <div className="glass-panel" style={{height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem'}}>
            <div style={{textAlign: 'left'}}>
              <h1 style={{fontSize: '3.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em'}}>Elevate Every Frame.</h1>
              <p style={{fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px'}}>Transform your cinematic shots into narrated masterpieces using premium AI intelligence.</p>
            </div>

            <label className="upload-hero" style={{flex: 1, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem'}}>
              <input type="file" hidden onChange={handleFileSelect} />
              {videoUrl ? (
                <div className="animate-slide" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div style={{background: 'rgba(99,102,241,0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1rem'}}>
                    <CheckCircle2 size={72} color="var(--accent-primary)" />
                  </div>
                  <h2 style={{color: 'var(--text-primary)', fontSize: '1.5rem'}}>{videoFile.name}</h2>
                  <p style={{color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.5rem'}}>READY FOR NEURAL ANALYSIS</p>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div className="pulse-monitor" style={{width: '120px', height: '120px', position: 'absolute', opacity: 0.1}}></div>
                  <UploadCloud size={80} color="var(--accent-primary)" style={{marginBottom: '2rem', position: 'relative'}} />
                  <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Drop Cinematic Assets</h3>
                  <p style={{color: 'var(--text-secondary)'}}>Support for MP4, MOV, and AVI up to 4K</p>
                </div>
              )}
            </label>
            
            <button 
              className="btn-primary" 
              onClick={submitVideo} 
              disabled={!videoFile}
              style={{
                width: '100%', 
                height: '70px', 
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}
            >
              <Play size={24} fill="currentColor" /> Initialize AI Storyteller
            </button>
          </div>
        ) : status === "COMPLETED" && result ? (
          <div className="animate-slide" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
             <div className="glass-panel" style={{padding: 0, overflow: 'hidden'}}>
               <div className="video-player-container">
                  <video 
                    ref={videoRef}
                    src={downloadUrl || videoUrl} 
                    controls 
                    onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
                  />
               </div>
               <div style={{padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="cinematic-button" onClick={() => window.open(downloadUrl)}>
                      <Download size={18} /> Download Master
                    </button>
                    <button className="btn-primary" style={{padding: '0.5rem 1.5rem'}} onClick={() => window.location.href=`/edit/${jobId}`}>
                      <RefreshCw size={18} /> Open Timeless Editor
                    </button>
                  </div>
                  <div style={{fontWeight: 700, color: 'var(--accent-primary)'}}>
                    {style} Persona active
                  </div>
               </div>
             </div>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
               <div className="glass-panel">
                 <h4 className="card-title">Story Summary</h4>
                 <p style={{lineHeight: 1.6}}>{result.summary}</p>
               </div>
               <div className="glass-panel">
                 <h4 className="card-title">Audio Landscape</h4>
                 <p>Mood: <strong>{result.music_mood}</strong></p>
                 <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Music is automatically synced with visual keyframes.</p>
               </div>
             </div>
          </div>
        ) : (
          <div className="glass-panel" style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
             <div className="pulse-monitor"></div>
             <h2 style={{fontSize: '2rem'}}>{status}...</h2>
             <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>Visions are being analyzed by our neural engine.</p>
          </div>
        )}
      </section>

      {/* Right Sidebar: Timeline Insights */}
      <aside className="sidebar-panel">
        <div className="glass-panel" style={{height: '100%', maxHeight: 'calc(100vh - 120px)', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <h3 className="card-title">Story Timeline</h3>
          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem'}}>
            {result?.commentary ? result.commentary.map((c, i) => {
              const start = parseFloat(c.start_time?.split(':')[1]) + parseInt(c.start_time?.split(':')[0]) * 60;
              const end = parseFloat(c.end_time?.split(':')[1]) + parseInt(c.end_time?.split(':')[0]) * 60;
              const active = currentTime >= start && currentTime < end;
              return (
                <div key={i} className={`narration-item ${active ? 'active' : ''}`} style={{padding: '0.75rem', fontSize: '0.85rem'}}>
                  <div style={{color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '0.25rem'}}>{c.start_time}</div>
                  <div style={{color: 'var(--text-primary)', fontWeight: 600}}>{c.narration}</div>
                </div>
              );
            }) : <p style={{color: 'var(--text-secondary)'}}>No story analyzed yet.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}
