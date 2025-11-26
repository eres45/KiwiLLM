import React from 'react';
import { Layers, Bot } from 'lucide-react';
import CodeBlock from './CodeBlock';

const Hero = ({ onNavigate }) => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Access 70+ LLMs<br />with One API Key</h1>
                <p className="hero-subtitle">
                    Ship AI features faster with KiwiLLM’s unified gateway. Access Claude, GPT-5, Gemini, Llama, and 70+ models through a single API. Built-in analytics, smart fallbacks, and usage tracking included.
                </p>

                <div className="hero-actions">
                    <button className="btn-hero-primary" onClick={() => onNavigate('dashboard')}>
                        <Layers size={18} fill="black" />
                        Start Free Trial
                    </button>
                    <button className="btn-hero-secondary" onClick={() => onNavigate('rankings')}>
                        <Bot size={18} />
                        View Models
                    </button>
                </div>

                <div className="hero-brands">
                    <span className="brand-label">Use it with</span>
                    <span className="brand">OpenAI</span>
                    <span className="brand">xAI</span>
                    <span className="brand">Anthropic</span>
                    <span className="brand-label">and many more</span>
                </div>
            </div>
            <div className="hero-visual">
                <CodeBlock />
            </div>
        </section>
    );
};

export default Hero;
