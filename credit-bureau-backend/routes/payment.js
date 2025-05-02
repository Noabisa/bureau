const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');

router.use(auth); // protect all payment routes

// POST /api/payment → Make a payment
router.post('/', async (req, res) => {
  try {
    const { loanId, amount, method } = req.body;

    if (!loanId || !amount || !method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find loan by ID
    const loan = await Loan.findOne({ _id: loanId, consumer: req.user.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found or unauthorized' });

    // Update loan status and paid amount
    loan.paidAmount = (loan.paidAmount || 0) + amount;
    loan.lastPaymentAmount = amount;
    loan.lastPaymentDate = new Date();
    
    if (loan.paidAmount >= loan.amount) {
      loan.status = 'paid'; // Mark loan as fully paid
      loan.paidAt = new Date();
    }
    
    await loan.save(); // Save the updated loan

    // Create a payment record
    const payment = new Payment({
      loan: loanId,
      consumer: req.user.id,
      lender: loan.lender,  // Assuming lender is stored in loan document
      amount,
      method,
      paidAt: new Date(),
    });

    await payment.save(); // Save the payment record

    // Respond with success
    res.status(200).json({ message: 'Payment successful', loan, payment });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payment/history → Get all payment records for consumer
router.get('/history', async (req, res) => {
  try {
    const payments = await Payment.find({ consumer: req.user.id })
      .populate('loan', 'amount type status') // populate loan details
      .sort({ paidAt: -1 }); // Latest payments first

    res.status(200).json({ payments });
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
});

module.exports = router;
