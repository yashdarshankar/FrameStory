import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store';
import { Save, ChevronLeft, RefreshCcw, Video, Clock } from 'lucide-react';

export default function ScriptEditor() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const token = useAuthStore(state => state.token);
    const [job, setJob] = useState(null);
    const [commentary, setCommentary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/result/${jobId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setCommentary(res.data.commentary || []);
                setJob(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch script", err);
                setLoading(false);
            }
        };
        fetchResult();
    }, [jobId, token]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/regenerate/${jobId}`, 
                { commentary },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            navigate(`/?polling=${jobId}`);
        } catch (err) {
            alert("Failed to regenerate.");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="loader-container"><div className="pulse-monitor"></div></div>;

    return (
        <div className="main-layout" style={{gridTemplateColumns: '1fr 450px'}}>
            {/* Left: Studio Vision Case */}
            <section className="main-stage">
                <div className="glass-panel" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                        <button className="cinematic-button" onClick={() => navigate(-1)} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <ChevronLeft size={16} /> Dashboard
                        </button>
                        <h2 className="card-title" style={{margin: 0}}>Timeless Studio</h2>
                    </div>
                    
                    <div className="video-player-container" style={{background: '#000', flex: 1, marginBottom: '2rem'}}>
                         {/* Video preview could go here if we had a dedicated preview stream */}
                         <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column'}}>
                            <Video size={48} style={{marginBottom: '1rem', opacity: 0.5}} />
                            <p>Premium Cinematic Preview</p>
                         </div>
                    </div>

                    <div className="glass-panel" style={{background: 'var(--bg-surface-low)'}}>
                        <h4 className="card-title">Director's Analysis</h4>
                        <p style={{color: 'var(--text-secondary)'}}>{job?.summary}</p>
                    </div>
                </div>
            </section>

            {/* Right: Studio Timeline */}
            <aside className="sidebar-panel">
                <div className="glass-panel" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                    <h3 className="card-title">Story Timeline</h3>
                    <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem'}}>
                        {commentary.map((item, idx) => (
                            <div key={idx} style={{borderLeft: '2px solid var(--accent-primary)', paddingLeft: '1rem'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary)'}}>
                                    <Clock size={14} />
                                    <input 
                                        style={{background: 'transparent', border: 'none', color: 'inherit', fontWeight: 700, width: '60px'}}
                                        value={item.start_time}
                                        onChange={(e) => {
                                            const updated = [...commentary];
                                            updated[idx].start_time = e.target.value;
                                            setCommentary(updated);
                                        }}
                                    />
                                </div>
                                <textarea 
                                    className="style-select"
                                    style={{width: '100%', background: 'var(--bg-surface-low)', height: '100px', backgroundImage: 'none', padding: '0.75rem', fontSize: '0.9rem'}}
                                    value={item.narration}
                                    onChange={(e) => {
                                        const updated = [...commentary];
                                        updated[idx].narration = e.target.value;
                                        setCommentary(updated);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <RefreshCcw className="animate-spin" /> : <Save size={18} />}
                            {saving ? ' Regenerating...' : ' Master & Export'}
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
