import React, { useState, useEffect } from 'react';
import { Key, AlertTriangle, Info, Copy, Eye, RefreshCw, CheckCircle, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ApiKeys = () => {
    const { currentUser } = useAuth();
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, [currentUser]);

    async function fetchKeys() {
        if (!currentUser) return;
        setLoading(true);
        try {
            const q = query(collection(db, "api_keys"), where("userId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            const fetchedKeys = [];
            querySnapshot.forEach((doc) => {
                fetchedKeys.push({ id: doc.id, ...doc.data() });
            });
            setKeys(fetchedKeys);
        } catch (error) {
            console.error("Error fetching keys:", error);
        }
        setLoading(false);
    }

    const generateKey = () => {
        const prefix = "kiwi-";
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 40; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return prefix + result;
    };

    const handleCreateKey = async () => {
        if (keys.length >= 1) {
            alert("Limit reached: You can only create 1 API key on the free plan.");
            return;
        }
        setCreating(true);
        try {
            const newKey = generateKey();
            await addDoc(collection(db, "api_keys"), {
                userId: currentUser.uid,
                name: "Default Key",
                key: newKey,
                plan: "Free",
                createdAt: new Date().toISOString(),
                status: "Active"
            });
            fetchKeys();
        } catch (error) {
            console.error("Error creating key:", error);
        }
        setCreating(false);
    };

    const handleDeleteKey = async (id) => {
        if (window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "api_keys", id));
                fetchKeys();
            } catch (error) {
                console.error("Error deleting key:", error);
            }
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div className="header-content">
                    <h1><Key className="header-icon" /> API Keys</h1>
                    <p>Manage API keys to access A4F services programmatically.</p>
                </div>
            </header>

            <div className="alert-box warning-dark">
                <AlertTriangle size={18} className="alert-icon" />
                <p>
                    <strong>Important Notice:</strong> Currently, we only support the creation of one API key per account.
                </p>
            </div>

            <div className="table-actions">
                <button className="btn-dark-outline small" onClick={fetchKeys}>
                    <RefreshCw size={14} /> Refresh
                </button>
                <button className="btn-primary-full small" onClick={handleCreateKey} disabled={creating || keys.length >= 1} style={{ width: 'auto', marginLeft: '1rem' }}>
                    <Plus size={14} /> Create New Key
                </button>
            </div>

            <div className="keys-table-container">
                <table className="keys-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>API Key</th>
                            <th>Plan</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading keys...</td></tr>
                        ) : keys.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No API keys found. Create one to get started.</td></tr>
                        ) : (
                            keys.map(key => (
                                <tr key={key.id}>
                                    <td className="key-name">{key.name}</td>
                                    <td>
                                        <div className="key-display">
                                            <span className="key-value">{key.key.substring(0, 12) + "••••••••"}</span>
                                            <button className="icon-btn" onClick={() => navigator.clipboard.writeText(key.key)} title="Copy Key"><Copy size={14} /></button>
                                        </div>
                                    </td>
                                    <td><span className="badge-dark">{key.plan}</span></td>
                                    <td className="text-dim">{new Date(key.createdAt).toLocaleDateString()}</td>
                                    <td><span className="status-badge active"><CheckCircle size={12} /> {key.status}</span></td>
                                    <td>
                                        <button className="icon-btn" onClick={() => handleDeleteKey(key.id)} style={{ color: '#ef4444' }} title="Delete Key">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="alert-box info-blue">
                <Info size={18} className="alert-icon" />
                <div>
                    <strong>Securing Your API Keys</strong>
                    <p>Treat your API keys like passwords. Store them securely and never share them publicly. We will only show you the full secret key once upon creation.</p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeys;
