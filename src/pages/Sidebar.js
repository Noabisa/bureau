import React, { useState } from 'react';
import { Settings, Info, Menu } from 'react-feather';  // Importing icons
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the menu visibility
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* Hamburger Icon */}
        <Menu size={24} onClick={toggleMenu} className="hamburger-icon" />
      </div>

      <nav className={`sidebar-nav ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link to="/consumer/settings">
              <Settings size={18} /> Settings
            </Link>
          </li>
          <li>
            <Link to="/consumer/about">
              <Info size={18} /> About
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
