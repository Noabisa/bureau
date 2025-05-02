// src/pages/CreditChart.js
import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CreditChart = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      const res = await axios.get('/api/consumer/loans');
      const sortedLoans = res.data.loans.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setLoans(sortedLoans.map(l => ({
        name: new Date(l.createdAt).toLocaleDateString(),
        amount: l.amount,
      })));
    };
    fetchLoans();
  }, []);

  return (
    <div>
      <h2>Credit Score/Loan Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={loans}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CreditChart;
