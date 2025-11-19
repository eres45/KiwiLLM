import React from 'react';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

const Rankings = () => {
    const categories = [
        "All Categories", "Biology", "Programming", "General", "Mathematics",
        "Technology", "Science", "Humanities", "Legal", "Finance", "Health", "Arts", "Academic"
    ];

    const models = [
        {
            rank: 1,
            name: "Google: Gemini 2.5 Pro Experimental",
            desc: "Gemini 2.5 Pro Experimental: an AI model designed for...",
            views: "12.8M",
            trend: "+1.2%",
            trendUp: true
        },
        {
            rank: 2,
            name: "Microsoft: MAIA OS R2 (free)",
            desc: "MAIA OS R2: A platform for the use of AI in education, R&D, enterprise by...",
            views: "7.73M",
            trend: "+0.8%",
            trendUp: true
        },
        {
            rank: 3,
            name: "Llama Guard 3 8B",
            desc: "Llama Guard 3: Large 8.7B parameter model, from Meta for...",
            views: "9.73M",
            trend: "+1.6%",
            trendUp: true
        },
        {
            rank: 4,
            name: "DeepSeek: R1 Qwen 1.5B",
            desc: "DeepSeek R1: Small Qwen 1.5B is a global neural language model for...",
            views: "3.79M",
            trend: "-0.9%",
            trendUp: false
        },
        {
            rank: 5,
            name: "THUDM: GLM 4 (free)",
            desc: "GLM-4: 2023-10-16 is a 4.3B finetuned open-world...",
            views: "269M",
            trend: "+8.5%",
            trendUp: true
        },
        {
            rank: 6,
            name: "DeepSeek: R1 Qwen Owen 1.5B",
            desc: "DeepSeek R1: Qwen Owen 1.5B is an open-source model for...",
            views: "2.65M",
            trend: "+0.3%",
            trendUp: true
        },
        {
            rank: 7,
            name: "Google: Gemini 2.5 Flash Preview",
            desc: "Gemini 2.5 Flash: A faster version of the Gemini model with...",
            views: "8.73M",
            trend: "+2.7%",
            trendUp: true
        }
    ];

    return (
        <div className="page-container">
            <header className="page-header center">
                <h1>LLM Rankings</h1>
                <p>Compare models for all prompts (0)</p>
            </header>

            <div className="rankings-filters">
                <span>Filter by Category:</span>
                <div className="filter-chips">
                    {categories.map((cat, index) => (
                        <button key={index} className={`chip ${index === 0 ? 'active' : ''}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <section className="chart-section">
                <div className="chart-header">
                    <h3>Usage Trend</h3>
                    <p>Aggregated token usage over time (static example)</p>
                </div>
                <div className="chart-container">
                    <div className="y-axis">
                        <span>2.2T</span>
                        <span>1.65T</span>
                        <span>1.1T</span>
                        <span>550B</span>
                        <span>0</span>
                    </div>
                    <div className="bars-container">
                        {Array.from({ length: 40 }).map((_, i) => {
                            const height = 10 + (i * 2) + Math.random() * 10;
                            const isActive = i > 30;
                            return (
                                <div
                                    key={i}
                                    className={`bar ${isActive ? 'active' : ''}`}
                                    style={{ height: `${height}%` }}
                                ></div>
                            );
                        })}
                    </div>
                    <div className="x-axis">
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span>Oct</span>
                        <span>Nov</span>
                        <span>Dec</span>
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                    </div>
                </div>
            </section>

            <div className="rankings-tabs">
                <button>Top Today</button>
                <button>Top Week</button>
                <button>Top Month</button>
                <button className="active">Trending</button>
            </div>

            <div className="rankings-list">
                {models.map((model) => (
                    <div key={model.rank} className="ranking-item">
                        <div className="rank-number">{model.rank}.</div>
                        <div className="model-details">
                            <h3>{model.name}</h3>
                            <p>{model.desc}</p>
                        </div>
                        <div className="model-stats">
                            <span className="views">{model.views} views</span>
                            <span className={`trend-badge ${model.trendUp ? 'up' : 'down'}`}>
                                {model.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rankings;
