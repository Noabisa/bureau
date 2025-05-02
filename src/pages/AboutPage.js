import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <h1>About Credit Bureau Management System</h1>
      <p>
        Welcome to the Credit Bureau Management System! This platform is designed to help consumers manage their loans,
        track their credit scores, and generate credit reports. Our system ensures that you can apply for loans, make secure
        payments, and keep track of your financial health with ease.
      </p>
      <h2>Features:</h2>
      <ul>
        <li>Apply for various types of loans</li>
        <li>Track your credit score and view trends</li>
        <li>Make payments towards your loans with multiple payment methods</li>
        <li>Generate detailed credit reports based on your loan history</li>
        <li>Manage pending and overdue loans effectively</li>
      </ul>
      <h3>Our Goal:</h3>
      <p>
        Our goal is to provide consumers with an easy-to-use platform to track their financial health, make informed
        decisions, and manage their credit effectively. We aim to give you full control of your financial data and ensure
        that you can access it anytime.
      </p>
    </div>
  );
};

export default AboutPage;
