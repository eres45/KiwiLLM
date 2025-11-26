import React, { useState } from 'react';
import { Book, Zap, HelpCircle, Shield, Network, Wrench, Eye, MessageSquare, Globe, Code, Activity, Lock, Settings, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import CodeBlock from './CodeBlock';

const Documentation = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const [copiedCode, setCopiedCode] = useState('');

    const copyToClipboard = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const sections = {
        overview: [
            { id: 'introduction', label: 'Introduction', icon: Book },
            { id: 'quickstart', label: 'Quickstart', icon: Zap },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
        ],
        features: [
            { id: 'privacy', label: 'Privacy & Logging', icon: Shield },
            { id: 'routing', label: 'Provider Routing', icon: Network },
            { id: 'tools', label: 'Tool Calling', icon: Wrench },
        ],
        api: [
            { id: 'auth', label: 'Authentication', icon: Lock },
            { id: 'models', label: 'List Models', icon: Activity },
            { id: 'chat', label: 'Chat Completion', icon: MessageSquare },
            { id: 'parameters', label: 'Parameters', icon: Settings },
            { id: 'errors', label: 'Errors', icon: AlertCircle },
        ]
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'introduction':
                return (
                    <div className="doc-content">
                        <h1>Introduction to KiwiLLM API</h1>
                        <p className="lead">KiwiLLM provides a unified API gateway to access multiple LLM providers through a single, OpenAI-compatible interface.</p>

                        <div className="feature-grid-docs">
                            <div className="feature-card-docs">
                                <Zap className="feature-icon-docs" />
                                <h3>Fast & Reliable</h3>
                                <p>Low-latency responses with automatic failover and load balancing</p>
                            </div>
                            <div className="feature-card-docs">
                                <Shield className="feature-icon-docs" />
                                <h3>Secure</h3>
                                <p>API key authentication with rate limiting and usage tracking</p>
                            </div>
                            <div className="feature-card-docs">
                                <Code className="feature-icon-docs" />
                                <h3>OpenAI Compatible</h3>
                                <p>Drop-in replacement for OpenAI API - no code changes needed</p>
                            </div>
                        </div>

                        <h2>Available Models</h2>
                        <div className="models-list-docs">
                            <div className="model-badge">DeepSeek V3</div>
                            <div className="model-badge">DeepSeek R1</div>
                            <div className="model-badge">Grok-4</div>
                            <div className="model-badge">Qwen 2.5 72B</div>
                            <div className="model-badge">Qwen Coder Plus</div>
                            <div className="model-badge">GPT-OSS 120B</div>
                        </div>

                        <h2>Base URL</h2>
                        <div className="code-block-docs">
                            <code>https://kiwillm.onrender.com</code>
                            <button
                                className="copy-btn-docs"
                                onClick={() => copyToClipboard('https://kiwillm.onrender.com', 'base-url')}
                            >
                                {copiedCode === 'base-url' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                );

            case 'quickstart':
                const pythonQuickstart = `from openai import OpenAI

client = OpenAI(
    api_key="kiwi-your-api-key-here",
    base_url="https://kiwillm.onrender.com/v1"
)

response = client.chat.completions.create(
    model="deepseek-v3",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`;

                const jsQuickstart = `const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: 'kiwi-your-api-key-here',
    baseURL: 'https://kiwillm.onrender.com/v1'
});

const response = await client.chat.completions.create({
    model: 'grok-4',
    messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);`;

                const curlQuickstart = `curl https://kiwillm.onrender.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer kiwi-your-api-key-here" \\
  -d '{
    "model": "qwen2.5-72b-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

                return (
                    <div className="doc-content">
                        <h1>Quickstart Guide</h1>
                        <p className="lead">Get started with KiwiLLM in minutes. Follow these steps to make your first API call.</p>

                        <div className="steps-container">
                            <div className="step-item">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h3>Get Your API Key</h3>
                                    <p>Sign up and generate your API key from the dashboard</p>
                                </div>
                            </div>
                            <div className="step-item">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h3>Install SDK</h3>
                                    <p>Install the OpenAI SDK for your language</p>
                                    <div className="code-inline">pip install openai</div>
                                </div>
                            </div>
                            <div className="step-item">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h3>Make Your First Request</h3>
                                    <p>Use the code examples below</p>
                                </div>
                            </div>
                        </div>

                        <h2>Python Example</h2>
                        <CodeBlock code={pythonQuickstart} language="python" />

                        <h2>JavaScript Example</h2>
                        <CodeBlock code={jsQuickstart} language="javascript" />

                        <h2>cURL Example</h2>
                        <CodeBlock code={curlQuickstart} language="bash" />
                    </div>
                );

            case 'auth':
                const authExample = `# Add your API key to the Authorization header
Authorization: Bearer kiwi-your-api-key-here`;

                return (
                    <div className="doc-content">
                        <h1>Authentication</h1>
                        <p className="lead">Secure your API requests with API key authentication.</p>

                        <h2>API Key Format</h2>
                        <p>All KiwiLLM API keys start with the prefix <code className="inline-code">kiwi-</code></p>

                        <h2>How to Authenticate</h2>
                        <p>Include your API key in the <code className="inline-code">Authorization</code> header of every request:</p>
                        <CodeBlock code={authExample} language="bash" />

                        <div className="alert-box-docs info">
                            <AlertCircle size={18} />
                            <div>
                                <strong>Keep your API key secure!</strong>
                                <p>Never share your API key or commit it to version control. Use environment variables instead.</p>
                            </div>
                        </div>

                        <h2>Rate Limits</h2>
                        <table className="docs-table">
                            <thead>
                                <tr>
                                    <th>Plan</th>
                                    <th>Requests per Minute</th>
                                    <th>Daily Limit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Free</td>
                                    <td>5 RPM</td>
                                    <td>100 requests</td>
                                </tr>
                                <tr>
                                    <td>Pro</td>
                                    <td>100 RPM</td>
                                    <td>Unlimited</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            case 'models':
                const modelsExample = `curl https://kiwillm.onrender.com/v1/models \\
  -H "Authorization: Bearer kiwi-your-api-key-here"`;

                const modelsResponse = `{
  "object": "list",
  "data": [
    {
      "id": "deepseek-v3",
      "object": "model",
      "created": 1732060800,
      "owned_by": "deepseek"
    },
    {
      "id": "grok-4",
      "object": "model",
      "created": 1732060800,
      "owned_by": "xai"
    }
    // ... more models
  ]
}`;

                return (
                    <div className="doc-content">
                        <h1>List Available Models</h1>
                        <p className="lead">Retrieve a list of all available LLM models.</p>

                        <h2>Endpoint</h2>
                        <div className="endpoint-box">
                            <span className="method-badge get">GET</span>
                            <code>/v1/models</code>
                        </div>

                        <h2>Request Example</h2>
                        <CodeBlock code={modelsExample} language="bash" />

                        <h2>Response</h2>
                        <CodeBlock code={modelsResponse} language="json" />

                        <h2>Available Models</h2>
                        <div className="models-grid-docs">
                            <div className="model-card-docs">
                                <h4>deepseek-v3</h4>
                                <p>Latest DeepSeek model with enhanced reasoning</p>
                                <span className="model-tag">Recommended</span>
                            </div>
                            <div className="model-card-docs">
                                <h4>deepseek-r1</h4>
                                <p>DeepSeek R1 with improved performance</p>
                            </div>
                            <div className="model-card-docs">
                                <h4>grok-4</h4>
                                <p>xAI's Grok-4 model</p>
                                <span className="model-tag">Fast</span>
                            </div>
                            <div className="model-card-docs">
                                <h4>qwen2.5-72b-chat</h4>
                                <p>Qwen 2.5 72B parameter model</p>
                            </div>
                            <div className="model-card-docs">
                                <h4>qwen-coder-plus</h4>
                                <p>Specialized for code generation</p>
                                <span className="model-tag">Code</span>
                            </div>
                            <div className="model-card-docs">
                                <h4>gpt-oss-120b</h4>
                                <p>Open-source GPT alternative</p>
                            </div>
                        </div>
                    </div>
                );

            case 'chat':
                const chatExample = `curl https://kiwillm.onrender.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer kiwi-your-api-key-here" \\
  -d '{
    "model": "deepseek-v3",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'`;

                const chatResponse = `{
  "id": "chatcmpl-1732060800",
  "object": "chat.completion",
  "created": 1732060800,
  "model": "deepseek-v3",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing is a revolutionary..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 150,
    "total_tokens": 170
  }
}`;

                return (
                    <div className="doc-content">
                        <h1>Chat Completions</h1>
                        <p className="lead">Generate AI responses using chat-based models.</p>

                        <h2>Endpoint</h2>
                        <div className="endpoint-box">
                            <span className="method-badge post">POST</span>
                            <code>/v1/chat/completions</code>
                        </div>

                        <h2>Request Body</h2>
                        <table className="docs-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Type</th>
                                    <th>Required</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>model</code></td>
                                    <td>string</td>
                                    <td><CheckCircle size={16} className="check-icon" /></td>
                                    <td>Model ID to use</td>
                                </tr>
                                <tr>
                                    <td><code>messages</code></td>
                                    <td>array</td>
                                    <td><CheckCircle size={16} className="check-icon" /></td>
                                    <td>Array of message objects</td>
                                </tr>
                                <tr>
                                    <td><code>temperature</code></td>
                                    <td>number</td>
                                    <td>-</td>
                                    <td>Sampling temperature (0-2)</td>
                                </tr>
                                <tr>
                                    <td><code>max_tokens</code></td>
                                    <td>integer</td>
                                    <td>-</td>
                                    <td>Maximum tokens to generate</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2>Request Example</h2>
                        <CodeBlock code={chatExample} language="bash" />

                        <h2>Response</h2>
                        <CodeBlock code={chatResponse} language="json" />

                        <div className="alert-box-docs success">
                            <CheckCircle size={18} />
                            <div>
                                <strong>OpenAI Compatible</strong>
                                <p>This endpoint is fully compatible with the OpenAI Chat Completions API. You can use any OpenAI SDK!</p>
                            </div>
                        </div>
                    </div>
                );

            case 'errors':
                const errorExample = `{
  "error": {
    "message": "Invalid API Key",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}`;

                return (
                    <div className="doc-content">
                        <h1>Error Handling</h1>
                        <p className="lead">Understand and handle API errors effectively.</p>

                        <h2>Error Response Format</h2>
                        <CodeBlock code={errorExample} language="json" />

                        <h2>HTTP Status Codes</h2>
                        <table className="docs-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>200</code></td>
                                    <td>OK</td>
                                    <td>Request successful</td>
                                </tr>
                                <tr>
                                    <td><code>401</code></td>
                                    <td>Unauthorized</td>
                                    <td>Invalid or missing API key</td>
                                </tr>
                                <tr>
                                    <td><code>403</code></td>
                                    <td>Forbidden</td>
                                    <td>API key is inactive or revoked</td>
                                </tr>
                                <tr>
                                    <td><code>429</code></td>
                                    <td>Too Many Requests</td>
                                    <td>Rate limit exceeded</td>
                                </tr>
                                <tr>
                                    <td><code>500</code></td>
                                    <td>Internal Server Error</td>
                                    <td>Server error - try again later</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2>Common Error Codes</h2>
                        <div className="error-codes-grid">
                            <div className="error-code-card">
                                <code>invalid_api_key</code>
                                <p>The API key provided is invalid or has been revoked</p>
                            </div>
                            <div className="error-code-card">
                                <code>rate_limit_exceeded</code>
                                <p>You have exceeded your rate limit. Wait before making more requests</p>
                            </div>
                            <div className="error-code-card">
                                <code>invalid_request_error</code>
                                <p>The request was malformed or missing required parameters</p>
                            </div>
                            <div className="error-code-card">
                                <code>model_not_found</code>
                                <p>The specified model does not exist</p>
                            </div>
                        </div>
                    </div>
                );

            case 'faq':
                return (
                    <div className="doc-content">
                        <h1>Frequently Asked Questions</h1>

                        <div className="faq-item">
                            <h3>Is KiwiLLM compatible with OpenAI SDKs?</h3>
                            <p>Yes! KiwiLLM is fully compatible with OpenAI's API format. Simply change the base URL and API key, and you're good to go.</p>
                        </div>

                        <div className="faq-item">
                            <h3>What are the rate limits?</h3>
                            <p>Free tier: 5 requests per minute. Pro tier: 100 requests per minute. Rate limits are enforced per API key.</p>
                        </div>

                        <div className="faq-item">
                            <h3>How do I upgrade to Pro?</h3>
                            <p>Visit your dashboard and click on "Upgrade to Pro" to access higher rate limits and priority support.</p>
                        </div>

                        <div className="faq-item">
                            <h3>Can I use streaming responses?</h3>
                            <p>Currently, streaming is not supported for custom models. Standard responses are returned immediately.</p>
                        </div>

                        <div className="faq-item">
                            <h3>How is usage tracked?</h3>
                            <p>Every API request is logged with timestamp, model used, and token count. View your usage in the dashboard.</p>
                        </div>

                        <div className="faq-item">
                            <h3>What happens if I exceed my rate limit?</h3>
                            <p>You'll receive a 429 error. Wait for the rate limit window to reset (1 minute) before making more requests.</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="doc-content">
                        <h1>Documentation</h1>
                        <p>Select a topic from the sidebar to get started.</p>
                    </div>
                );
        }
    };

    return (
        <div className="documentation-page">
            <div className="docs-sidebar">
                <div className="docs-sidebar-header">
                    <h2>Documentation</h2>
                </div>

                <div className="docs-nav">
                    <div className="docs-nav-section">
                        <h3>OVERVIEW</h3>
                        {sections.overview.map(item => (
                            <button
                                key={item.id}
                                className={`docs-nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="docs-nav-section">
                        <h3>FEATURES</h3>
                        {sections.features.map(item => (
                            <button
                                key={item.id}
                                className={`docs-nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="docs-nav-section">
                        <h3>API REFERENCE</h3>
                        {sections.api.map(item => (
                            <button
                                key={item.id}
                                className={`docs-nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="docs-main">
                {renderContent()}
            </div>
        </div>
    );
};

export default Documentation;
