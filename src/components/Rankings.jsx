import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Zap, Sparkles, Box, Code, Cpu, MessageSquare, Image, Crown } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const Rankings = () => {
    const [activeFilter, setActiveFilter] = useState('trending');
    const [rankingsData, setRankingsData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Model icons mapping
    const modelIcons = {
        'deepseek-v3': <Zap size={20} />,
        'deepseek-r1': <Zap size={20} />,
        'grok-4': <Sparkles size={20} />,
        'qwen2.5-72b-chat': <Box size={20} />,
        'qwen-coder-plus': <Code size={20} />,
        'gpt-oss-120b': <Cpu size={20} />,
        'dark-code-76': <Code size={20} />,
        // Qwen 3
        'qwen3-coder-plus': <Code size={20} />,
        'qwen3-coder-480b-a35b-instruct': <Code size={20} />,
        'qwen3-72b-chat': <MessageSquare size={20} />,
        'qwen3-72b-coder': <Code size={20} />,
        'qwen3-72b-math': <Cpu size={20} />,
        'qwen3-72b-vl': <Image size={20} />,
        'qwen3-32b-chat': <MessageSquare size={20} />,
        'qwen3-32b-vl': <Image size={20} />,
        // Qwen 2.5
        'qwen2.5-72b-instruct': <Box size={20} />,
        'qwen2.5-72b-coder-instruct': <Code size={20} />,
        // OpenAI GPT-5
        'gpt-5': <Crown size={20} />,
        'gpt-5-mini': <Zap size={20} />,
        'gpt-5-nano': <Zap size={20} />,
        // OpenAI O-Series
        'o3': <Cpu size={20} />,
        'o3-mini': <Cpu size={20} />,
        'o4-mini': <Cpu size={20} />,
        'o1': <Cpu size={20} />,
        // OpenAI GPT-4.1
        'gpt-4.1': <Sparkles size={20} />,
        'gpt-4.1-mini': <Zap size={20} />,
        'gpt-4.1-nano': <Zap size={20} />,
        // OpenAI GPT-4
        'gpt-4o': <Box size={20} />,
        'gpt-4o-mini': <Zap size={20} />,
        'gpt-4-turbo': <Box size={20} />,
        'gpt-4': <Box size={20} />
    };

    // Model descriptions
    const modelDescriptions = {
        'deepseek-v3': 'Latest DeepSeek model with enhanced reasoning capabilities and superior performance.',
        'deepseek-r1': 'Optimized for high-speed performance and efficient resource usage.',
        'grok-4': 'Advanced model from xAI with strong reasoning and real-time knowledge.',
        'qwen2.5-72b-chat': 'Large language model optimized for chat and conversational AI.',
        'qwen-coder-plus': 'Specialized model for code generation, debugging, and analysis.',
        'gpt-oss-120b': 'Open source alternative to GPT-4 class models with broad knowledge.',
        'dark-code-76': 'Powerful 12B coding model optimized for code generation and analysis.',
        // Qwen 3
        'qwen3-coder-plus': 'Flagship Qwen 3 coding model for advanced software development.',
        'qwen3-coder-480b-a35b-instruct': 'Massive 480B parameter coding model for complex architecture.',
        'qwen3-72b-chat': 'Advanced 72B chat model with improved reasoning and dialogue.',
        'qwen3-72b-coder': '72B parameter model specialized for code generation.',
        'qwen3-72b-math': 'Specialized model for mathematical reasoning and problem solving.',
        'qwen3-72b-vl': 'Vision-Language model capable of understanding images and text.',
        'qwen3-32b-chat': 'Efficient 32B chat model balancing speed and performance.',
        'qwen3-32b-vl': 'Efficient Vision-Language model for image understanding.',
        // Qwen 2.5
        'qwen2.5-72b-instruct': 'Instruction-tuned model for following complex commands.',
        'qwen2.5-72b-coder-instruct': 'Instruction-tuned coding model for precise code generation.',
        // OpenAI GPT-5
        'gpt-5': 'Next-generation foundation model with unprecedented capabilities.',
        'gpt-5-mini': 'Efficient version of GPT-5 for high-speed tasks.',
        'gpt-5-nano': 'Ultra-lightweight GPT-5 model for edge cases.',
        // OpenAI O-Series
        'o3': 'Advanced reasoning model for complex problem solving.',
        'o3-mini': 'Fast reasoning model for quick logical tasks.',
        'o4-mini': 'Next-gen compact reasoning model.',
        'o1': 'First-generation reasoning model.',
        // OpenAI GPT-4.1
        'gpt-4.1': 'Enhanced GPT-4 model with improved accuracy.',
        'gpt-4.1-mini': 'Efficient GPT-4.1 model for general tasks.',
        'gpt-4.1-nano': 'Compact GPT-4.1 model for simple queries.',
        // OpenAI GPT-4
        'gpt-4o': 'Omni model with multimodal capabilities.',
        'gpt-4o-mini': 'Cost-effective small model for simple tasks.',
        'gpt-4-turbo': 'High-performance GPT-4 model.',
        'gpt-4': 'Classic GPT-4 model.'
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
