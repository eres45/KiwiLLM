import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ number, question, answer, isOpen, toggle }) => {
    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={toggle}>
            <div className="faq-question">
                <span className="faq-number">({number})</span>
                <h3>{question}</h3>
                <span className="faq-icon">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </div>
            <div className="faq-answer">
                <p>{answer}</p>
                {isOpen && number === '001' && (
                    <div className="faq-tags">
                        <span>Pricing</span>
                        <span>Billing</span>
                        <span>Tokens</span>
                        <span>Volume Discounts</span>
                        <span>Pay-as-you-go</span>
                        <span>Cost Optimization</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            id: '001',
            question: "How does KiwiLLM pricing work?",
            answer: "Pay only for what you use with transparent per-token pricing. We add a small markup (typically 10-20%) on top of provider costs to cover infrastructure and features. No monthly fees, no minimums. Volume discounts available for enterprise usage with over 10M tokens per month."
        },
        {
            id: '002',
            question: "How quickly can I migrate from OpenAI?",
            answer: "Migration is seamless. Just change your base URL and API key. Our API is 100% compatible with the OpenAI SDK, so you don't need to rewrite your code."
        },
        {
            id: '003',
            question: "Which models and providers do you support?",
            answer: "We support over 70 models from top providers including OpenAI (GPT-4, GPT-3.5), Anthropic (Claude 3), Google (Gemini), Mistral, Meta (Llama 3), and many open-source models hosted on high-performance GPUs."
        },
        {
            id: '004',
            question: "How do fallbacks and retries work?",
            answer: "You can configure fallback chains in your dashboard. If a primary provider fails or experiences high latency, we automatically route the request to the next provider in your chain, ensuring high availability for your application."
        }
    ];

    return (
        <section className="faq-section">
            <h2 className="faq-title">FAQ</h2>
            <div className="faq-list">
                {faqs.map((faq, index) => (
                    <FAQItem
                        key={faq.id}
                        number={faq.id}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === index}
                        toggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                    />
                ))}
            </div>
        </section>
    );
};

export default FAQ;
