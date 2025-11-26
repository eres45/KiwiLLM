import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ code, language = 'javascript' }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
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
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Still show feedback even if it failed
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="code-block-container">
            <div className="code-block-header">
                <span className="code-language">{language}</span>
                <button onClick={copyToClipboard} className="code-copy-btn">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="code-block-pre">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;
