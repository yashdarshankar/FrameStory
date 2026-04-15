import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store';
import { UploadCloud, AudioLines, FileText, CheckCircle2, Download, RefreshCw, Lock } from 'lucide-react';

export default function UploadDashboard() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [style, setStyle] = useState('Documentary');
  
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  
  const [result, setResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      resetState();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      resetState();
    }
  };

  const resetState = () => {
    setJobId(null);
    setStatus(null);
    setResult(null);
    setDownloadUrl(null);
  };

  const submitVideo = async () => {
    if (!videoFile) return;
    
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('style', style);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/upload-video`, formData);
      setJobId(response.data.job_id);
      setStatus("PENDING");
    } catch (error) {
      alert("Failed to submit video.");
    }
  };

  useEffect(() => {
    let intervalId;
    
    const pollStatus = async () => {
      if (!jobId || status === "COMPLETED" || status === "FAILED") return;
      
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/status/${jobId}`);
        setStatus(res.data.status);
        
        if (res.data.status === "COMPLETED") {
            const resData = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/result/${jobId}`);
            setResult(resData.data);
            
            const dlData = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/download/${jobId}`);
            setDownloadUrl(dlData.data.url);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (jobId && status !== "COMPLETED" && status !== "FAILED") {
      pollStatus(); // initial
      intervalId = setInterval(pollStatus, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, status]);

  const parseTimestamp = (ts) => {
    if (!ts) return { start: 0, end: 0 };
    const parts = ts.split('-');
    if (parts.length < 2) return { start: 0, end: 0 };
    
    const toSeconds = (s) => {
      const p = s.split(':');
      if (p.length === 2) return parseInt(p[0]) * 60 + parseFloat(p[1]);
      return parseFloat(s);
    };
    
    return { start: toSeconds(parts[0]), end: toSeconds(parts[1]) };
  };

  const timeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <>
      {!jobId && (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s' }}>
          <div 
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input type="file" accept="video/*" onChange={handleFileSelect} />
            {videoUrl ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                  <CheckCircle2 size={48} color="var(--accent-primary)"/>
                  <h3 style={{color: 'white'}}>{videoFile.name}</h3>
                </div>
            ) : (
                <>
                  <UploadCloud size={48} className="upload-icon" />
                  <h2>Select a video file</h2>
                  <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Drag and drop your file here, or click to browse</p>
                </>
            )}
          </div>

          <div className="controls-section">
            <div className="input-group">
              <label>Commentary Style</label>
              <select className="style-select" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="Documentary">Documentary (Free)</option>
                <option value="Funny" disabled={!isAuthenticated}>Funny { !isAuthenticated && '🔒' }</option>
                <option value="Teacher" disabled={!isAuthenticated}>Teacher (Educational) { !isAuthenticated && '🔒' }</option>
                <option value="Sports" disabled={!isAuthenticated}>Sports Commentary { !isAuthenticated && '🔒' }</option>
                <option value="Spanish" disabled={!isAuthenticated}>Spanish Explorer (Multilingual) { !isAuthenticated && '🔒' }</option>
                <option value="French" disabled={!isAuthenticated}>French Gourmet (Multilingual) { !isAuthenticated && '🔒' }</option>
                <option value="Japanese" disabled={!isAuthenticated}>Japanese Sensei (Multilingual) { !isAuthenticated && '🔒' }</option>
              </select>
              {!isAuthenticated && (
                <p style={{fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <Lock size={12} /> <a href="/login" style={{color: 'inherit'}}>Login</a> to unlock premium personas
                </p>
              )}
            </div>
            
            <button className="btn-primary" onClick={submitVideo} disabled={!videoFile}>
              Generate AI Commentary
            </button>
          </div>
        </div>
      )}

      {jobId && status !== "COMPLETED" && status !== "FAILED" && (
        <div className="loader-container">
          <div className="pulse-monitor"></div>
          <h2>Intelligence Engine is Processing</h2>
          <p style={{color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 'bold'}}>{status}</p>
          <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
            The AI is analyzing frames, identifying key highlights, and weaving the audio persona.
          </p>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="loader-container">
          <h2 style={{color: '#ffb4ab'}}>Job Failed</h2>
          <button className="btn-primary" onClick={resetState} style={{marginTop: '2rem'}}>Try Again</button>
        </div>
      )}

      {status === "COMPLETED" && result && (
        <div className="dashboard">
          <div className="video-column">
            <div className="video-player-container">
              <video 
                ref={videoRef}
                src={downloadUrl || videoUrl} 
                controls 
                onTimeUpdate={timeUpdate}
              />
            </div>
            
             <div style={{marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'}}>
               <div style={{display: 'flex', gap: '1rem'}}>
                 {downloadUrl && (
                  <a 
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'var(--bg-surface-high)',
                      color: 'white',
                      border: '1px solid var(--accent-primary)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Download size={16} /> Download
                  </a>
                 )}

                 <a 
                    href={`/edit/${jobId}`}
                    style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RefreshCw size={16} /> Open Timeless Editor
                  </a>
               </div>
            </div>
            
            <div style={{marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
               <div className="insight-card">
                 <div className="insight-header"><FileText size={14} style={{display:'inline', marginRight:'4px'}}/> Summary</div>
                 <div className="insight-value" style={{fontSize: '0.875rem'}}>{result.summary}</div>
               </div>
               <div className="insight-card">
                 <div className="insight-header"><AudioLines size={14} style={{display:'inline', marginRight:'4px'}}/> Music Mood</div>
                 <div className="insight-value" style={{fontSize: '0.875rem'}}>{result.music_mood}</div>
               </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column'}}>
            <h2 style={{color: 'white', marginBottom: '0.5rem'}}>{result.title}</h2>
            <div className="insight-header">Script Timeline</div>
            
            <div className="narrations-container">
              {result.commentary && result.commentary.map((c, i) => {
                const times = parseTimestamp(c.end_time ? `${c.start_time}-${c.end_time}` : c.timestamp);
                const isActive = currentTime >= times.start && currentTime <= times.end;
                
                return (
                  <div key={i} className={`narration-item ${isActive ? 'active' : ''}`}>
                    <div className="timestamp">{c.start_time} - {c.end_time}</div>
                    <div className="narration-text" style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>{c.narration}</div>
                    {c.description && <div className="narration-text" style={{fontStyle: 'italic', fontSize: '0.75rem'}}>Context: {c.description}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
