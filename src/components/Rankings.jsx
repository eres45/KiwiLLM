import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Zap, Sparkles, Box, Code, Cpu, MessageSquare, Image, Crown, MessageCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const Rankings = () => {
    const [activeFilter, setActiveFilter] = useState('trending');
    const [rankingsData, setRankingsData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Model icons mapping
    const modelIcons = {
        'gpt-4': <Box size={20} />,
        'deepseek-v3': <Zap size={20} />,
        'deepseek-r1': <Zap size={20} />,
        'gpt-oss-120b': <Cpu size={20} />,
        'gpt-oss-20b': <Cpu size={20} />,
        'kimi-k2-instruct': <Sparkles size={20} />,
        'mistral-small': <Zap size={20} />,
        'qwen3-next': <Cpu size={20} />,
        'deepseek-v3.1': <Box size={20} />,
        'copilot-chat': <MessageCircle size={20} />,
        'copilot-think': <Cpu size={20} />,
        'gemini-pro': <Sparkles size={20} />,
        'llama-3-meta': <MessageSquare size={20} />
    };

    // Model descriptions
    const modelDescriptions = {
        'gpt-4': 'Powerful language model optimized for conversational AI and complex reasoning.',
        'deepseek-v3': 'Direct access to high-performance DeepSeek-v3.2 model.',
        'deepseek-r1': 'High-speed reasoning model with direct direct API access.',
        'gpt-oss-120b': 'High-performance open-source model with massive knowledge base.',
        'gpt-oss-20b': 'Efficient and fast open-source model for general purpose tasks.',
        'kimi-k2-instruct': 'Advanced instruction-following model with deep understanding.',
        'mistral-small': 'Balanced performance and efficiency (24B).',
        'qwen3-next': 'Top-tier Qwen 2.5 72B instruction model.',
        'deepseek-v3.1': 'Incremental update to the DeepSeek-v3 model with improved stability.',
        'copilot-chat': 'Your everyday AI companion for chat, writing, and creativity.',
        'copilot-think': 'Advanced reasoning model designed for deep thought and planning.',
        'gemini-pro': 'Next-gen Gemini 2.5 Pro multimodal model.',
        'llama-3-meta': 'Llama 3.1 405B - Largest open source model.'
    };

    // Fetch rankings data in real-time
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'modelRankings'),
            (snapshot) => {
                const data = [];
                snapshot.forEach(doc => {
                    data.push({ id: doc.id, ...doc.data() });
                });
                setRankingsData(data);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching rankings:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Sort and filter models based on active filter
    const getSortedModels = () => {
        let sorted = [...rankingsData];

        switch (activeFilter) {
            case 'today':
                sorted.sort((a, b) => (b.tokensToday || 0) - (a.tokensToday || 0));
                break;
            case 'week':
                sorted.sort((a, b) => (b.tokensThisWeek || 0) - (a.tokensThisWeek || 0));
                break;
            case 'month':
                sorted.sort((a, b) => (b.tokensThisMonth || 0) - (a.tokensThisMonth || 0));
                break;
            case 'trending':
            default:
                sorted.sort((a, b) => (b.trendPercentage || 0) - (a.trendPercentage || 0));
                break;
        }

        return sorted;
    };

    // Format token count for display
    const formatTokens = (tokens) => {
        if (!tokens) return '0';
        if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(2)}M`;
        if (tokens >= 1000) return `${(tokens / 1000).toFixed(2)}K`;
        return tokens.toString();
    };

    // Get token count based on active filter
    const getTokenCount = (model) => {
        switch (activeFilter) {
            case 'today':
                return model.tokensToday || 0;
            case 'week':
                return model.tokensThisWeek || 0;
            case 'month':
                return model.tokensThisMonth || 0;
            case 'trending':
            default:
                return model.totalTokens || 0;
        }
    };

    // Prepare graph data (last 40 days)
    const getGraphData = () => {
        if (rankingsData.length === 0) return [];

        // Aggregate all models' daily stats
        const aggregated = {};
        rankingsData.forEach(model => {
            const dailyStats = model.dailyStats || {};
            Object.keys(dailyStats).forEach(date => {
                aggregated[date] = (aggregated[date] || 0) + dailyStats[date];
            });
        });

        // Sort by date and get last 40 days
        const sorted = Object.keys(aggregated).sort().slice(-40);
        const maxTokens = Math.max(...sorted.map(date => aggregated[date]));

        return sorted.map(date => ({
            date,
            tokens: aggregated[date],
            height: (aggregated[date] / maxTokens) * 100
        }));
    };

    const sortedModels = getSortedModels();
    const graphData = getGraphData();

    return (
        <div className="page-container">
            <header className="page-header center">
                <h1>Model Rankings</h1>
                <p>Real-time token usage across all users</p>
            </header>

            {/* Graph Section */}
            <section className="chart-section">
                <div className="chart-header">
                    <h3>Token Usage Trend</h3>
                    <p>Aggregated token usage over the last 40 days</p>
                </div>
                <div className="chart-container">
                    <div className="y-axis">
                        <span>{formatTokens(Math.max(...graphData.map(d => d.tokens)))}</span>
                        <span>{formatTokens(Math.max(...graphData.map(d => d.tokens)) * 0.75)}</span>
                        <span>{formatTokens(Math.max(...graphData.map(d => d.tokens)) * 0.5)}</span>
                        <span>{formatTokens(Math.max(...graphData.map(d => d.tokens)) * 0.25)}</span>
                        <span>0</span>
                    </div>
                    <div className="bars-container">
                        {graphData.map((data, i) => (
                            <div
                                key={data.date}
                                className={`bar ${i >= graphData.length - 7 ? 'active' : ''}`}
                                style={{ height: `${data.height}%` }}
                                title={`${data.date}: ${formatTokens(data.tokens)} tokens`}
                            />
                        ))}
                    </div>
                    <div className="x-axis">
                        {graphData.length > 0 && (
                            <>
                                <span>{new Date(graphData[0]?.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                <span>{new Date(graphData[Math.floor(graphData.length / 3)]?.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                <span>{new Date(graphData[Math.floor(graphData.length * 2 / 3)]?.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                <span>{new Date(graphData[graphData.length - 1]?.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Filter Tabs */}
            <div className="rankings-tabs">
                <button
                    className={activeFilter === 'today' ? 'active' : ''}
                    onClick={() => setActiveFilter('today')}
                >
                    Top Today
                </button>
                <button
                    className={activeFilter === 'week' ? 'active' : ''}
                    onClick={() => setActiveFilter('week')}
                >
                    Top Week
                </button>
                <button
                    className={activeFilter === 'month' ? 'active' : ''}
                    onClick={() => setActiveFilter('month')}
                >
                    Top Month
                </button>
                <button
                    className={activeFilter === 'trending' ? 'active' : ''}
                    onClick={() => setActiveFilter('trending')}
                >
                    Trending
                </button>
            </div>

            {/* Rankings List */}
            <div className="rankings-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
                        Loading rankings...
                    </div>
                ) : sortedModels.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
                        No usage data yet. Start using models to see rankings!
                    </div>
                ) : (
                    sortedModels.map((model, index) => (
                        <div key={model.id} className="ranking-item">
                            <div className="rank-number">{index + 1}.</div>
                            <div className="model-icon-rank">
                                {modelIcons[model.modelId] || <Box size={20} />}
                            </div>
                            <div className="model-details">
                                <h3>{model.provider}: {model.modelName}</h3>
                                <p>{modelDescriptions[model.modelId] || 'Advanced AI model for various tasks.'}</p>
                            </div>
                            <div className="model-stats">
                                <span className="tokens-count">{formatTokens(getTokenCount(model))} tokens</span>
                                <span className={`trend-badge ${model.trendPercentage >= 0 ? 'up' : 'down'}`}>
                                    {model.trendPercentage >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                    {Math.abs(model.trendPercentage || 0).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Rankings;
