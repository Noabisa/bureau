// src/services/api.js
import axios from 'axios';

// Create an axios instance
const instance = axios.create({
  baseURL: 'http://localhost:5000', // or wherever your backend runs
});

// Add Authorization header automatically
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
