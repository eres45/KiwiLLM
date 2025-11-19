import React, { useEffect, useState } from 'react';
import {
    RefreshCw, Clock, CreditCard, Activity,
    MessageSquare, Image, CheckCircle, Key,
    ExternalLink, Coffee, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = ({ onNavigate }) => {
    const { currentUser, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchUserData() {
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (isMounted && docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            } else {
                if (isMounted) setLoading(false);
            }
        }
        fetchUserData();
        return () => { isMounted = false; };
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            onNavigate('landing');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome, {userData?.name || currentUser?.email}!</p>
                </div>
                <button className="btn-refresh" onClick={() => window.location.reload()}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-main">
                    {/* Account Overview */}
                    <section className="dashboard-card">
                        <div className="card-header">
                            <Clock size={16} className="icon-blue" />
                            <h3>Account Overview</h3>
                        </div>
                        <div className="overview-grid">
                            <div className="overview-item">
                                <label>Service</label>
                                <div className="value">A4F API Services</div>
                            </div>
                            <div className="overview-item">
                                <label>Key Status</label>
                                <div className="status-badge active"><CheckCircle size={12} /> Active</div>
                            </div>
                            <div className="overview-item">
                                <label>Current Plan</label>
                                <div className="plan-badge">Free</div>
                            </div>
                            <div className="overview-item">
                                <label>Plan Validity</label>
                                <div className="value">Unlimited</div>
                            </div>
                        </div>
                    </section>

                    {/* Usage Statistics */}
                    <section className="dashboard-card">
                        <div className="card-header">
                            <Activity size={16} className="icon-blue" />
                            <h3>Usage Statistics</h3>
                        </div>
                        <p className="card-subtitle">Your recent API activity</p>

                        <div className="stats-grid">
                            <div className="stat-item">
                                <label><Activity size={12} /> Total Requests</label>
                                <div className="stat-value">14</div>
                            </div>
                            <div className="stat-item">
                                <label><MessageSquare size={12} /> Chat (Non-Stream)</label>
                                <div className="stat-value">0</div>
                            </div>
                            <div className="stat-item">
                                <label><MessageSquare size={12} /> Chat (Stream)</label>
                                <div className="stat-value">14</div>
                            </div>
                            <div className="stat-item">
                                <label><Image size={12} /> Images Generated</label>
                                <div className="stat-value">0</div>
                            </div>
                            <div className="stat-item">
                                <label><Activity size={12} /> Total Tokens</label>
                                <div className="stat-value">745</div>
                            </div>
                            <div className="stat-item">
                                <label><CheckCircle size={12} /> Success Rate</label>
                                <div className="stat-value">50.0%</div>
                            </div>
                        </div>

                        <div className="token-stats">
                            <div className="token-item">
                                <label>Input Tokens</label>
                                <div className="token-value">581</div>
                            </div>
                            <div className="token-item">
                                <label>Output Tokens</label>
                                <div className="token-value">164</div>
                            </div>
                        </div>

                        <div className="usage-bars">
                            <div className="usage-bar-container">
                                <div className="bar-label">
                                    <span>Requests Per Minute (RPM)</span>
                                    <span>0 / 5</span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div className="usage-bar-container">
                                <div className="bar-label">
                                    <span>Requests Per Day (RPD)</span>
                                    <span>0 / 300</span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Model Usage */}
                    <section className="dashboard-card">
                        <div className="card-header">
                            <Activity size={16} className="icon-blue" />
                            <h3>Model Usage</h3>
                        </div>
                        <p className="card-subtitle">Your most frequently used models (by last used date)</p>

                        <div className="model-list">
                            <div className="model-item">
                                <div className="model-info">
                                    <span className="model-name">provider-3/deepseek-v3</span>
                                    <span className="model-meta">1/1 reqs <span className="cost">$0.000012</span></span>
                                </div>
                                <div className="model-bar-bg">
                                    <div className="model-bar-fill" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div className="model-item">
                                <div className="model-info">
                                    <span className="model-name">provider-4/claude-3.7-sonnet</span>
                                    <span className="model-meta">3/3 reqs <span className="cost">$0.001563</span></span>
                                </div>
                                <div className="model-bar-bg">
                                    <div className="model-bar-fill" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div className="model-item">
                                <div className="model-info">
                                    <span className="model-name">provider-1/gpt-4.1-2025-04-14</span>
                                    <span className="model-meta">0/1 reqs <span className="cost">$0</span></span>
                                </div>
                                <div className="model-bar-bg">
                                    <div className="model-bar-fill" style={{ width: '0%' }}></div>
                                </div>
                            </div>

                            <div className="model-item">
                                <div className="model-info">
                                    <span className="model-name">provider-2/llama-4-maverick</span>
                                    <span className="model-meta">1/1 reqs <span className="cost">$0.000071</span></span>
                                </div>
                                <div className="model-bar-bg">
                                    <div className="model-bar-fill" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div className="model-item">
                                <div className="model-info">
                                    <span className="model-name">provider-4/gpt-4.1-mini</span>
                                    <span className="model-meta">1/1 reqs <span className="cost">$0.000062</span></span>
                                </div>
                                <div className="model-bar-bg">
                                    <div className="model-bar-fill" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="show-more">
                            Show 1 More
                        </div>
                    </section>
                </div>

                <div className="dashboard-sidebar">
                    {/* Profile Card */}
                    <section className="dashboard-card profile-card">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                <User size={32} />
                            </div>
                        </div>
                        <div className="profile-info">
                            <h3>{userData?.name || 'User'}</h3>
                            <p>{currentUser?.email}</p>
                        </div>

                        <div className="profile-details">
                            <div className="detail-row">
                                <span><User size={12} /> Member Since:</span>
                                <span>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span><CreditCard size={12} /> Total Payments:</span>
                                <span>$0.00</span>
                            </div>
                            <div className="detail-row">
                                <span><Clock size={12} /> Current Plan:</span>
                                <span>{userData?.plan || 'Free'}</span>
                            </div>
                        </div>

                        <button className="btn-outline-full" onClick={() => onNavigate('api-keys')}>
                            <Key size={14} /> Manage API Keys
                        </button>
                        <button className="btn-outline-full" onClick={handleLogout} style={{ marginTop: '0.5rem', borderColor: '#ef4444', color: '#ef4444' }}>
                            Log Out
                        </button>
                    </section>

                    {/* API Key Details */}
                    <section className="dashboard-card">
                        <div className="card-header">
                            <Key size={16} className="icon-blue" />
                            <h3>API Key Details</h3>
                        </div>
                        <p className="card-subtitle">Information about your active API key</p>

                        <div className="key-details">
                            <div className="key-row">
                                <label>Name</label>
                                <div className="value">ai</div>
                            </div>
                            <div className="key-row">
                                <label>Key Preview</label>
                                <div className="key-badge">ddc-••••6837</div>
                            </div>
                            <div className="key-row">
                                <label>Created</label>
                                <div className="value">6 months ago</div>
                            </div>
                            <div className="key-row">
                                <label>Last Used</label>
                                <div className="value">4 months ago</div>
                            </div>
                            <div className="key-row">
                                <label>Status</label>
                                <div className="status-badge active"><CheckCircle size={12} /> Active</div>
                            </div>
                        </div>

                        <button className="btn-outline-full" onClick={() => onNavigate('api-keys')}>
                            Manage API Key
                        </button>
                    </section>

                    {/* Usage Cost */}
                    <section className="dashboard-card">
                        <div className="card-header">
                            <CreditCard size={16} className="icon-blue" />
                            <h3>Usage Cost</h3>
                        </div>
                        <p className="card-subtitle">Current estimated costs</p>

                        <div className="cost-display">
                            <label>Estimated Cost (USD)</label>
                            <div className="cost-value">$0.001742</div>
                        </div>

                        <div className="plan-info-box">
                            free Plan - Unlimited
                        </div>

                        <a href="#" className="link-blue" onClick={(e) => { e.preventDefault(); onNavigate('pricing'); }}>
                            View Pricing / Manage Plan <ExternalLink size={12} />
                        </a>

                        <button className="btn-yellow-full">
                            <Coffee size={16} /> Buy me a coffee
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
