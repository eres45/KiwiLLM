import React from 'react';
import { Play, FileText, Twitter, Linkedin, Github, Disc } from 'lucide-react';

const CTA = () => {
    return (
        <section className="cta-section">
            <div className="grid-tunnel">
                <div className="grid-lines"></div>
                <div className="grid-fade"></div>
            </div>

            <div className="cta-content">
                <h2>Start Building with<br />70+ AI Models Today</h2>
                <p>Join thousands of developers using MegaLLM<br />to ship AI features faster and cheaper.</p>

                <div className="cta-actions">
                    <button className="btn btn-light">
                        <Play size={16} fill="black" />
                        Start Free Trial
                    </button>
                    <button className="btn btn-dark-outline">
                        View Documentation
                    </button>
                </div>

                <div className="social-links">
                    <span>Follow us:</span>
                    <a href="#"><Twitter size={18} /></a>
                    <a href="#"><Linkedin size={18} /></a>
                    <a href="#"><Github size={18} /></a>
                    <a href="#"><Disc size={18} /></a>
                </div>
            </div>
        </section>
    );
};

export default CTA;
