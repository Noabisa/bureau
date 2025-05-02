import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && storedUserType) {
      setIsLoggedIn(true);
      setUserType(storedUserType);
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
    
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      const newUserType = localStorage.getItem('userType');
      setIsLoggedIn(!!newToken);
      setUserType(newUserType);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setUserType(null);
    navigate('/');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo-link">
          <h1>Credit Bureau System</h1>
        </Link>
      </div>

      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <div className="dashboard-links">
              {userType === 'consumer' && (
                <Link to="/consumer/dashboard" className="nav-link">
                  <i className="fas fa-user" aria-hidden="true"></i> 
                  <span className="nav-text">Consumer Dashboard</span>
                </Link>
              )}
              {userType === 'lender' && (
                <Link to="/lender/dashboard" className="nav-link">
                  <i className="fas fa-university" aria-hidden="true"></i> 
                  <span className="nav-text">Lender Dashboard</span>
                </Link>
              )}
            </div>
            <button onClick={handleLogout} className="btn btn-outline logout-btn">
              <i className="fas fa-sign-out-alt" aria-hidden="true"></i> 
              <span className="nav-text">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn login-btn">
              <i className="fas fa-sign-in-alt" aria-hidden="true"></i> 
              <span className="nav-text">Login</span>
            </Link>
            <Link to="/register" className="btn btn-outline register-btn">
              <i className="fas fa-user-plus" aria-hidden="true"></i> 
              <span className="nav-text">Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;