import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, Video, AudioLines, FileText, CheckCircle2, Download } from 'lucide-react';

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [style, setStyle] = useState('Documentary');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [spokenIndex, setSpokenIndex] = useState(-1);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  const videoRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const parseTimestamp = (ts) => {
    // ts format: "00:00-00:05"
    if (!ts) return { start: 0, end: 0 };
    const parts = ts.split('-');
    if (parts.length < 2) return { start: 0, end: 0 };
    
    const toSeconds = (s) => {
      const p = s.split(':');
      if (p.length === 2) return parseInt(p[0]) * 60 + parseFloat(p[1]);
      return parseFloat(s);
    };
    
    return {
      start: toSeconds(parts[0]),
      end: toSeconds(parts[1])
    };
  };

  const speak = (text) => {
    if (!ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a decent English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Google') || v.name.includes('Natural')));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const timeUpdate = () => {
    if (videoRef.current) {
      const ct = videoRef.current.currentTime;
      setCurrentTime(ct);
      
      if (result && result.commentary && ttsEnabled) {
        const activeIdx = result.commentary.findIndex(c => {
          const times = parseTimestamp(c.timestamp);
          return ct >= times.start && ct <= times.end;
        });

        if (activeIdx !== -1 && activeIdx !== spokenIndex) {
          setSpokenIndex(activeIdx);
          speak(result.commentary[activeIdx].narration);
          // Lower video volume slightly while it speaks
          videoRef.current.volume = 0.2;
        } else if (activeIdx === -1) {
          // Restore video volume if nothing is spoken
          videoRef.current.volume = 1.0;
        }
      }
    }
  };

  const generateCommentary = async () => {
    if (!videoFile) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('style', style);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/analyze-video`, formData);
      setResult(response.data.data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || error.message;
      alert(`Failed to analyze video:\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async () => {
    if (!videoFile || !result) return;
    setDownloading(true);
    
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('commentary', JSON.stringify(result.commentary || []));
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/download-video`, formData);
      const downloadUrl = response.data.url;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'AI_' + videoFile.name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert('Failed to generate video download.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="brand">
          <AudioLines size={28} color="var(--accent-primary)" />
          <span>Cinematic Intelligence</span>
        </div>
      </header>

      {!result && !loading && (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Click or drag to replace</p>
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
                <option value="Documentary">Documentary</option>
                <option value="Funny">Funny</option>
                <option value="Dramatic">Dramatic</option>
                <option value="Educational">Educational</option>
                <option value="Sports Commentary">Sports Commentary</option>
              </select>
            </div>
            
            <button 
              className="btn-primary" 
              onClick={generateCommentary}
              disabled={!videoFile}
            >
              Generate AI Commentary
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="pulse-monitor"></div>
          <h2>Analyzing frames and synthesizing voice-over...</h2>
          <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>This might take a minute.</p>
        </div>
      )}

      {result && !loading && (
        <div className="dashboard">
          <div className="video-column">
            <div className="video-player-container">
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                onPlay={() => {
                   if (videoRef.current) videoRef.current.volume = 1.0;
                }}
                onPause={() => window.speechSynthesis.cancel()}
                onTimeUpdate={timeUpdate}
              />
            </div>
            
            <div style={{marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                 <button 
                   onClick={() => {
                     setTtsEnabled(!ttsEnabled);
                     if (ttsEnabled) window.speechSynthesis.cancel();
                   }}
                   style={{
                     background: ttsEnabled ? 'var(--accent-primary)' : 'var(--bg-surface-high)',
                     color: ttsEnabled ? '#000' : 'white',
                     border: 'none',
                     padding: '0.5rem 1rem',
                     borderRadius: '0.5rem',
                     cursor: 'pointer',
                     fontWeight: 'bold',
                     transition: 'all 0.2s'
                   }}
                 >
                   {ttsEnabled ? '🔊 AI Voice On' : '🔇 AI Voice Off'}
                 </button>
                 
                 <button 
                   onClick={downloadVideo}
                   disabled={downloading}
                   style={{
                     background: 'var(--bg-surface-high)',
                     color: 'white',
                     border: '1px solid var(--accent-primary)',
                     padding: '0.5rem 1rem',
                     borderRadius: '0.5rem',
                     cursor: downloading ? 'not-allowed' : 'pointer',
                     fontWeight: 'bold',
                     transition: 'all 0.2s',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     opacity: downloading ? 0.7 : 1
                   }}
                 >
                   <Download size={16} />
                   {downloading ? 'Processing & Muxing...' : 'Download Final Video'}
                 </button>
               </div>
            </div>
            
            <div style={{marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
               <div className="insight-card">
                 <div className="insight-header"><FileText size={14} style={{display:'inline', marginRight:'4px'}}/> Summary</div>
                 <div className="insight-value" style={{fontSize: '0.875rem'}}>{result.summary}</div>
               </div>
               <div className="insight-card">
                 <div className="insight-header"><AudioLines size={14} style={{display:'inline', marginRight:'4px'}}/> Music Mood</div>
                 <div className="insight-value">{result.music_mood}</div>
               </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column'}}>
            <h2 style={{color: 'white', marginBottom: '0.5rem'}}>{result.title}</h2>
            <div className="insight-header">Generated Script</div>
            
            <div className="narrations-container">
              {result.commentary && result.commentary.map((c, i) => {
                const times = parseTimestamp(c.timestamp);
                const isActive = currentTime >= times.start && currentTime <= times.end;
                
                return (
                  <div key={i} className={`narration-item ${isActive ? 'active' : ''}`}>
                    <div className="timestamp">{c.timestamp}</div>
                    <div className="narration-text">{c.narration}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
