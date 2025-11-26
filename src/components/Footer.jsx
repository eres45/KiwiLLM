import React from 'react';

const Footer = ({ onNavigate }) => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-cta">
                    <h3>Experience Intelligence</h3>
                </div>
                <div className="footer-links">
                    <div className="link-column">
                        <h4>Product</h4>
                        <a href="#">Download</a>
                        <a onClick={() => onNavigate('pricing')} style={{ cursor: 'pointer' }}>Pricing</a>
                        <a onClick={() => onNavigate('docs')} style={{ cursor: 'pointer' }}>Docs</a>
                        <a href="#">Changelog</a>
                    </div>
                    <div className="link-column">
                        <h4>Resources</h4>
                        <a href="#">Blog</a>
                        <a href="#">Community</a>
                        <a href="#">Use Cases</a>
                    </div>
                </div>
            </div>

            <div className="footer-main">
                <h1 className="mega-text">KiwiLLM</h1>
            </div>

            <div className="footer-bottom">
                <div className="footer-logo">KiwiLLM</div>
                <div className="footer-legal">
                    <a href="#">About</a>
                    <a href="#">Products</a>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
