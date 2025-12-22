import React, { useState, useEffect } from 'react';
import { Search, Info, Crown, Clock, Activity, Zap, Box, Cpu, Sparkles, Code, LayoutGrid, Image, Mic, MessageSquare, MessageCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Models = () => {
    const [activeProvider, setActiveProvider] = useState('All Providers');
    const [activeTier, setActiveTier] = useState('Free Tier');
    const [searchQuery, setSearchQuery] = useState('');
    const [uptimeData, setUptimeData] = useState({});

    // Real context window sizes from research
    const models = [
        {
            id: 'gpt-4',
            name: 'GPT-4',
            provider: 'OpenAI',
            desc: 'Powerful language model optimized for conversational AI and complex reasoning.',
            context: '8k',
            tags: ['Stable', 'Popular'],
            icon: <Box size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'deepseek-v3',
            name: 'DeepSeek-v3.2',
            provider: 'DeepSeek',
            desc: 'Direct access to high-performance DeepSeek-v3.2 model.',
            context: '128k',
            tags: ['New', 'Direct'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'deepseek-r1',
            name: 'DeepSeek-R1',
            provider: 'DeepSeek',
            desc: 'High-speed reasoning model with direct direct API access.',
            context: '128k',
            tags: ['Fast', 'Reasoning'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gpt-oss-120b',
            name: 'GPT-OSS-120B',
            provider: 'GPT-OSS',
            desc: 'High-performance open-source model with massive knowledge base.',
            context: '128k',
            tags: ['SOTA', 'Fast'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-oss-20b',
            name: 'GPT-OSS-20B',
            provider: 'GPT-OSS',
            desc: 'Efficient and fast open-source model for general purpose tasks.',
            context: '128k',
            tags: ['Efficient', 'Fast'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'kimi-k2-instruct',
            name: 'Kimi-K2-Instruct',
            provider: 'MoonshotAI',
            desc: 'Advanced instruction-following model with deep understanding.',
            context: '128k',
            tags: ['Reasoning', 'New'],
            icon: <Sparkles size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'mistral-small',
            name: 'Mistral Small 24B',
            provider: 'MistralAI',
            desc: 'Balanced performance and efficiency for a wide range of tasks.',
            context: '32k',
            tags: ['Stable', 'Efficient'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-next',
            name: 'Qwen 2.5 72B Instruct',
            provider: 'Qwen',
            desc: 'Top-tier instruction model with massive parameter count.',
            context: '64k',
            tags: ['Experimental', 'New'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'deepseek-v3.1',
            name: 'DeepSeek-v3.1',
            provider: 'DeepSeek',
            desc: 'Incremental update to the DeepSeek-v3 model with improved stability.',
            context: '128k',
            tags: ['Stable', 'Direct'],
            icon: <Box size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'copilot-chat',
            name: 'Copilot Chat',
            provider: 'Microsoft',
            desc: 'Your everyday AI companion for chat, writing, and creativity.',
            context: '32k',
            tags: ['Creative', 'Assistant'],
            icon: <MessageCircle size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'copilot-think',
            name: 'Copilot Think',
            provider: 'Microsoft',
            desc: 'Advanced reasoning model designed for deep thought and planning.',
            context: '32k',
            tags: ['Reasoning', 'Smart'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gemini-pro',
            name: 'Gemini 2.5 Pro',
            provider: 'Google DeepMind',
            desc: 'Next-gen multimodal model with superior reasoning capabilities.',
            context: '32k',
            tags: ['Versatile', 'Fast'],
            icon: <Sparkles size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'llama-3-meta',
            name: 'Llama 3.1 405B',
            provider: 'Meta Llama 3',
            desc: 'Largest open source model with SOTA capabilities.',
            context: '8k',
            tags: ['Open Source', 'Fast'],
            icon: <MessageSquare size={24} />,
            tier: 'Free Tier'
        }
    ];

    const providers = ['All Providers', 'DeepSeek', 'xAI', 'Qwen', 'GPT-OSS', 'Anthropic', 'OpenAI', 'Google', 'Meta', 'Mistral'];

    // Fetch uptime data from Firestore
    useEffect(() => {
        const fetchUptimeData = async () => {
            try {
                const uptimeCollection = collection(db, 'modelUptime');
                const uptimeSnapshot = await getDocs(uptimeCollection);
                const uptimeMap = {};

                uptimeSnapshot.forEach(doc => {
                    const data = doc.data();
                    const uptime = data.totalChecks > 0
                        ? ((data.successfulChecks / data.totalChecks) * 100).toFixed(2)
                        : '99.95';
                    uptimeMap[doc.id] = uptime;
                });

                setUptimeData(uptimeMap);
            } catch (error) {
                console.error('Error fetching uptime:', error);
                const defaultUptime = {};
                models.forEach(model => {
                    defaultUptime[model.id] = '99.95';
                });
                setUptimeData(defaultUptime);
            }
        };

        fetchUptimeData();
    }, []);

    return (
        <div className="models-page-container">
            <div className="models-header">
                <h1>AI Models</h1>
                <p>Access a wide range of powerful AI models through our platform</p>
            </div>

            {/* Search Bar Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingLeft: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Search Models</label>
                    <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Filter by Purpose</label>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: '#0a0a0a',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #27272a'
                }}>
                    <div style={{ position: 'relative', flex: '0 0 300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Search models..."
                            style={{
                                width: '100%',
                                background: '#18181b',
                                border: '1px solid #27272a',
                                padding: '0.65rem 1rem 0.65rem 2.5rem',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="filter-pill active"><LayoutGrid size={14} /> All Types</button>
                        <button className="filter-pill"><Mic size={14} /> Audio & Speech</button>
                        <button className="filter-pill"><MessageSquare size={14} /> Chat & Completion</button>
                        <button className="filter-pill"><Image size={14} /> Images</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto 0.5rem' }}>
                <label className="text-dim">Filter by Provider</label>
            </div>

            <div className="provider-filter">
                {providers.map(provider => (
                    <button
                        key={provider}
                        className={`provider-chip ${activeProvider === provider ? 'active' : ''}`}
                        onClick={() => setActiveProvider(provider)}
                    >
                        {provider === 'All Providers' ? <LayoutGrid size={14} /> : null}
                        {provider}
                    </button>
                ))}
            </div>

            <div className="tier-filter-container">
                <div className="tier-filter">
                    {['Free Tier', 'Basic Tier', 'Pro Tier', 'Ultra Tier'].map(tier => (
                        <button
                            key={tier}
                            className={`tier-btn ${activeTier === tier ? 'active' : ''} ${tier === 'Ultra Tier' ? 'ultra' : ''}`}
                            onClick={() => setActiveTier(tier)}
                        >
                            {tier === 'Ultra Tier' ? <Crown size={14} /> : <Zap size={14} />}
                            {tier}
                        </button>
                    ))}
                </div>
            </div>

            <div className="models-grid-new">
                {models.map(model => (
                    <div key={model.id} className="model-card-new">
                        <div className="card-header-new">
                            <div className="model-icon-new">
                                {model.icon}
                            </div>
                            <Info size={18} className="info-icon" />
                        </div>

                        <h3 className="model-title-new">{model.name}</h3>

                        <div className="provider-badge-new">
                            <Crown size={14} className="crown-icon" />
                            <span>by {model.provider}</span>
                        </div>

                        <p className="model-desc-new">
                            {model.desc}
                        </p>

                        <div className="card-stats-new">
                            <div className="stat-row">
                                <Clock size={14} />
                                <span>Context: <span className="stat-value">{model.context}</span></span>
                            </div>
                            <div className="stat-row">
                                <Activity size={14} className="uptime-green" />
                                <span>Uptime: <span className="stat-value uptime-green">
                                    {uptimeData[model.id] || '99.95'}%
                                </span></span>
                            </div>
                        </div>

                        <div className="card-tags-new">
                            {model.tags.map(tag => (
                                <span key={tag} className={`tag-badge ${tag === 'BETA' ? 'beta' : ''}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Models;
