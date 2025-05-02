// src/pages/Register.js
import React, { useState } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'consumer' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration failed!');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="consumer">Consumer</option>
          <option value="lender">Lender</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <p><span style={{ color: 'black' }}>Already have an account?</span> <a href="/login">Login</a></p>
    </div>
  );
};

export default RegisterForm;
