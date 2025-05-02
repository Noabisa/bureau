import React, { useEffect, useState, useRef } from 'react';
import axios from '../services/api';
import html2pdf from 'html2pdf.js';
import './CreditReport.css';

import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, Legend
} from 'recharts';

const CreditReport = () => {
  const [loans, setLoans] = useState([]);
  const [score, setScore] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [lastPayment, setLastPayment] = useState(null);
  const [nextDueDate, setNextDueDate] = useState(null);
  const [missedPayments, setMissedPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');

  const reportRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/consumer/loans');
        const { loans, repayments = [], user, creditScore } = res.data;

        setLoans(loans);
        setRepayments(repayments);
        setUserInfo(user);
        setScore(creditScore || null);

        if (repayments.length > 0) {
          const latest = repayments[repayments.length - 1];
          setLastPayment(latest);
        }

        // Next due & missed payments
        const today = new Date();
        const futureLoans = loans.filter(l => new Date(l.dueDate) > today && l.status !== 'paid');
        const overdueLoans = loans.filter(l => new Date(l.dueDate) < today && l.status !== 'paid');

        if (futureLoans.length > 0) {
          const sorted = futureLoans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          setNextDueDate(sorted[0].dueDate);
        }
        setMissedPayments(overdueLoans);

        // Fallback score if backend fails
        if (!creditScore) {
          const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.amount, 0);
          const totalPaid = repayments.reduce((acc, r) => acc + r.amount, 0);
          let fallbackScore = 300;
          if (totalLoanAmount > 0) {
            const paymentRatio = totalPaid / totalLoanAmount;
            fallbackScore += Math.min(550, Math.round(paymentRatio * 550));
          } else {
            fallbackScore = 500;
          }
          setScore(fallbackScore);
        }

      } catch (err) {
        console.error('Error fetching credit report:', err);
      }
    };

    fetchData();
  }, []);

  const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.amount, 0);
  const totalPaid = repayments.reduce((acc, r) => acc + r.amount, 0);
  const remainingBalance = totalLoanAmount - totalPaid;

  const methodCounts = {};
  repayments.forEach(r => {
    methodCounts[r.method] = (methodCounts[r.method] || 0) + 1;
  });

  const getMonthlyData = () => {
    const monthMap = {};
    repayments.forEach(r => {
      const date = new Date(r.date);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthMap[key] = (monthMap[key] || 0) + r.amount;
    });
    return Object.entries(monthMap).map(([month, amount]) => ({ month, amount }));
  };

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: 'Credit_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const filteredLoans = loans
    .filter(loan =>
      statusFilter === 'All' ||
      (statusFilter === 'overdue' && new Date(loan.dueDate) < new Date() && loan.status !== 'paid') ||
      loan.status.toLowerCase() === statusFilter.toLowerCase()
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="credit-report-container">
      <div ref={reportRef} className="credit-report">
        <h1>Credit Report</h1>

        <section>
          <h2>1. Consumer Details</h2>
          <p><strong>Full Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
        </section>

        <section>
          <h2>2. Credit Score</h2>
          <p>
            Your current credit score is: <strong>{score !== null ? score : 'Loading...'}</strong>
          </p>
        </section>

        <section>
          <h2>3. Last Payment</h2>
          {lastPayment ? (
            <>
              <p><strong>Amount:</strong> ${lastPayment.amount.toFixed(2)}</p>
              <p><strong>Method:</strong> {lastPayment.method}</p>
              <p><strong>Date:</strong> {new Date(lastPayment.date).toLocaleDateString()}</p>
            </>
          ) : (
            <p>No payments have been made yet.</p>
          )}
        </section>

        <section>
          <h2>4. Upcoming & Missed Payments</h2>
          {nextDueDate ? (
            <p><strong>Next Payment Due:</strong> {new Date(nextDueDate).toLocaleDateString()}</p>
          ) : (
            <p>No upcoming payments.</p>
          )}
          {missedPayments.length > 0 ? (
            <>
              <p><strong>Missed Payments:</strong></p>
              <ul>
                {missedPayments.map(m => (
                  <li key={m._id}>
                    {m.type} - ${m.amount.toFixed(2)} - Due {new Date(m.dueDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No missed payments.</p>
          )}
        </section>

        <section>
          <h2>5. Loan History</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label>Status Filter: </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          {filteredLoans.length === 0 ? (
            <p>No matching loans found.</p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issued Date</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map(loan => (
                  <tr key={loan._id}>
                    <td>{loan.type}</td>
                    <td>${loan.amount.toFixed(2)}</td>
                    <td>{loan.status}</td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2>6. Repayment History</h2>
          {repayments.length === 0 ? (
            <p>No repayment history available.</p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Amount Paid</th>
                  <th>Date</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {repayments.map((r, index) => (
                  <tr key={index}>
                    <td>{r.loanId}</td>
                    <td>${r.amount.toFixed(2)}</td>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2>7. Payment Summary</h2>
          <p><strong>Total Loan Amount:</strong> ${totalLoanAmount.toFixed(2)}</p>
          <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
          <p><strong>Remaining Balance:</strong> ${remainingBalance.toFixed(2)}</p>
          <p><strong>Most Used Payment Method:</strong> {
            Object.keys(methodCounts).length
              ? Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0][0]
              : 'N/A'
          }</p>
        </section>

        <section>
          <h2>8. Visual Summary</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h3>Paid vs Remaining</h3>
              <PieChart width={300} height={250}>
                <Pie
                  data={[
                    { name: 'Paid', value: totalPaid },
                    { name: 'Remaining', value: remainingBalance }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#82ca9d" />
                  <Cell fill="#f08080" />
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            <div>
              <h3>Monthly Payments</h3>
              <BarChart width={400} height={250} data={getMonthlyData()}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </div>
          </div>
        </section>

        <section>
          <h2>9. Summary</h2>
          <p>
            This report helps you track your financial activity and credit behavior. It is useful when applying for future loans or verifying your financial reliability.
          </p>
        </section>
      </div>

      <button className="print-btn" onClick={handleDownloadPDF}>
        Download Credit Report (PDF)
      </button>
    </div>
  );
};

export default CreditReport;
