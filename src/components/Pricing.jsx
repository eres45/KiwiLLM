import React, { useState } from 'react';
import { Check, Info, Zap, Star, Crown, ArrowRight, Globe } from 'lucide-react';

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [basicRpm, setBasicRpm] = useState(10);
    const [proRpm, setProRpm] = useState(10);

    const handleRpmChange = (plan, delta) => {
        if (plan === 'basic') {
            const newRpm = basicRpm + delta;
            if (newRpm >= 10 && newRpm <= 50) setBasicRpm(newRpm);
        } else {
            const newRpm = proRpm + delta;
            if (newRpm >= 10 && newRpm <= 50) setProRpm(newRpm);
        }
    };

    const calculatePrice = (basePrice, rpm) => {
        const additionalCost = ((rpm - 10) / 5) * 150;
        let total = basePrice + additionalCost;
        if (billingCycle === 'yearly') {
            total = total * 12 * 0.7; // 30% discount for yearly
            // For yearly display, usually we show the monthly equivalent or the total. 
            // The existing UI showed 1328 (approx 15 USD). 2214 (approx 25 USD).
            // Let's assume the user just wants the monthly rate updated. 
            // If "yearly" is selected, usually the monthly price shown is the discounted one.
            return Math.floor(total / 12);
        }
        return total;
    };

    const basicPrice = calculatePrice(699, basicRpm);
    const proPrice = calculatePrice(1299, proRpm);

    return (
        <div className="page-container">
            <header className="page-header center">
                <h1>Simple, transparent pricing</h1>
                <p>Get access to all premium AI models with a single subscription. No hidden fees, no complicated pricing tiers.</p>
            </header>

            <div className="pricing-controls">
                <div className="billing-toggle">
                    <button
                        className={billingCycle === 'monthly' ? 'active' : ''}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={billingCycle === 'yearly' ? 'active' : ''}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Yearly <span className="save-badge">Save 30%</span>
                    </button>
                </div>
                <div className="currency-selector">
                    <Globe size={14} /> INR (₹)
                </div>
            </div>

            <div className="pricing-grid">
                {/* Free Plan */}
                <div className="pricing-card">
                    <div className="card-icon"><Zap size={24} /></div>
                    <h2>Free</h2>
                    <div className="price">
                        <span className="amount">₹0</span>
                        <span className="period">forever</span>
                    </div>
                    <p className="description">Get started with core features and explore the platform.</p>

                    <ul className="features-list">
                        <li><Check size={16} className="check" /> Limited AI Models</li>
                        <li><Check size={16} className="check" /> 5 RPM Rate Limits</li>
                        <li><Check size={16} className="check" /> 300 RPD Request Limit <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Unlimited Validity <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Limited Context (Approx. 50%) <Info size={14} className="info" /></li>
                        <li className="disabled"><Check size={16} className="check" /> Coding Tool Compatibility <Info size={14} className="info" /></li>
                        <li className="disabled"><Check size={16} className="check" /> Access to premium models</li>
                    </ul>

                    <button className="btn-outline-full">Get Started</button>
                </div>

                {/* Basic Plan */}
                <div className="pricing-card featured">
                    <div className="card-icon"><Star size={24} /></div>
                    <h2>Basic</h2>
                    <div className="price">
                        <span className="amount">₹{basicPrice.toLocaleString()}</span>
                        <span className="period-detail">/ month {billingCycle === 'yearly' && '(billed yearly)'}</span>
                    </div>
                    <p className="description">Perfect for developers and individuals seeking reliable AI access with good quality models.</p>

                    <ul className="features-list">
                        <li><Check size={16} className="check" /> Access to Good Quality Models <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Rate Limit (RPM) <Info size={14} className="info" /></li>

                        <div className="feature-control">
                            <button onClick={() => handleRpmChange('basic', -5)} disabled={basicRpm <= 10}>-</button>
                            <span>{basicRpm} RPM</span>
                            <button onClick={() => handleRpmChange('basic', 5)} disabled={basicRpm >= 50}>+</button>
                        </div>
                        <div className="feature-note">+ ₹150 per 5 RPM <Info size={14} className="info" /></div>

                        <li><Check size={16} className="check" /> Unlimited Requests <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> 90% Uptime Guarantee <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Standard support</li>
                        <li><Check size={16} className="check" /> Original Context* <Info size={14} className="info" /></li>
                    </ul>

                    <button className="btn-primary-full">Choose Basic</button>
                </div>

                {/* Pro Plan */}
                <div className="pricing-card">
                    <div className="card-icon"><Crown size={24} /></div>
                    <h2>Pro</h2>
                    <div className="price">
                        <span className="amount">₹{proPrice.toLocaleString()}</span>
                        <span className="period-detail">/ month {billingCycle === 'yearly' && '(billed yearly)'}</span>
                    </div>
                    <p className="description">For professionals and power users needing access to advanced AI capabilities.</p>

                    <ul className="features-list">
                        <li><Check size={16} className="check" /> Access to Anthropic & Grok Models <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Almost All Open-Source & SOTA Models <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Image, TTS, STT & Special Models <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Rate Limit (RPM) <Info size={14} className="info" /></li>

                        <div className="feature-control">
                            <button onClick={() => handleRpmChange('pro', -5)} disabled={proRpm <= 10}>-</button>
                            <span>{proRpm} RPM</span>
                            <button onClick={() => handleRpmChange('pro', 5)} disabled={proRpm >= 50}>+</button>
                        </div>
                        <div className="feature-note">+ ₹150 per 5 RPM <Info size={14} className="info" /></div>

                        <li><Check size={16} className="check" /> Unlimited Requests <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Original Context* <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> 90% Uptime Guarantee <Info size={14} className="info" /></li>
                        <li><Check size={16} className="check" /> Standard Support <Info size={14} className="info" /></li>
                    </ul>

                    <button className="btn-primary-full">Choose Pro</button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
