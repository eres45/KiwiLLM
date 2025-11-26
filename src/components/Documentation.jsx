import React, { useState } from 'react';
import { Book, Zap, HelpCircle, Shield, Network, Wrench, Eye, MessageSquare, Globe, Code, Activity, Lock, Settings, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import CodeBlock from './ui/CodeBlock';

const Documentation = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const [copiedCode, setCopiedCode] = useState('');

    const copyToClipboard = async (code, id) => {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = code;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                }
                document.body.removeChild(textArea);
            }
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(''), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Still show feedback
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(''), 2000);
        }
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
                                <h4>gpt-5</h4>
                                <p>Next-gen foundation model</p>
                                <span className="model-tag">Future</span>
                            </div>
                            <div className="model-card-docs">
                                <h4>o3</h4>
                                <p>Advanced reasoning model</p>
                                <span className="model-tag">Reasoning</span>
                            </div>
                            <div className="model-card-docs">
                                <h4>deepseek-v3</h4>
                                <p>Latest DeepSeek model</p>
                                <span className="model-tag">Recommended</span>
                            </div>
                            <div className="model-card-docs">
                                <h4>qwen3-coder-plus</h4>
                                <p>Flagship Qwen 3 coding model</p>
                                <span className="model-tag">SOTA</span>
                            </div>
                            <div className="model-card-docs">
                                <h4>dark-code-76</h4>
                                <p>Powerful 12B coding model</p>
                                <span className="model-tag">Coding</span>
                            </div>
                        </div>

                        <h2>Automatic Failover</h2>
                        <p>If a provider is temporarily unavailable, requests will fail with an appropriate error message. You can retry with a different model or wait for the service to recover.</p>

                        <div className="alert-box-docs info">
                            <AlertCircle size={18} />
                            <div>
                                <strong>Model Availability</strong>
                                <p>Provider availability is monitored in real-time. Check the Models page for current status.</p>
                            </div>
                        </div>
                    </div>
                );

            case 'tools':
                return (
                    <div className="doc-content">
                        <h1>Tool Calling</h1>
                        <p className="lead">Function calling and tool use capabilities.</p>

                        <h2>Current Status</h2>
                        <div className="alert-box-docs info">
                            <AlertCircle size={18} />
                            <div>
                                <strong>Coming Soon</strong>
                                <p>Tool calling (function calling) is not currently supported for custom models. This feature is planned for a future release.</p>
                            </div>
                        </div>

                        <h2>What is Tool Calling?</h2>
                        <p>Tool calling allows AI models to generate structured outputs that can be used to call external functions or APIs. This is useful for:</p>
                        <ul>
                            <li>Database queries</li>
                            <li>API integrations</li>
                            <li>Mathematical computations</li>
                            <li>Real-time data retrieval</li>
                        </ul>

                        <h2>Workaround</h2>
                        <p>While native tool calling isn't supported, you can achieve similar results by:</p>
                        <ol>
                            <li>Instructing the model to return JSON in a specific format</li>
                            <li>Parsing the model's response</li>
                            <li>Executing your own function calls based on the parsed data</li>
                        </ol>
                    </div>
                );

            case 'parameters':
                return (
                    <div className="doc-content">
                        <h1>Request Parameters</h1>
                        <p className="lead">Complete reference of all available parameters for chat completions.</p>

                        <h2>Supported Parameters</h2>
                        <table className="docs-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Type</th>
                                    <th>Default</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>model</code></td>
                                    <td>string</td>
                                    <td>-</td>
                                    <td>Required. Model ID to use (e.g., "deepseek-v3")</td>
                                </tr>
                                <tr>
                                    <td><code>messages</code></td>
                                    <td>array</td>
                                    <td>-</td>
                                    <td>Required. Array of message objects with 'role' and 'content'</td>
                                </tr>
                                <tr>
                                    <td><code>temperature</code></td>
                                    <td>number</td>
                                    <td>0.7</td>
                                    <td>Sampling temperature (0-2). Higher = more random</td>
                                </tr>
                                <tr>
                                    <td><code>max_tokens</code></td>
                                    <td>integer</td>
                                    <td>-</td>
                                    <td>Maximum tokens to generate in the response</td>
                                </tr>
                                <tr>
                                    <td><code>top_p</code></td>
                                    <td>number</td>
                                    <td>1.0</td>
                                    <td>Nucleus sampling parameter (0-1)</td>
                                </tr>
                                <tr>
                                    <td><code>n</code></td>
                                    <td>integer</td>
                                    <td>1</td>
                                    <td>Number of completions to generate</td>
                                </tr>
                                <tr>
                                    <td><code>stop</code></td>
                                    <td>string/array</td>
                                    <td>null</td>
                                    <td>Stop sequences where the model will stop generating</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="alert-box-docs info">
                            <AlertCircle size={18} />
                            <div>
                                <strong>Note on Parameter Support</strong>
                                <p>Some advanced parameters may not be supported by all custom models. The API will accept them but they may be ignored by certain providers.</p>
                            </div>
                        </div>

                        <h2>Message Format</h2>
                        <p>Messages must follow this structure:</p>
                        <CodeBlock
                            code={`{
  "role": "user" | "assistant" | "system",
  "content": "Your message text here"
}`}
                            language="json"
                        />
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
