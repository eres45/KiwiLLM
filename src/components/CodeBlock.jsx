import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';

const MODELS = [
    "claude-3-5-sonnet-20240620",
    "gpt-4o-2024-08-06",
    "gemini-1.5-pro-002",
    "llama-3.1-405b-instruct",
    "mistral-large-2407",
    "gpt-4-turbo-2024-04-09",
    "claude-3-opus-20240229",
    "gemma-2-27b-it",
    "qwen-2.5-72b-instruct",
    "deepseek-coder-v2"
];

const CodeBlock = () => {
    const [activeTab, setActiveTab] = useState('Python');
    const [displayedModel, setDisplayedModel] = useState('');
    const [modelIndex, setModelIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(50);

    useEffect(() => {
        const handleTyping = () => {
            const currentModel = MODELS[modelIndex];

            if (isDeleting) {
                setDisplayedModel(prev => prev.substring(0, prev.length - 1));
                setTypingSpeed(30); // Faster deletion
            } else {
                setDisplayedModel(prev => currentModel.substring(0, prev.length + 1));
                setTypingSpeed(50 + Math.random() * 50); // Random typing variation
            }

            if (!isDeleting && displayedModel === currentModel) {
                // Finished typing, wait before deleting
                setTimeout(() => setIsDeleting(true), 1000);
            } else if (isDeleting && displayedModel === '') {
                // Finished deleting, move to next model
                setIsDeleting(false);
                setModelIndex((prev) => (prev + 1) % MODELS.length);
            }
        };

        const timer = setTimeout(handleTyping, isDeleting && displayedModel === MODELS[modelIndex] ? 1000 : typingSpeed);

        return () => clearTimeout(timer);
    }, [displayedModel, isDeleting, modelIndex, typingSpeed]);

    return (
        <div className="code-block">
            <div className="code-header">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'Python' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Python')}
                    >
                        Python
                    </button>
                    <button
                        className={`tab ${activeTab === 'Node.js' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Node.js')}
                    >
                        Node.js
                    </button>
                    <button
                        className={`tab ${activeTab === 'cURL' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cURL')}
                    >
                        cURL
                    </button>
                </div>
                <button className="copy-btn">
                    <Copy size={16} />
                </button>
            </div>
            <div className="code-content">
                <pre>
                    <code>
                        <span className="keyword">from</span> openai <span className="keyword">import</span> OpenAI{'\n\n'}
                        client = <span className="function">OpenAI</span>({'(\n'}
                        {'    '}base_url=<span className="string">"https://ai.megallm.io/v1"</span>,{'\n'}
                        {'    '}api_key=<span className="string">"your-api-key"</span>{'\n'}
                        ){'\n\n'}
                        response = client.chat.completions.<span className="function">create</span>({'(\n'}
                        {'    '}model=<span className="string">"{displayedModel}<span className="cursor">|</span>"</span>,{'\n'}
                        {'    '}messages=[{'{'}<span className="string">"role"</span>: <span className="string">"user"</span>, <span className="string">"content"</span>: <span className="string">"Analyze this data..."</span>{'}'}]{'\n'}
                        )
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default CodeBlock;
