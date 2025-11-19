import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';

const ProtectedRoute = ({ children, onNavigate }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Login onNavigate={onNavigate} />;
    }

    return children;
};

export default ProtectedRoute;
