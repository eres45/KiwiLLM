import React, { useState, useEffect } from 'react';
import { Search, Info, Crown, Clock, Activity, Zap, Box, Cpu, Sparkles, Code, LayoutGrid, Image, Mic, MessageSquare } from 'lucide-react';
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
            id: 'deepseek-v3',
            name: 'deepseek-v3',
            provider: 'DeepSeek',
            desc: 'Latest DeepSeek model with enhanced reasoning capabilities and superior performance.',
            context: '128k',
            tags: ['BETA', 'Reasoning'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'deepseek-r1',
            name: 'deepseek-r1',
            provider: 'DeepSeek',
            desc: 'Optimized for high-speed performance and efficient resource usage.',
            context: '128k',
            tags: ['Fast', 'Efficient'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'grok-4',
            name: 'grok-4',
            provider: 'xAI',
            desc: 'Advanced model from xAI with strong reasoning and real-time knowledge.',
            context: '256k',
            tags: ['Reasoning', 'Function Calling'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'qwen2.5-72b-chat',
            name: 'qwen2.5-72b-chat',
            provider: 'Qwen',
            desc: 'Large language model optimized for chat and conversational AI.',
            context: '128k',
            tags: ['Chat', 'General'],
            icon: <Box size={24} />,
            tier: 'Basic Tier'
        },
        {
            id: 'qwen-coder-plus',
            name: 'qwen-coder-plus',
            provider: 'Qwen',
            desc: 'Specialized model for code generation, debugging, and analysis.',
            context: '128k',
            tags: ['Coding', 'Function Calling'],
            icon: <Code size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-oss-120b',
            name: 'gpt-oss-120b',
            provider: 'GPT-OSS',
            desc: 'Open source alternative to GPT-4 class models with broad knowledge.',
            context: '128k',
            tags: ['Open Source', 'General'],
            icon: <Cpu size={24} />,
            tier: 'Basic Tier'
        },
        {
            id: 'dark-code-76',
            name: 'dark-code-76',
            provider: 'DarkAI',
            desc: 'Powerful 12B coding model optimized for code generation and analysis.',
            context: '128k',
            tags: ['Coding', 'Fast'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        // Qwen 3 Series
        {
            id: 'qwen3-coder-plus',
            name: 'qwen3-coder-plus',
            provider: 'Qwen',
            desc: 'Flagship Qwen 3 coding model for advanced software development.',
            context: '128k',
            tags: ['Coding', 'SOTA'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-coder-480b-a35b-instruct',
            name: 'qwen3-coder-480b',
            provider: 'Qwen',
            desc: 'Massive 480B parameter coding model for complex architecture.',
            context: '128k',
            tags: ['Coding', 'Massive'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-chat',
            name: 'qwen3-72b-chat',
            provider: 'Qwen',
            desc: 'Advanced 72B chat model with improved reasoning and dialogue.',
            context: '128k',
            tags: ['Chat', 'Reasoning'],
            icon: <MessageSquare size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-coder',
            name: 'qwen3-72b-coder',
            provider: 'Qwen',
            desc: '72B parameter model specialized for code generation.',
            context: '128k',
            tags: ['Coding', 'Large'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-math',
            name: 'qwen3-72b-math',
            provider: 'Qwen',
            desc: 'Specialized model for mathematical reasoning and problem solving.',
            context: '128k',
            tags: ['Math', 'Reasoning'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-72b-vl',
            name: 'qwen3-72b-vl',
            provider: 'Qwen',
            desc: 'Vision-Language model capable of understanding images and text.',
            context: '128k',
            tags: ['Vision', 'Multimodal'],
            icon: <Image size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-32b-chat',
            name: 'qwen3-32b-chat',
            provider: 'Qwen',
            desc: 'Efficient 32B chat model balancing speed and performance.',
            context: '128k',
            tags: ['Chat', 'Balanced'],
            icon: <MessageSquare size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen3-32b-vl',
            name: 'qwen3-32b-vl',
            provider: 'Qwen',
            desc: 'Efficient Vision-Language model for image understanding.',
            context: '128k',
            tags: ['Vision', 'Fast'],
            icon: <Image size={24} />,
            tier: 'Free Tier'
        },
        // Qwen 2.5 Series
        {
            id: 'qwen2.5-72b-instruct',
            name: 'qwen2.5-72b-instruct',
            provider: 'Qwen',
            desc: 'Instruction-tuned model for following complex commands.',
            context: '128k',
            tags: ['Instruct', 'General'],
            icon: <Box size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'qwen2.5-72b-coder-instruct',
            name: 'qwen2.5-72b-coder',
            provider: 'Qwen',
            desc: 'Instruction-tuned coding model for precise code generation.',
            context: '128k',
            tags: ['Coding', 'Instruct'],
            icon: <Code size={24} />,
            tier: 'Free Tier'
        },
        // OpenAI GPT-5 Series
        {
            id: 'gpt-5',
            name: 'gpt-5',
            provider: 'OpenAI',
            desc: 'Next-generation foundation model with unprecedented capabilities.',
            context: '128k',
            tags: ['Future', 'SOTA'],
            icon: <Crown size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-5-mini',
            name: 'gpt-5-mini',
            provider: 'OpenAI',
            desc: 'Efficient version of GPT-5 for high-speed tasks.',
            context: '128k',
            tags: ['Future', 'Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gpt-5-nano',
            name: 'gpt-5-nano',
            provider: 'OpenAI',
            desc: 'Ultra-lightweight GPT-5 model for edge cases.',
            context: '32k',
            tags: ['Future', 'Ultra-Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        // OpenAI O-Series (Reasoning)
        {
            id: 'o3',
            name: 'o3',
            provider: 'OpenAI',
            desc: 'Advanced reasoning model for complex problem solving.',
            context: '128k',
            tags: ['Reasoning', 'SOTA'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'o3-mini',
            name: 'o3-mini',
            provider: 'OpenAI',
            desc: 'Fast reasoning model for quick logical tasks.',
            context: '128k',
            tags: ['Reasoning', 'Fast'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'o4-mini',
            name: 'o4-mini',
            provider: 'OpenAI',
            desc: 'Next-gen compact reasoning model.',
            context: '128k',
            tags: ['Reasoning', 'Future'],
            icon: <Cpu size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'o1',
            name: 'o1',
            provider: 'OpenAI',
            desc: 'First-generation reasoning model.',
            context: '128k',
            tags: ['Reasoning'],
            icon: <Cpu size={24} />,
            tier: 'Pro Tier'
        },
        // OpenAI GPT-4.1 Series
        {
            id: 'gpt-4.1',
            name: 'gpt-4.1',
            provider: 'OpenAI',
            desc: 'Enhanced GPT-4 model with improved accuracy.',
            context: '128k',
            tags: ['New', 'Reliable'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-4.1-mini',
            name: 'gpt-4.1-mini',
            provider: 'OpenAI',
            desc: 'Efficient GPT-4.1 model for general tasks.',
            context: '128k',
            tags: ['New', 'Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gpt-4.1-nano',
            name: 'gpt-4.1-nano',
            provider: 'OpenAI',
            desc: 'Compact GPT-4.1 model for simple queries.',
            context: '16k',
            tags: ['New', 'Ultra-Fast'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        // OpenAI GPT-4 Series
        {
            id: 'gpt-4o',
            name: 'gpt-4o',
            provider: 'OpenAI',
            desc: 'Omni model with multimodal capabilities.',
            context: '128k',
            tags: ['Multimodal', 'Versatile'],
            icon: <Box size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-4o-mini',
            name: 'gpt-4o-mini',
            provider: 'OpenAI',
            desc: 'Cost-effective small model for simple tasks.',
            context: '128k',
            tags: ['Efficient'],
            icon: <Zap size={24} />,
            tier: 'Free Tier'
        },
        {
            id: 'gpt-4-turbo',
            name: 'gpt-4-turbo',
            provider: 'OpenAI',
            desc: 'High-performance GPT-4 model.',
            context: '128k',
            tags: ['Powerful'],
            icon: <Box size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gpt-4',
            name: 'gpt-4',
            provider: 'OpenAI',
            desc: 'Classic GPT-4 model.',
            context: '8k',
            tags: ['Legacy'],
            icon: <Box size={24} />,
            tier: 'Pro Tier'
        },
        // Google Gemini Series
        {
            id: 'gemini-2.5-pro',
            name: 'gemini-2.5-pro',
            provider: 'Google',
            desc: 'Latest Gemini 2.5 Pro model for complex tasks.',
            context: '2m',
            tags: ['New', 'SOTA'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gemini-2.5-deep-search',
            name: 'gemini-2.5-deep-search',
            provider: 'Google',
            desc: 'Specialized Gemini model for deep research and search.',
            context: '128k',
            tags: ['Research', 'Search'],
            icon: <Sparkles size={24} />,
            tier: 'Pro Tier'
        },
        {
            id: 'gemini-2.5-flash',
            name: 'gemini-2.5-flash',
            provider: 'Google',
            desc: 'High-speed, cost-effective Gemini model.',
            context: '1m',
            tags: ['Fast', 'Efficient'],
            icon: <Zap size={24} />,
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
