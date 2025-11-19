import React from 'react';
import {
    Book, Zap, Shield, Code, Terminal,
    Layout, Search, MessageSquare, Image,
    Mic, Video, List
} from 'lucide-react';

const Documentation = () => {
    return (
        <div className="docs-container">
            <aside className="docs-sidebar">
                <div className="sidebar-group">
                    <h3><Book size={16} /> OVERVIEW</h3>
                    <a href="#" className="active">Introduction</a>
                    <a href="#">Quickstart</a>
                    <a href="#">FAQ</a>
                    <a href="#">Principles</a>
                    <a href="#">Models</a>
                </div>

                <div className="sidebar-group">
                    <h3><Zap size={16} /> FEATURES</h3>
                    <a href="#">Privacy & Logging</a>
                    <a href="#">Provider Routing</a>
                    <a href="#">Tool Calling</a>
                    <a href="#">Vision & PDFs</a>
                    <a href="#">Message Transforms</a>
                    <a href="#">Web Search</a>
                </div>

                <div className="sidebar-group">
                    <h3><Code size={16} /> API REFERENCE</h3>
                    <a href="#">Overview</a>
                    <a href="#">Streaming</a>
                    <a href="#">Limits</a>
                    <a href="#">Authentication</a>
                    <a href="#">Parameters</a>
                    <a href="#">Errors</a>
                    <a href="#"><span className="method-badge post">POST</span> Chat completion</a>
                    <a href="#"><span className="method-badge post">POST</span> Responses</a>
                    <a href="#"><span className="method-badge post">POST</span> Image generation</a>
                    <a href="#"><span className="method-badge post">POST</span> Image Edits</a>
                    <a href="#"><span className="method-badge post">POST</span> Embeddings</a>
                    <a href="#"><span className="method-badge post">POST</span> Audio Speech</a>
                    <a href="#"><span className="method-badge post">POST</span> Audio Transcriptions</a>
                    <a href="#"><span className="method-badge post">POST</span> Video Generation</a>
                    <a href="#"><span className="method-badge get">GET</span> List available models</a>
                </div>
            </aside>

            <main className="docs-content">
                <div className="breadcrumb">Overview</div>
                <h1>A4F Documentation</h1>
                <p className="lead">
                    Welcome to the official A4F documentation. Learn how to integrate and utilize our unified AI gateway.
                </p>

                <section id="introduction">
                    <h2>Introduction</h2>
                    <p>
                        A4F provides a single, standardized API endpoint to access hundreds of Large Language Models (LLMs) from various providers like OpenAI, Anthropic, Google, Mistral, and more. Simplify your AI integrations, benefit from automatic failover, optimize costs, and ensure higher availability.
                    </p>
                    <p>
                        Our platform acts as a proxy, forwarding your requests to the appropriate provider while offering additional features like model routing, caching, and usage tracking. Get started quickly using familiar SDKs or direct API calls.
                    </p>

                    <div className="alert-box warning">
                        <strong>Important:</strong> Ensure you have generated an API key from your A4F dashboard before proceeding with integration.
                    </div>
                </section>

                <section id="installation">
                    <h2>Installation</h2>
                    <p>
                        While A4F works with many existing AI/LLM client libraries (like OpenAI's Python/JS SDKs), you might need to install specific SDKs depending on your chosen integration method. For direct API calls, no installation is typically required beyond standard HTTP clients.
                    </p>

                    <h3>Using pip (Python OpenAI SDK)</h3>
                    <p>Install the OpenAI SDK for Python:</p>
                    <div className="code-snippet">
                        <div className="snippet-header">
                            <span>Bash</span>
                            <button>Copy</button>
                        </div>
                        <pre><code>pip install openai</code></pre>
                    </div>

                    <h3>Using npm (JavaScript OpenAI SDK)</h3>
                    <p>Install the OpenAI SDK for Node.js:</p>
                    <div className="code-snippet">
                        <div className="snippet-header">
                            <span>Bash</span>
                            <button>Copy</button>
                        </div>
                        <pre><code>npm install openai</code></pre>
                    </div>
                </section>
            </main>

            <aside className="docs-toc">
                <h3>On this page</h3>
                <div className="toc-links">
                    <a href="#introduction" className="active">Introduction</a>
                    <a href="#installation">Installation</a>
                    <a href="#configuration">Configuration</a>
                    <a href="#basic-usage">Basic Usage</a>
                    <a href="#advanced">Advanced Features</a>
                    <a href="#next-steps">Next Steps</a>
                </div>
            </aside>
        </div>
    );
};

export default Documentation;
