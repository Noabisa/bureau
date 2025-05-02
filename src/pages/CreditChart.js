// src/pages/CreditChart.js
import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';

const CreditChart = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      const res = await axios.get('/api/consumer/loans');
      const sortedLoans = res.data.loans.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setLoans(
        sortedLoans.map((l) => ({
          name: new Date(l.createdAt).toLocaleDateString(),
          amount: l.amount,
        }))
      );
    };
    fetchLoans();
  }, []);

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Credit Score / Loan Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={loans}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name">
            <Label value="Date" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label
              value="Loan Amount"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CreditChart;
