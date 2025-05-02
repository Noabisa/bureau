import React, { useState } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';

const RequestLoan = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLoanRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/consumer/loans', { amount: loanAmount });
      setMessage('Loan request submitted successfully!');
      setLoanAmount('');
      setTimeout(() => navigate('/consumer/dashboard'), 2000);  // Redirect after 2 seconds
    } catch (err) {
      setMessage('Error submitting loan request.');
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Request a Loan</h1>
      
      {message && <div className="mb-4 text-center text-xl text-red-500">{message}</div>}

      <form onSubmit={handleLoanRequest} className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Loan Amount</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            required
            min="100"
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Request Loan
        </button>
      </form>
    </div>
  );
};

export default RequestLoan;
