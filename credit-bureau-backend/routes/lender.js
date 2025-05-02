const express = require('express');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const AvailableLoan = require('../models/AvailableLoan');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Get loans
router.get('/loans', async (req, res) => {
  try {
    const loans = await Loan.find().populate('consumer', 'name');
    const approvedLoans = loans.filter(l => l.status === 'approved').length;
    const rejectedLoans = loans.filter(l => l.status === 'rejected').length;
    res.send({ loans, approvedLoans, rejectedLoans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch loans' });
  }
});

// Approve/reject loan
router.patch('/loans/:id', async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.send(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update loan status' });
  }
});

// Create available loan
router.post('/available-loans', async (req, res) => {
  try {
    const loan = await AvailableLoan.create(req.body);
    res.send(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create available loan' });
  }
});

// 📊 NEW: Payment Summary Route
router.get('/payment-summary', async (req, res) => {
  try {
    // Fetch all loans that are either approved or paid
    const loans = await Loan.find({ status: { $in: ['approved', 'paid'] } });

    let totalAmount = 0;
    let totalInterest = 0;

    for (const loan of loans) {
      totalAmount += loan.amount;
      totalInterest += (loan.amount * loan.interestRate * loan.durationMonths) / (100 * 12);
    }

    const payments = await Payment.find({});
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const remaining = Math.max(totalAmount + totalInterest - totalPaid, 0);

    res.json({
      totalAmount: Number(totalAmount.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      remaining: Number(remaining.toFixed(2))
    });
  } catch (err) {
    console.error('Payment summary error:', err);
    res.status(500).json({ message: 'Failed to get payment summary' });
  }
});

module.exports = router;
