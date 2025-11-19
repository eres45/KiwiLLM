import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Hexagon, AlertCircle } from 'lucide-react';

const Signup = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, name);
            onNavigate('dashboard');
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Hexagon size={40} className="logo-icon" />
                    <h2>Create Account</h2>
                    <p>Get started with MegaLLM today</p>
                </div>

                {error && <div className="alert-box warning-dark"><AlertCircle size={16} /> {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                        />
                    </div>
                    <button disabled={loading} type="submit" className="btn-primary-full">
                        Sign Up
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <span onClick={() => onNavigate('login')} className="link-text">Log In</span>
                </div>
            </div>
        </div>
    );
};

export default Signup;
