import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import {
  User, TrendingUp, AlertTriangle, CreditCard,
  BarChart2, FileText, DollarSign
} from 'react-feather';
import { useNavigate } from 'react-router-dom';
import './consumer-dashboard.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const ConsumerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [availableLoans, setAvailableLoans] = useState([]);
  const [creditScore, setCreditScore] = useState(0);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanType, setLoanType] = useState('Personal');
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      fetchLoans();
      fetchAvailableLoans();
    }
  }, []);

  const isLoggedIn = () => !!localStorage.getItem('token');

  const calculateCreditScoreFromLoans = (loans) => {
    if (!loans.length) return 0;

    let onTimePayments = 0;
    let totalPayments = 0;
    let overdueCount = 0;

    loans.forEach(loan => {
      const interestRate = loan.interestRate || 15;
      const totalWithInterest = loan.amount * (1 + interestRate / 100);
      const paidAmount = loan.paidAmount || 0;
      const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;
      const isOverdue = dueDate && new Date() > dueDate && loan.status !== 'paid';

      if (loan.status === 'paid' || paidAmount >= totalWithInterest) {
        onTimePayments += 1;
      }
      totalPayments += 1;

      if (isOverdue) overdueCount += 1;
    });

    const paymentRatio = onTimePayments / totalPayments;
    let score = 300 + paymentRatio * 550;
    score -= overdueCount * 10;

    return Math.max(300, Math.min(850, Math.round(score)));
  };

  const getLatestPayment = () => {
    const payments = loans
      .filter(l => l.lastPaymentDate)
      .sort((a, b) => new Date(b.lastPaymentDate) - new Date(a.lastPaymentDate));
    return payments.length ? payments[0] : null;
  };

  const fetchLoans = async () => {
    try {
      const res = await axios.get('/api/consumer/loans');
      const fetchedLoans = res.data.loans;
      setLoans(fetchedLoans);

      const overdue = fetchedLoans.filter(
        loan => loan.dueDate && new Date(loan.dueDate) < new Date() && loan.status !== 'paid'
      );
      setOverdueLoans(overdue);

      const calculatedScore = calculateCreditScoreFromLoans(fetchedLoans);
      setCreditScore(calculatedScore);
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  };

  const fetchAvailableLoans = async () => {
    try {
      const res = await axios.get('/api/consumer/available-loans');
      setAvailableLoans(res.data.availableLoans);
    } catch (err) {
      console.error('Error fetching available loans:', err);
    }
  };

  const handleRequestLoan = () => {
    if (!isLoggedIn()) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setShowLoanForm(!showLoanForm);
  };

  const handleApplyLoan = async (loanId) => {
    if (!isLoggedIn()) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    try {
      await axios.post('/api/consumer/apply-loan', { loanOfferId: loanId });
      alert('Loan application submitted!');
      fetchLoans();
    } catch (err) {
      console.error('Error applying for loan:', err);
      alert('Failed to apply.');
    }
  };

  const requestLoan = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/consumer/loans', { amount: loanAmount, type: loanType });
      setLoanAmount('');
      setLoanType('Personal');
      setShowLoanForm(false);
      fetchLoans();
    } catch (err) {
      console.error('Error requesting loan:', err);
      alert('Failed to request loan.');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    fetchLoans();
    fetchAvailableLoans();
  };

  const navigateToFeature = (path) => {
    navigate(path);
  };

  const calculateTotalLoans = () => {
    return loans.reduce((total, loan) => {
      const interestRate = loan.interestRate || 15;
      const totalWithInterest = loan.amount * (1 + interestRate / 100);
      return total + totalWithInterest;
    }, 0).toFixed(2);
  };

  const calculateRemainingBalance = () => {
    return loans.reduce((total, loan) => {
      const interestRate = loan.interestRate || 15;
      const totalWithInterest = loan.amount * (1 + interestRate / 100);
      const paidAmount = loan.paidAmount || 0;
      const remaining = totalWithInterest - paidAmount;
      return loan.status !== 'paid' ? total + remaining : total;
    }, 0).toFixed(2);
  };

  const latestPayment = getLatestPayment();

  return (
    <div className="consumer-dashboard">
      <header className="dashboard-header">
        <h1>Welcome Back, Consumer!</h1>
        <User className="header-icon" />
      </header>

      <section className="stats-cards">
        <div className="card">
          <TrendingUp className="card-icon trending" />
          <div className="card-info">
            <h2>Credit Score</h2>
            <p>{creditScore}</p>
            <small>
              Last Payment:{' '}
              {latestPayment
                ? `$${latestPayment.lastPaymentAmount} on ${new Date(latestPayment.lastPaymentDate).toLocaleDateString()}`
                : 'No recent payments'}
            </small>
          </div>
        </div>

        <div className="card">
          <CreditCard className="card-icon loans" />
          <div className="card-info">
            <h2>Total Loans</h2>
            <p>${calculateTotalLoans()}</p>
          </div>
        </div>

        <div className="card">
          <CreditCard className="card-icon balance" />
          <div className="card-info">
            <h2>Total Remaining</h2>
            <p>${calculateRemainingBalance()}</p>
          </div>
        </div>

        <div className="card">
          <CreditCard className="card-icon pending" />
          <div className="card-info">
            <h2>Pending Requests</h2>
            <p>{loans.filter(loan => loan.status === 'pending').length}</p>
          </div>
        </div>
      </section>

      <section className="feature-buttons">
        <button onClick={() => navigateToFeature('/consumer/credit-report')} className="feature-btn">
          <FileText size={18} /> Credit Report
        </button>
        <button onClick={() => navigateToFeature('/consumer/credit-chart')} className="feature-btn">
          <BarChart2 size={18} /> Credit Chart
        </button>
        <button onClick={() => navigateToFeature('/consumer/pay-loan')} className="feature-btn">
          <DollarSign size={18} /> Pay Loan
        </button>
      </section>

      <section className="loan-request">
        <button className="loan-btn" onClick={handleRequestLoan}>
          {showLoanForm ? 'Cancel Request' : 'Request a New Loan'}
        </button>

        {showLoanForm && (
          <form className="loan-form" onSubmit={requestLoan}>
            <div className="form-group">
              <label>Loan Amount ($)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                required
                min="100"
              />
            </div>
            <div className="form-group">
              <label>Loan Type</label>
              <select value={loanType} onChange={(e) => setLoanType(e.target.value)}>
                <option value="Personal">Personal</option>
                <option value="Auto">Auto</option>
                <option value="Mortgage">Mortgage</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">Submit Loan Request</button>
          </form>
        )}
      </section>

      <section className="loan-table">
        <h2 className="section-title">Available Loan Offers</h2>
        <table>
          <thead>
            <tr>
              <th>Loan Type</th>
              <th>Amount</th>
              <th>Interest</th>
              <th>Apply</th>
            </tr>
          </thead>
          <tbody>
            {availableLoans.map((loan) => (
              <tr key={loan._id}>
                <td>{loan.type}</td>
                <td>${loan.amount}</td>
                <td>{loan.interestRate}%</td>
                <td>
                  <button onClick={() => handleApplyLoan(loan._id)}>Apply</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="loan-table">
        <h2 className="section-title">My Loans</h2>
        <table>
          <thead>
            <tr>
              <th>Total Amount (with Interest)</th>
              <th>Remaining Balance</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Last Payment</th>
              <th>Repayment Progress</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const interestRate = loan.interestRate || 15;
              const totalWithInterest = loan.amount * (1 + interestRate / 100);
              const paidAmount = loan.paidAmount || 0;
              const remaining = totalWithInterest - paidAmount;
              const progress = Math.min((paidAmount / totalWithInterest) * 100, 100);

              return (
                <tr key={loan._id}>
                  <td>${loan.amount} + {interestRate}% = ${totalWithInterest.toFixed(2)}</td>
                  <td>${remaining.toFixed(2)}</td>
                  <td className={`status ${loan.status}`}>{loan.status}</td>
                  <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  <td>
                    {loan.lastPaymentDate
                      ? `${new Date(loan.lastPaymentDate).toLocaleDateString()} ($${loan.lastPaymentAmount})`
                      : 'No payments'}
                  </td>
                  <td>
                    <div style={{ width: '100%', background: '#e0e0e0', borderRadius: '5px' }}>
                      <div
                        style={{
                          width: `${progress}%`,
                          background: progress >= 100 ? 'green' : '#3b82f6',
                          height: '10px',
                          borderRadius: '5px',
                        }}
                      ></div>
                      <small>{progress.toFixed(1)}%</small>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {overdueLoans.length > 0 && (
        <section className="overdue-alert">
          <AlertTriangle className="alert-icon" />
          <p>You have overdue loans. Please settle them as soon as possible!</p>
        </section>
      )}

      {showAuthModal && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            {authMode === 'login' ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                switchToRegister={() => setAuthMode('register')}
                closeModal={() => setShowAuthModal(false)}
              />
            ) : (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                switchToLogin={() => setAuthMode('login')}
                closeModal={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerDashboard;
