// src/components/HomePage.js
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './HomePage.css';
import { FaRegMoneyBillAlt, FaCreditCard, FaChartLine } from 'react-icons/fa';
import { Fade, Slide } from 'react-awesome-reveal';

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      
      <div className="content">
        <Slide direction="up" triggerOnce>
          <div className="hero-section">
            <h1>Welcome to Credit Bureau Management System</h1>
            <p className="hero-text">
              Manage and track your loans efficiently with our secure platform. 
              Get instant access to loan management, payment processing, 
              and comprehensive credit reporting.
            </p>
          </div>
        </Slide>

        <div className="features">
          <Fade direction="left" triggerOnce cascade damping={0.2}>
            <div className="feature-card">
              <div className="feature-icon">
                <FaRegMoneyBillAlt />
              </div>
              <h2>Loan Management</h2>
              <div className="feature-content">
                <p>Apply for personal or available loans with flexible terms.</p>
                <div className="loan-types">
                  <h3>Loan Options</h3>
                  <ul>
                    <li>✓ Personal Loans: Flexible terms</li>
                    <li>✓ Instant Approval Loans</li>
                    <li>✓ Real-time Status Tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </Fade>

          <Fade direction="up" triggerOnce cascade damping={0.2}>
            <div className="feature-card">
              <div className="feature-icon">
                <FaCreditCard />
              </div>
              <h2>Secure Payments</h2>
              <div className="feature-content">
                <p>Multiple secure payment options available.</p>
                <div className="payment-methods">
                  <h3>Payment Options</h3>
                  <div className="method-grid">
                    <div className="method-item">💳 Credit Card</div>
                    <div className="method-item">🏦 Bank Transfer</div>
                    <div className="method-item">🔒 PayPal</div>
                  </div>
                </div>
              </div>
            </div>
          </Fade>

          <Fade direction="right" triggerOnce cascade damping={0.2}>
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h2>Credit Analytics</h2>
              <div className="feature-content">
                <p>Comprehensive credit reporting and analysis.</p>
                <div className="report-details">
                  <h3>Report Features</h3>
                  <ul>
                    <li>📊 Full Loan History</li>
                    <li>📈 Payment Performance</li>
                    <li>💯 Credit Score Tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;