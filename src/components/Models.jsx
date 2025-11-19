import React, { useEffect, useState } from 'react';
import { Search, Box, Zap, Star } from 'lucide-react';

const Models = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching models or fetch from backend if ready
        // For now, hardcode some to show the UI
        const mockModels = [
            { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'OpenAI', context: '128k', input: '$0.50', output: '$1.50' },
            { id: 'grok-4', name: 'Grok 4', provider: 'xAI', context: '128k', input: '$2.00', output: '$6.00' },
            { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', context: '64k', input: '$0.10', output: '$0.30' },
            { id: 'qwen-coder-plus', name: 'Qwen Coder Plus', provider: 'Alibaba', context: '32k', input: '$0.20', output: '$0.60' },
        ];
        setModels(mockModels);
        setLoading(false);
    }, []);

    return (
        <div className="page-container" style={{ paddingTop: '80px', minHeight: '100vh', padding: '80px 2rem 2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Models</h1>
                        <p style={{ color: '#a1a1aa' }}>Explore available models and their pricing.</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Search models..."
                            style={{
                                background: '#18181b',
                                border: '1px solid #27272a',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                borderRadius: '8px',
                                color: 'white',
                                width: '300px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {models.map(model => (
                        <div key={model.id} style={{
                            background: '#0f0f11',
                            border: '1px solid #27272a',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <Box size={24} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', background: '#27272a', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{model.provider}</span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{model.name}</h3>
                            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{model.id}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#a1a1aa', borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
                                <span>Context: <span style={{ color: 'white' }}>{model.context}</span></span>
                                <span>Input: <span style={{ color: 'white' }}>{model.input}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Models;
