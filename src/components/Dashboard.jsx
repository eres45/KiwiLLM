import React, { useEffect, useState } from 'react';
import {
    RefreshCw, Clock, CreditCard, Activity,
    MessageSquare, Image, CheckCircle, Key,
    ExternalLink, Coffee, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = ({ onNavigate }) => {
    const { currentUser, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe = null;

        async function fetchData() {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Set up real-time listener for user stats
                const userRef = doc(db, "users", currentUser.uid);
                unsubscribe = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        setUserData({});
                    }
                });

                // Fetch API keys
                const keysQuery = query(collection(db, "api_keys"), where("userId", "==", currentUser.uid));
                const keysSnapshot = await getDocs(keysQuery);
                setApiKeys(keysSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        }

        fetchData();
        return () => {
            if (unsubscribe) unsubscribe();
        };
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

    // Extract stats with defaults
    const stats = userData?.stats || {};
    const totalRequests = stats.totalRequests || 0;
    const successfulRequests = stats.successfulRequests || 0;
    const failedRequests = stats.failedRequests || 0;
    const totalTokens = stats.totalTokens || 0;
    const inputTokens = stats.inputTokens || 0;
    const outputTokens = stats.outputTokens || 0;
    const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(1) : 0;

    // Extract model usage
    const modelUsage = stats.modelUsage || {};
    const sortedModels = Object.entries(modelUsage)
        .sort((a, b) => (b[1].requests || 0) - (a[1].requests || 0))
        .slice(0, 5);

    // Get first API key
    const primaryKey = apiKeys[0];

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
                                <div className="value">KiwiLLM API Services</div>
                            </div>
                            <div className="overview-item">
                                <label>Key Status</label>
                                <div className="status-badge active">
                                    <CheckCircle size={12} /> {apiKeys.length > 0 ? 'Active' : 'No Keys'}
                                </div>
                            </div>
                            <div className="overview-item">
                                <label>Current Plan</label>
                                <div className="plan-badge">{userData?.plan || 'Free'}</div>
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
                                <div className="stat-value">{totalRequests}</div>
                            </div>
                            <div className="stat-item">
                                <label><CheckCircle size={12} /> Successful</label>
                                <div className="stat-value">{successfulRequests}</div>
                            </div>
                            <div className="stat-item">
                                <label><MessageSquare size={12} /> Failed</label>
                                <div className="stat-value">{failedRequests}</div>
                            </div>
                            <div className="stat-item">
                                <label><Image size={12} /> Success Rate</label>
                                <div className="stat-value">{successRate}%</div>
                            </div>
                            <div className="stat-item">
                                <label><Activity size={12} /> Total Tokens</label>
                                <div className="stat-value">{totalTokens.toLocaleString()}</div>
                            </div>
                            <div className="stat-item">
                                <label><CheckCircle size={12} /> Avg Tokens/Req</label>
                                <div className="stat-value">{totalRequests > 0 ? Math.floor(totalTokens / totalRequests) : 0}</div>
                            </div>
                        </div>

                        <div className="token-stats">
                            <div className="token-item">
                                <label>Input Tokens</label>
                                <div className="token-value">{inputTokens.toLocaleString()}</div>
                            </div>
                            <div className="token-item">
                                <label>Output Tokens</label>
                                <div className="token-value">{outputTokens.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="usage-bars">
                            <div className="usage-bar-container">
                                <div className="bar-label">
                                    <span>API Usage Status</span>
                                    <span>{totalRequests} total requests</span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ width: '100%' }}></div>
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
                        <p className="card-subtitle">Your most frequently used models</p>

                        <div className="model-list">
                            {sortedModels.length > 0 ? (
                                sortedModels.map(([modelName, data]) => {
                                    const maxRequests = sortedModels[0][1].requests || 1;
                                    const percentage = ((data.requests || 0) / maxRequests) * 100;

                                    return (
                                        <div className="model-item" key={modelName}>
                                            <div className="model-info">
                                                <span className="model-name">{modelName}</span>
                                                <span className="model-meta">
                                                    {data.requests || 0} reqs • {(data.tokens || 0).toLocaleString()} tokens
                                                </span>
                                            </div>
                                            <div className="model-bar-bg">
                                                <div className="model-bar-fill" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                    No model usage yet. Start using the API to see stats here.
                                </p>
                            )}
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
                                <span><Activity size={12} /> Total Requests:</span>
                                <span>{totalRequests}</span>
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

                        {primaryKey ? (
                            <>
                                <div className="key-details">
                                    <div className="key-row">
                                        <label>Name</label>
                                        <div className="value">{primaryKey.name || 'Unnamed'}</div>
                                    </div>
                                    <div className="key-row">
                                        <label>Key Preview</label>
                                        <div className="key-badge">{primaryKey.key?.substring(0, 8)}••••{primaryKey.key?.slice(-4)}</div>
                                    </div>
                                    <div className="key-row">
                                        <label>Created</label>
                                        <div className="value">{primaryKey.createdAt ? new Date(primaryKey.createdAt).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                    <div className="key-row">
                                        <label>Status</label>
                                        <div className={`status-badge ${primaryKey.status === 'Active' ? 'active' : ''}`}>
                                            <CheckCircle size={12} /> {primaryKey.status || 'Active'}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn-outline-full" onClick={() => onNavigate('api-keys')}>
                                    Manage API Key
                                </button>
                            </>
                        ) : (
                            <>
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                    No API keys yet. Create one to get started.
                                </p>
                                <button className="btn-outline-full" onClick={() => onNavigate('api-keys')}>
                                    Create API Key
                                </button>
                            </>
                        )}
                    </section>

                    {/* Usage Cost */}
                    <section className="dashboard-card">
                        <div className="card-header">
                            <CreditCard size={16} className="icon-blue" />
                            <h3>Usage Overview</h3>
                        </div>
                        <p className="card-subtitle">Current usage metrics</p>

                        <div className="cost-display">
                            <label>Total Tokens Used</label>
                            <div className="cost-value">{totalTokens.toLocaleString()}</div>
                        </div>

                        <div className="plan-info-box">
                            {userData?.plan || 'Free'} Plan - Unlimited Requests
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
