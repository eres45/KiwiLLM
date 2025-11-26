import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FloatingIcons from './components/FloatingIcons';
import Features from './components/Features';
import Infrastructure from './components/Infrastructure';
import CTA from './components/CTA';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Rankings from './components/Rankings';
import Documentation from './components/Documentation';
import Pricing from './components/Pricing';
import ApiKeys from './components/ApiKeys';
import Playground from './components/Playground';
import Models from './components/Models';
import Testimonials from './components/Testimonials';

import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Initialize from URL hash or default to landing
  const getInitialPage = () => {
    const hash = window.location.hash.slice(1); // Remove #
    return hash || 'landing';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage());

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = page; // Update URL
    window.scrollTo(0, 0);
  };

  // Listen for hash changes (back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'landing';
      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Disable body scroll on non-homepage pages (except dashboard and api-keys which need scrolling)
  useEffect(() => {
    if (currentPage !== 'landing' && currentPage !== 'dashboard' && currentPage !== 'api-keys' && currentPage !== 'models' && currentPage !== 'docs' && currentPage !== 'pricing' && currentPage !== 'rankings') {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ProtectedRoute onNavigate={navigateTo}>
            <Dashboard onNavigate={navigateTo} />
          </ProtectedRoute>
        );
      case 'api-keys':
        return (
          <ProtectedRoute onNavigate={navigateTo}>
            <ApiKeys />
          </ProtectedRoute>
        );
      case 'login':
        return <Login onNavigate={navigateTo} />;
      case 'signup':
        return <Signup onNavigate={navigateTo} />;
      case 'rankings':
        return <Rankings />;
      case 'docs':
        return <Documentation />;
      case 'pricing':
        return <Pricing />;
      case 'playground':
        return <Playground />;
      case 'models':
        return <Models />;
      default:
        return (
          <>
            <Hero onNavigate={navigateTo} />
            <FloatingIcons />
            <Features />
            <Infrastructure />
            <Testimonials />
            <CTA />
            <FAQ />
            <Footer onNavigate={navigateTo} />
          </>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="app">
        <Navbar onNavigate={navigateTo} />
        <main>
          {renderPage()}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
