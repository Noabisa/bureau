import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p>Faculty of Information & Communication Technology</p>
          <p>Limkokwing University of Creative Technology</p>
          <p>Email: <a href="mailto:assginluct@gmail.com">assginluct@gmail.com</a>, <a href="mailto:mpho.takalimane@limkokwing.ac.ls">mpho.takalimane@limkokwing.ac.ls</a></p>
          <p>Course: Database Systems (BIDB2210)</p>
          <p>By Mphapang's group 2025</p>
        </div>

        <div className="footer-social">
          <h4>Connect with Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedin /></a>
            <a href="mailto:assginluct@gmail.com"><FaEnvelope /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Credit Bureau Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
