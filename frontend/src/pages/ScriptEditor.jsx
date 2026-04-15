import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const ScriptEditor = () => {
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
                const res = await axios.get(`http://localhost:8000/result/${jobId}`, {
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

    const handleTextChange = (index, value) => {
        const updated = [...commentary];
        updated[index].narration = value;
        setCommentary(updated);
    };

    const handleTimeChange = (index, value) => {
        const updated = [...commentary];
        updated[index].start_time = value;
        setCommentary(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`http://localhost:8000/regenerate/${jobId}`, 
                { commentary },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            alert("Regeneration started! Redirecting to dashboard...");
            navigate(`/?polling=${jobId}`);
        } catch (err) {
            alert("Failed to regenerate: " + (err.response?.data?.detail || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-container">Loading Editor...</div>;

    return (
        <div className="page-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
            <h1 className="cinematic-title">Timeless Script Editor</h1>
            <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
                Tweak the narration and timing. Click regenerate to update the audio instantly.
            </p>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                {/* Left: Preview/Info */}
                <div className="upload-box" style={{height: 'fit-content'}}>
                    <h3>Original Insight</h3>
                    <p style={{fontStyle: 'italic', color: 'var(--accent-primary)'}}>{job?.music_mood || "Dynamic Mood"}</p>
                    <div style={{marginTop: '1rem', background: '#000', borderRadius: '8px', padding: '1rem', fontSize: '0.9rem'}}>
                        <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(job, null, 2)}</pre>
                    </div>
                </div>

                {/* Right: Editor Blocks */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {commentary.map((item, idx) => (
                        <div key={idx} className="upload-box" style={{padding: '1rem', textAlign: 'left'}}>
                            <div style={{display: 'flex', gap: '1rem', marginBottom: '0.5rem'}}>
                                <input 
                                    className="auth-input" 
                                    style={{width: '100px', margin: 0}}
                                    value={item.start_time}
                                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                                    placeholder="00:05"
                                />
                                <span style={{color: 'var(--text-secondary)', alignSelf: 'center'}}>Time</span>
                            </div>
                            <textarea 
                                className="auth-input"
                                style={{width: '100%', height: '80px', margin: 0, padding: '0.5rem'}}
                                value={item.narration}
                                onChange={(e) => handleTextChange(idx, e.target.value)}
                            />
                        </div>
                    ))}

                    <button 
                        className="cinematic-button" 
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Regenerating...' : '🔥 Save & Regenerate Audio'}
                    </button>
                    
                    <button 
                        className="cinematic-button" 
                        style={{background: 'transparent', border: '1px solid var(--text-secondary)', marginTop: '0.5rem'}}
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScriptEditor;
