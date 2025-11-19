import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Hexagon, AlertCircle } from 'lucide-react';

const Login = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleSignIn } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            onNavigate('dashboard');
        } catch (err) {
            setError('Failed to sign in: ' + err.message);
        }
        setLoading(false);
    }

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            onNavigate('dashboard');
        } catch (err) {
            setError('Failed to sign in with Google: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Hexagon size={40} className="logo-icon" />
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue to MegaLLM</p>
                </div>

                {error && <div className="alert-box warning-dark"><AlertCircle size={16} /> {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
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
                    <button disabled={loading} type="submit" className="btn-primary-full">
                        Sign In
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button disabled={loading} onClick={handleGoogleSignIn} className="btn-google-full">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                    Sign in with Google
                </button>

                <div className="auth-footer">
                    Need an account? <span onClick={() => onNavigate('signup')} className="link-text">Sign Up</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
