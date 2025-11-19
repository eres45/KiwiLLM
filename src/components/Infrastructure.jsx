import React from 'react';
import { Folder, ArrowUpRight, Plus, Server, Shield, Globe } from 'lucide-react';

const Infrastructure = () => {
    return (
        <section className="infrastructure">
            <div className="infra-label">
                <Folder size={16} />
                <span>Under the hood</span>
            </div>

            <div className="infra-container">
                <div className="infra-content">
                    <h2>Enterprise-Grade<br />Infrastructure<br />for AI at Scale</h2>
                    <p className="infra-description">
                        MegaLLM handles billions of tokens daily with sub-100ms overhead. Our globally distributed infrastructure ensures your AI applications run fast, secure, and reliable.
                    </p>

                    <div className="infra-features">
                        <div className="infra-feature">
                            <h3>High-Performance Gateway</h3>
                            <p>Sub-100ms latency overhead with 99.99% uptime SLA. Handles 100K+ concurrent connections with automatic scaling.</p>
                        </div>

                        <div className="infra-feature">
                            <h3>
                                Enterprise Security & Privacy
                                <ArrowUpRight size={14} className="arrow-icon" />
                            </h3>
                            <p>Industry-standard encryption for data in transit and at rest. Privacy-focused architecture with data isolation and secure processing.</p>
                        </div>

                        <div className="infra-feature">
                            <h3>Global Edge Network</h3>
                            <p>15 regions worldwide with automatic routing to nearest endpoint. CDN-cached responses for common queries reduce latency by 80%.</p>
                        </div>
                    </div>
                </div>

                <div className="infra-visual">
                    <div className="server-rack">
                        <div className="rack-header">
                            <div className="rack-status">
                                <Plus size={12} />
                                <span>5,000</span>
                            </div>
                            <div className="rack-label">
                                MEGALLM<br />AI ENGINE
                            </div>
                        </div>

                        <div className="rack-body">
                            <div className="rack-unit u1"></div>
                            <div className="rack-unit u2"></div>
                            <div className="rack-unit u3"></div>
                            <div className="rack-unit u4"></div>
                            <div className="rack-unit u5"></div>
                            <div className="rack-unit u6"></div>
                        </div>

                        <div className="rack-footer">
                            <div className="api-status">
                                <span>API</span>
                                <div className="dots">
                                    <span></span><span></span><span></span><span></span>
                                    <span></span><span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Infrastructure;
