import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { AlertTriangle, DollarSign } from 'react-feather';
import './pay-loan.css';

const PayLoan = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get('/api/consumer/loans');
      const unpaidLoans = res.data.loans.filter(loan => loan.status !== 'paid');
      setLoans(unpaidLoans);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setMessage('❌ Failed to load your loans.');
      setShowMessage(true);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!selectedLoan || !paymentAmount || !paymentMethod) {
      setMessage('❗ Please fill in all payment fields.');
      setShowMessage(true);
      return;
    }

    const loan = loans.find(loan => loan._id === selectedLoan);
    if (!loan) {
      setMessage('❌ Loan not found.');
      setShowMessage(true);
      return;
    }

    // Ensure payment amount is not greater than remaining balance
    const totalDue = loan.amount + (1 + loan.interest || 15);
    const remaining = totalDue - (loan.paidAmount || 0);

    if (parseFloat(paymentAmount) > remaining) {
      setMessage(`❗ Payment amount cannot exceed remaining balance of $${remaining.toFixed(2)}.`);
      setShowMessage(true);
      return;
    }

    try {
      await axios.post('/api/consumer/pay', {
        loanId: selectedLoan,
        amount: parseFloat(paymentAmount),
        method: paymentMethod
      });

      setMessage(`✅ Payment of $${paymentAmount} successful!`);
      setShowMessage(true);
      setPaymentAmount('');
      setSelectedLoan('');
      setPaymentMethod('');
      fetchLoans();
    } catch (err) {
      console.error('Error making payment:', err);
      setMessage('❌ Failed to make the payment. Please try again.');
      setShowMessage(true);
    }
  };

  return (
    <div className="pay-loan">
      <header className="header">
        <h1>Pay Loan</h1>
        <DollarSign className="header-icon" />
      </header>

      <section className="payment-section">
        <form className="payment-form" onSubmit={handlePayment}>
          <div className="form-group">
            <label htmlFor="loan-select">Select Loan</label>
            <select
              id="loan-select"
              value={selectedLoan}
              onChange={(e) => setSelectedLoan(e.target.value)}
              required
            >
              <option value="">-- Select an Unpaid Loan --</option>
              {loans.map((loan) => {
                const paid = loan.paidAmount || 0;
                const totalDue = loan.amount + (loan.interest || 15);
                const remaining = totalDue - paid;
                return (
                  <option key={loan._id} value={loan._id}>
                    ${remaining.toFixed(2)} remaining of ${totalDue.toFixed(2)} (Due: {new Date(loan.dueDate).toLocaleDateString()})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="payment-amount">Amount to Pay</label>
            <input
              id="payment-amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="payment-method">Payment Method</label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">-- Select Payment Method --</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">Make Payment</button>
        </form>
      </section>

      {showMessage && (
        <section className="message-section">
          <p>{message}</p>
          {message.includes('❌') && <AlertTriangle className="alert-icon" />}
        </section>
      )}
    </div>
  );
};

export default PayLoan;
