// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('jwt'); // Verifique se o token JWT está presente

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
