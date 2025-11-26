import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, Key, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const dropdownRef = useRef(null);

    const handleNavigate = (page) => {
        onNavigate(page);
        setIsOpen(false);
        setIsProfileOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleNavigate('landing');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo" onClick={() => handleNavigate('landing')}>
                    <img src="/logo.png" alt="KiwiLLM" className="logo-image" />
                    <span className="logo-text">KiwiLLM</span>
                </div>

                {/* Desktop Menu */}
                <div className="nav-links desktop-only">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('rankings'); }}>Rankings</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('playground'); }}>Playground</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('models'); }}>Models</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('docs'); }}>Documentation</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('pricing'); }}>Pricing</a>
                </div>

                <div className="nav-auth desktop-only">
                    {currentUser ? (
                        <div className="profile-menu-container" ref={dropdownRef}>
                            <button
                                className="profile-btn"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <div className="avatar-circle-small">
                                    <img src="/avatar.png" alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                </div>
                                <ChevronDown size={14} className={`chevron ${isProfileOpen ? 'rotate' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <span className="user-email">{currentUser.email}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={() => handleNavigate('dashboard')}>
                                        <LayoutDashboard size={16} /> Dashboard
                                    </button>
                                    <button className="dropdown-item" onClick={() => handleNavigate('api-keys')}>
                                        <Key size={16} /> API Keys
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item danger" onClick={handleLogout}>
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button className="btn-nav-login" onClick={() => handleNavigate('login')}>Log In</button>
                            <button className="btn-nav-signup" onClick={() => handleNavigate('signup')}>Sign Up</button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mobile-menu">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('rankings'); }}>Rankings</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('playground'); }}>Playground</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('models'); }}>Models</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('docs'); }}>Documentation</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('pricing'); }}>Pricing</a>
                    <div className="mobile-auth">
                        {currentUser ? (
                            <>
                                <button className="btn-text" onClick={() => handleNavigate('dashboard')}>Dashboard</button>
                                <button className="btn-primary" onClick={handleLogout}>Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-nav-login" onClick={() => handleNavigate('login')}>Log In</button>
                                <button className="btn-nav-signup" onClick={() => handleNavigate('signup')}>Sign Up</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
