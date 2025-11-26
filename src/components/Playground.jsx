import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, AlertCircle, Beaker, ThumbsUp, ThumbsDown, ExternalLink, Paperclip, ArrowUp, Clock, Calendar, Loader, ChevronDown } from 'lucide-react';

const Playground = () => {
    const [view, setView] = useState(() => localStorage.getItem('playground_view') || 'landing');
    const [showModal, setShowModal] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [selectedVersion, setSelectedVersion] = useState(null);

    // Chat State
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('deepseek-v3');
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (view === 'chat') {
            fetchModels();
        }
        localStorage.setItem('playground_view', view);
    }, [view]);

    const fetchModels = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/v1/models`);
            const data = await response.json();
            setModels(data.data || []);
        } catch (err) {
            console.error('Failed to fetch models:', err);
        }
    };

    const handleAccess = (version) => {
        setSelectedVersion(version);
        setShowModal(true);
    };

    const validateKey = async () => {
        if (!apiKey.trim()) {
            setError('Please enter an API key');
            return;
        }
        setIsValidating(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/v1/check-key`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (response.ok) {
                localStorage.setItem('kiwillm_api_key', apiKey);
                setShowModal(false);
                setView('chat');
            } else {
                const data = await response.json();
                setError(data.error || 'Invalid API Key');
            }
        } catch (err) {
            setError('Failed to validate key. Check your connection.');
        } finally {
            setIsValidating(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('kiwillm_api_key')}`
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [...messages, userMessage]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            const assistantMessage = {
                role: 'assistant',
                content: data.choices[0].message.content
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to get response. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Landing View
    if (view === 'landing') {
        return (
            <div style={{ paddingTop: '80px', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Chat Playground</h1>
                    <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>Experimental testing environment for chat completion models</p>
                </div>

                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    maxWidth: '900px',
                    width: '100%',
                    marginBottom: '3rem'
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <AlertCircle size={24} color="#60a5fa" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Not for Production Use</h3>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}>These chat playgrounds are experimental testing tools and not intended for production environments:</p>
                    <ul style={{ color: '#cbd5e1', fontSize: '0.95rem', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                        <li>Only support chat completion models (no embeddings, audio, images, or other endpoints)</li>
                        <li>May not work correctly in your browser - expect errors and compatibility issues</li>
                        <li>UI/UX is not well written or handled - our focus is on the API, not these playgrounds</li>
                        <li>Many bugs are still present - we're actively working on fixes but issues remain</li>
                        <li>V1 is more stable and actively used; V2 is highly unstable and not recommended</li>
                    </ul>
                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155', fontSize: '0.9rem', color: '#94a3b8' }}>
                        For production use, please integrate with our <a href="#" style={{ color: '#cbd5e1', textDecoration: 'underline' }}>API directly</a>.
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '900px', flexWrap: 'wrap' }}>
                    {/* V1 Card */}
                    <div style={{ flex: 1, minWidth: '300px', background: '#0f0f11', border: '1px solid #27272a', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Beaker size={24} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Playground V1</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', background: '#27272a', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #3f3f46' }}>Recommended</span>
                                <span style={{ fontSize: '0.75rem', background: '#27272a', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #3f3f46' }}>Experimental</span>
                            </div>
                        </div>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            More stable option. Actively used by many users. Still has bugs but more reliable than V2.
                        </p>

                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Key Features:</h4>
                            <ul style={{ color: '#a1a1aa', fontSize: '0.9rem', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                                <li>More stable and reliable</li>
                                <li>Actively used by many people</li>
                                <li>Better overall experience</li>
                                <li>Only supports chat completion models</li>
                                <li>May not work correctly in all browsers</li>
                            </ul>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="icon-btn"><ThumbsUp size={18} /></button>
                                <button className="icon-btn"><ThumbsDown size={18} /></button>
                            </div>
                            <button
                                onClick={() => handleAccess('v1')}
                                style={{
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Access V1 <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>

                    {/* V2 Card */}
                    <div style={{ flex: 1, minWidth: '300px', background: '#0f0f11', border: '1px solid #27272a', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Beaker size={24} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Playground V2</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', background: '#27272a', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #3f3f46' }}>Not Recommended</span>
                                <span style={{ fontSize: '0.75rem', background: '#27272a', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #3f3f46' }}>Experimental</span>
                            </div>
                        </div>
                        <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Experimental version with many issues. NOT recommended for use. Highly unstable and buggy.
                        </p>

                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Key Features:</h4>
                            <ul style={{ color: '#a1a1aa', fontSize: '0.9rem', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                                <li>Highly experimental and unstable</li>
                                <li>Many known bugs and issues</li>
                                <li>Not recommended for general use</li>
                                <li>Only supports chat completion models</li>
                                <li>May not work correctly in all browsers</li>
                            </ul>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="icon-btn"><ThumbsUp size={18} /></button>
                                <button className="icon-btn"><ThumbsDown size={18} /></button>
                            </div>
                            <button
                                onClick={() => handleAccess('v2')}
                                style={{
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Access V2 <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* API Key Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ background: '#18181b', padding: '2rem', borderRadius: '12px', width: '400px', border: '1px solid #27272a' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Enter API Key</h3>
                            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Please enter your KiwiLLM API key to access the playground.</p>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="kiwi-..."
                                style={{
                                    width: '100%', padding: '0.75rem', background: '#09090b',
                                    border: '1px solid #27272a', borderRadius: '6px', color: 'white', marginBottom: '1rem', outline: 'none'
                                }}
                            />
                            {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setShowModal(false)} className="btn-text">Cancel</button>
                                <button
                                    onClick={validateKey}
                                    disabled={isValidating}
                                    className="btn-primary"
                                    style={{ opacity: isValidating ? 0.7 : 1 }}
                                >
                                    {isValidating ? 'Validating...' : 'Access Playground'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Chat View
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div style={{
            paddingTop: '80px',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#050505',
            overflow: 'hidden'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                height: 'calc(100vh - 80px)',
                overflow: 'hidden',
                justifyContent: messages.length === 0 ? 'center' : 'flex-start'
            }}>
                {/* Messages Area - Only show when there are messages */}
                {messages.length > 0 && (
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        marginBottom: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        paddingRight: '0.5rem'
                    }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '75%',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    background: msg.role === 'user' ? '#6366f1' : '#18181b',
                                    border: msg.role === 'assistant' ? '1px solid #27272a' : 'none',
                                    boxShadow: msg.role === 'user' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: msg.role === 'user' ? '#e0e7ff' : '#71717a', marginBottom: '0.75rem', fontWeight: '500' }}>
                                        {msg.role === 'user' ? 'You' : selectedModel}
                                    </div>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem' }}>{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{ padding: '1.25rem', borderRadius: '16px', background: '#18181b', border: '1px solid #27272a' }}>
                                    <Loader size={20} className="spinning" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Welcome Header - Only show when no messages */}
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '500', marginBottom: '0' }}>What do you want to explore?</h1>
                    </div>
                )}

                {/* Input Box - Centered when empty, bottom when chatting */}
                <div style={{ marginTop: messages.length > 0 ? 'auto' : '0' }}>
                    <div style={{
                        background: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '16px',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: messages.length === 0 ? '1.5rem' : '0',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}>
                        <MessageSquare size={20} color="#71717a" />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask anything..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#27272a', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem',
                                    cursor: 'pointer', position: 'relative'
                                }}
                            >
                                <span style={{ background: '#22c55e', color: 'black', padding: '0 0.4rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>Free</span>
                                <span>{selectedModel}</span>
                                <span style={{ color: '#fbbf24', fontSize: '0.7rem', border: '1px solid #fbbf24', padding: '0 0.3rem', borderRadius: '4px' }}>Fn Call</span>
                                {showModelDropdown && (
                                    <div style={{
                                        position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem',
                                        background: '#18181b', border: '1px solid #27272a', borderRadius: '8px',
                                        maxHeight: '300px', overflowY: 'auto', zIndex: 100, minWidth: '250px'
                                    }}>
                                        {models.map(model => (
                                            <div
                                                key={model.id}
                                                onClick={(e) => { e.stopPropagation(); setSelectedModel(model.id); setShowModelDropdown(false); }}
                                                style={{
                                                    padding: '0.75rem 1rem', cursor: 'pointer',
                                                    background: selectedModel === model.id ? '#27272a' : 'transparent',
                                                    borderBottom: '1px solid #27272a',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ fontWeight: '500' }}>{model.id}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{model.owned_by}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="icon-btn"><Paperclip size={20} /></button>
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !input.trim()}
                                style={{
                                    background: '#6366f1',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                                    opacity: isLoading || !input.trim() ? 0.5 : 1
                                }}
                            >
                                <ArrowUp size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Time/Date badges - Only show when no messages */}
                    {messages.length === 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f0f11', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #27272a', fontSize: '0.9rem', color: '#a1a1aa' }}>
                                <Clock size={14} />
                                <span>{currentTime}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f0f11', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #27272a', fontSize: '0.9rem', color: '#a1a1aa' }}>
                                <Calendar size={14} />
                                <span>{currentDate}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Playground;
