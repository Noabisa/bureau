// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');

  // If token exists, allow access, else redirect to /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
