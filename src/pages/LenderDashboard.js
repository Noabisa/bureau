import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  PlusCircle
} from 'react-feather';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './lender-dashboard.css';

const COLORS = ['#00C49F', '#FF8042']; // Paid, Due

const LenderDashboard = () => {
  const [loanRequests, setLoanRequests] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState(0);
  const [rejectedLoans, setRejectedLoans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateLoanForm, setShowCreateLoanForm] = useState(false);
  const [newLoan, setNewLoan] = useState({
    amount: '',
    interestRate: '',
    durationMonths: ''
  });

  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    totalInterest: 0,
    totalPaid: 0,
    remaining: 0
  });

  useEffect(() => {
    fetchLoanRequests();
    fetchPaymentStats();
  }, []);

  const fetchLoanRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/lender/loans');
      setLoanRequests(res.data.loans);
      setApprovedLoans(res.data.approvedLoans);
      setRejectedLoans(res.data.rejectedLoans);
    } catch (err) {
      console.error(err);
      alert('Error fetching loan data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const res = await axios.get('/api/lender/payment-summary');
      setPaymentStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approveLoan = async (loanId) => {
    try {
      await axios.patch(`/api/lender/loans/${loanId}`, { status: 'approved' });
      fetchLoanRequests();
      fetchPaymentStats();
    } catch (err) {
      console.error(err);
      alert('Failed to approve loan');
    }
  };

  const rejectLoan = async (loanId) => {
    try {
      await axios.patch(`/api/lender/loans/${loanId}`, { status: 'rejected' });
      fetchLoanRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to reject loan');
    }
  };

  const createLoanOffer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: Number(newLoan.amount),
        interestRate: Number(newLoan.interestRate),
        durationMonths: Number(newLoan.durationMonths)
      };
      await axios.post('/api/lender/available-loans', payload);
      alert('✅ Loan offer created successfully!');
      setNewLoan({ amount: '', interestRate: '', durationMonths: '' });
      setShowCreateLoanForm(false);
      fetchLoanRequests();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(`❌ Failed to create loan offer: ${err.response?.data?.message || err.message}`);
    }
  };

  const availableLoans = loanRequests.filter((loan) => loan.status === 'approved');
  const pendingLoans = loanRequests.filter((loan) => loan.status === 'pending');

  const handleLoanFormChange = (field, value) => {
    setNewLoan((prev) => ({ ...prev, [field]: value }));
  };

  const renderActions = (loan) => {
    if (loan.status === 'pending') {
      return (
        <>
          <button className="action-btn approve-btn" onClick={() => approveLoan(loan._id)}>Approve</button>
          <button className="action-btn reject-btn" onClick={() => rejectLoan(loan._id)}>Reject</button>
        </>
      );
    }
    return <span className="no-action">-</span>;
  };

  const pieData = [
    { name: 'Paid', value: paymentStats.totalPaid },
    { name: 'Due', value: paymentStats.remaining }
  ];

  return (
    <div className="lender-dashboard">
      <header className="dashboard-header">
        <h1>🏦 Lender Dashboard</h1>
        <button className="create-loan-btn" onClick={() => setShowCreateLoanForm(true)}>
          <PlusCircle size={20} /> Create Loan Offer
        </button>
      </header>

      {showCreateLoanForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Loan Offer</h2>
            <form onSubmit={createLoanOffer} className="create-loan-form">
              <input
                type="number"
                placeholder="Loan Amount ($)"
                value={newLoan.amount}
                onChange={(e) => handleLoanFormChange('amount', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Interest Rate (%)"
                value={newLoan.interestRate}
                onChange={(e) => handleLoanFormChange('interestRate', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Duration (Months)"
                value={newLoan.durationMonths}
                onChange={(e) => handleLoanFormChange('durationMonths', e.target.value)}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="submit-btn">Create</button>
                <button type="button" className="cancel-btn" onClick={() => setShowCreateLoanForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="stats-cards">
        <div className="card">
          <Clock className="card-icon pending" size={32} />
          <div className="card-info">
            <h2>Pending Loans</h2>
            <p>{pendingLoans.length}</p>
          </div>
        </div>

        <div className="card">
          <ThumbsUp className="card-icon approved" size={32} />
          <div className="card-info">
            <h2>Approved Loans</h2>
            <p>{approvedLoans}</p>
          </div>
        </div>

        <div className="card">
          <ThumbsDown className="card-icon rejected" size={32} />
          <div className="card-info">
            <h2>Rejected Loans</h2>
            <p>{rejectedLoans}</p>
          </div>
        </div>

        <div className="card">
          <DollarSign className="card-icon available" size={32} />
          <div className="card-info">
            <h2>Available Offers</h2>
            <p>{availableLoans.length}</p>
          </div>
        </div>
      </section>

      <section className="payment-summary-section">
        <h2>📊 Payment Summary</h2>
        <div className="summary-grid">
          <table className="summary-table">
            <tbody>
              <tr><td><strong>Total Loan Amount:</strong></td><td>${paymentStats.totalAmount.toFixed(2)}</td></tr>
              <tr><td><strong>Total Interest:</strong></td><td>${paymentStats.totalInterest.toFixed(2)}</td></tr>
              <tr><td><strong>Total Paid:</strong></td><td>${paymentStats.totalPaid.toFixed(2)}</td></tr>
              <tr><td><strong>Remaining Due:</strong></td><td>${paymentStats.remaining.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="loan-requests">
        <h2 className="section-title">Manage Loan Requests ({loanRequests.length})</h2>
        {loading ? (
          <p>Loading loans...</p>
        ) : (
          <div className="table-container">
            <table className="loan-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Consumer</th>
                  <th>Status</th>
                  <th>Requested Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loanRequests.map((loan) => (
                  <tr key={loan._id}>
                    <td>${loan.amount.toLocaleString()}</td>
                    <td>{loan.consumer?.name || 'Unknown'}</td>
                    <td className={`status ${loan.status}`}>{loan.status}</td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td>{renderActions(loan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default LenderDashboard;
