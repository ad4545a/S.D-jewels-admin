import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const location = useLocation();

    if (!userInfo || !userInfo.isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default RequireAuth;
