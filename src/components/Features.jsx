import React from 'react';
import { Network, GitBranch, BarChart3, ArrowRight, Plus } from 'lucide-react';

const Features = () => {
    return (
        <section className="features">
            <div className="features-header">
                <h2>Built for<br />developers<br />who ship</h2>
                <div className="features-intro">
                    <p>
                        MegaLLM is shaped by the practices and principles that distinguish world-class development teams from the rest: relentless focus, fast execution, and a commitment to the quality of craft.
                    </p>
                    <a href="#" className="explore-link">
                        Explore the platform <ArrowRight size={16} />
                    </a>
                </div>
            </div>

            <div className="features-grid">
                {/* Card 1 */}
                <div className="feature-card">
                    <div className="card-visual">
                        <div className="tree-visual">
                            <div className="node root"><div className="logo-mini">M</div></div>
                            <div className="branch-lines"></div>
                            <div className="node leaf l1">A</div>
                            <div className="node leaf l2">G</div>
                            <div className="node leaf l3">C</div>
                        </div>
                    </div>
                    <div className="card-content">
                        <h3>One API, Every Major LLM</h3>
                        <button className="card-btn"><Plus size={14} /></button>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="feature-card">
                    <div className="card-visual">
                        <div className="flow-visual">
                            <div className="flow-box center">
                                <Network size={32} />
                                <span>Smart Fallbacks &<br />Load Balancing</span>
                            </div>
                            <div className="flow-node n1"></div>
                            <div className="flow-node n2"></div>
                            <div className="flow-node n3"></div>
                        </div>
                    </div>
                    <div className="card-content">
                        <h3>Smart Fallbacks<br />& Load Balancing</h3>
                        <button className="card-btn"><Plus size={14} /></button>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="feature-card">
                    <div className="card-visual">
                        <div className="dashboard-visual">
                            <div className="dash-card back"></div>
                            <div className="dash-card mid"></div>
                            <div className="dash-card front">
                                <BarChart3 size={40} />
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <h3>Real-Time Analytics<br />& Cost Management</h3>
                        <button className="card-btn"><Plus size={14} /></button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
