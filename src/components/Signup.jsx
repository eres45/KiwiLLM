import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Hexagon, AlertCircle, Mail, Lock, User, Loader } from 'lucide-react';

const Signup = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, googleSignIn } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
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
            <div className="auth-card-modern">
                <div className="auth-header-modern">
                    <div className="logo-wrapper">
                        <Hexagon size={48} className="logo-icon-gradient" />
                    </div>
                    <h1>Create Account</h1>
                    <p>Start building with KiwiLLM today</p>
                </div>

                {error && (
                    <div className="alert-error-modern">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form-modern">
                    <div className="input-group-modern">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="input-group-modern">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="input-group-modern">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="input-group-modern">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                required
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                placeholder="Re-enter your password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-gradient-modern"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="spinner" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="divider-modern">
                    <span>or continue with</span>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="btn-google-modern"
                    disabled={loading}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" />
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                    </svg>
                    Sign up with Google
                </button>

                <div className="auth-footer-modern">
                    <p>
                        Already have an account?
                        <button
                            onClick={() => onNavigate('login')}
                            className="link-button"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
