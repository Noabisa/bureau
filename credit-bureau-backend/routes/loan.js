const express = require('express');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');
const router = express.Router();

// Use auth middleware to protect the routes
router.use(auth);

// POST route for applying for a loan
router.post('/apply', async (req, res) => {
  const { amount, type, dueDate } = req.body;

  if (!amount || !type || !dueDate) {
    return res.status(400).send({ message: 'Amount, type, and due date are required' });
  }

  try {
    const loan = new Loan({
      consumer: req.user.id,
      amount,
      type,
      dueDate,
      status: 'pending',
    });

    await loan.save();
    res.status(201).send({ message: 'Loan application submitted', loan });
  } catch (err) {
    console.error('Error applying for loan:', err);
    res.status(500).send({ message: 'Error applying for loan' });
  }
});

// GET route to fetch all loans for the authenticated user
router.get('/my-loans', async (req, res) => {
  try {
    const loans = await Loan.find({ consumer: req.user.id });
    res.send({ loans });
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).send({ message: 'Error fetching loans' });
  }
});

// POST route for making a payment
router.post('/pay', async (req, res) => {
  const { loanId, amount, method } = req.body;

  if (!loanId || !amount || !method) {
    return res.status(400).send({ message: 'Loan ID, amount, and payment method are required' });
  }

  try {
    const loan = await Loan.findOne({ _id: loanId, consumer: req.user.id });
    if (!loan) return res.status(404).send({ message: 'Loan not found' });

    loan.paidAmount = (loan.paidAmount || 0) + amount;
    loan.paymentMethod = method;
    
    if (loan.paidAmount >= loan.amount) {
      loan.status = 'paid';
      loan.paidAt = new Date();
    }

    await loan.save();
    res.send({ message: 'Payment successful', loan });
  } catch (err) {
    console.error('Error making payment:', err);
    res.status(500).send({ message: 'Error processing payment' });
  }
});

// GET route to generate a credit report for the authenticated user
router.get('/credit-report', async (req, res) => {
  try {
    const loans = await Loan.find({ consumer: req.user.id });
    const overdueLoans = loans.filter(l => l.status !== 'paid' && new Date(l.dueDate) < new Date());

    const creditScore = 700 - (overdueLoans.length * 50);

    const report = {
      totalLoans: loans.length,
      paidLoans: loans.filter(l => l.status === 'paid').length,
      overdueLoans: overdueLoans.length,
      activeLoans: loans.filter(l => l.status !== 'paid').length,
      creditScore,
      loanHistory: loans,
    };

    res.send(report);
  } catch (err) {
    console.error('Error generating credit report:', err);
    res.status(500).send({ message: 'Error generating credit report' });
  }
});

module.exports = router;
