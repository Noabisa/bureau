import React, { useEffect, useState, useRef } from 'react';
import axios from '../services/api';
import html2pdf from 'html2pdf.js';
import './CreditReport.css';

const CreditReport = () => {
  const [loans, setLoans] = useState([]);
  const [score, setScore] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const reportRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/consumer/loans');
        const loans = res.data.loans;
        const repayments = res.data.repayments || [];

        setLoans(loans);
        setRepayments(repayments);

        // Calculate dynamic credit score
        const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.amount, 0);
        const totalPaid = repayments.reduce((acc, r) => acc + r.amount, 0);
        let creditScore = 300;

        if (totalLoanAmount > 0) {
          const paymentRatio = totalPaid / totalLoanAmount;
          creditScore += Math.min(550, Math.round(paymentRatio * 550)); // Cap score to 850
        } else {
          creditScore = 500; // Default score when no loans
        }

        setScore(creditScore);
      } catch (err) {
        console.error('Error fetching credit report:', err);
      }
    };
    fetchData();
  }, []);

  // Calculate payment summary
  const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.amount, 0);
  const totalPaid = repayments.reduce((acc, r) => acc + r.amount, 0);
  const remainingBalance = totalLoanAmount - totalPaid;

  const methodCounts = {};
  repayments.forEach(r => {
    methodCounts[r.method] = (methodCounts[r.method] || 0) + 1;
  });

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

  return (
    <div className="credit-report-container">
      <div ref={reportRef} className="credit-report">
        <h1>Credit Report</h1>

        <section>
          <h2>1. Credit Score</h2>
          <p>
            Your current credit score is: <strong>{score !== null ? score : 'Loading...'}</strong>
          </p>
          <p>
            This score reflects your creditworthiness based on your loan and repayment behavior. A higher score indicates a good history of timely payments.
          </p>
        </section>

        <section>
          <h2>2. Loan History</h2>
          {loans.length === 0 ? (
            <p>No loan records found.</p>
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
                {loans.map((loan) => (
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
          <h2>3. Repayment History</h2>
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
          <h2>4. Payment Summary</h2>
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
          <h2>5. Summary</h2>
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
