import React from 'react';
import {
    Bot, Code, Database, Cpu, Globe, Shield, Zap,
    Terminal, Layers, Box, Workflow, Sparkles,
    MessageSquare, Brain, Rocket, Lock
} from 'lucide-react';

const FloatingIcons = () => {
    const icons = [
        { Icon: Bot, delay: 0 },
        { Icon: Code, delay: 0.2 },
        { Icon: Database, delay: 0.4 },
        { Icon: Cpu, delay: 0.6 },
        { Icon: Globe, delay: 0.8 },
        { Icon: Shield, delay: 1.0 },
        { Icon: Zap, delay: 1.2 },
        { Icon: Terminal, delay: 1.4 },
        { Icon: Layers, delay: 1.6 },
        { Icon: Box, delay: 1.8 },
        { Icon: Workflow, delay: 2.0 },
        { Icon: Sparkles, delay: 2.2 },
        { Icon: MessageSquare, delay: 2.4 },
        { Icon: Brain, delay: 2.6 },
        { Icon: Rocket, delay: 2.8 },
        { Icon: Lock, delay: 3.0 },
    ];

    return (
        <section className="floating-icons-section">
            <div className="floating-text">
                <p>
                    MegaLLM is the unified interface for the AI era,<br />
                    evolving how developers integrate intelligence into their applications.
                </p>
            </div>

            <div className="icons-wave-container">
                {icons.map(({ Icon, delay }, index) => (
                    <div
                        key={index}
                        className="floating-icon-wrapper"
                        style={{ animationDelay: `-${delay}s` }}
                    >
                        <div className="floating-icon">
                            <Icon size={20} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FloatingIcons;
