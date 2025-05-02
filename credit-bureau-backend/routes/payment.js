const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');

router.use(auth); // Protect all payment routes

// POST /api/payment → Make a payment
router.post('/', async (req, res) => {
  try {
    const { loanId, amount, method } = req.body;

    // Check for missing required fields
    if (!loanId || !amount || !method) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Find the loan by ID and ensure the consumer is authorized
    const loan = await Loan.findOne({ _id: loanId, consumer: req.user.id });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found or unauthorized' });
    }

    // Check if the loan status is "pending" and prevent payments
    if (loan.status === 'pending') {
      return res.status(400).json({ success: false, message: 'This loan is still pending and cannot be paid.' });
    }

    // Calculate the total due amount (with interest)
    const interestRate = loan.interestRate || 5; // Default to 5% if not provided
    const totalDue = loan.amount * (1 + interestRate / 100);
    const remainingAmount = totalDue - (loan.paidAmount || 0);

    // Ensure the payment amount is not greater than the remaining balance
    if (amount > remainingAmount) {
      return res.status(400).json({ success: false, message: `Payment amount exceeds the remaining balance of $${remainingAmount.toFixed(2)}` });
    }

    // Update the loan with the payment details
    loan.paidAmount = (loan.paidAmount || 0) + amount;
    loan.lastPaymentAmount = amount;
    loan.lastPaymentDate = new Date();

    if (loan.paidAmount >= totalDue) {
      loan.status = 'paid'; // Mark the loan as fully paid
      loan.paidAt = new Date();
    }

    await loan.save(); // Save the updated loan document

    // Create and save a payment record
    const payment = new Payment({
      loan: loanId,
      consumer: req.user.id,
      lender: loan.lender,  // Assuming lender is stored in loan document
      amount,
      method,
      paidAt: new Date(),
    });

    await payment.save(); // Save the payment record

    // Respond with success data, including updated loan and payment history
    const payments = await Payment.find({ consumer: req.user.id })
      .populate('loan', 'amount type status')
      .sort({ paidAt: -1 })
      .limit(5); // Limit to the last 5 payments for display

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      loan: {
        id: loan._id,
        amount: loan.amount,
        paidAmount: loan.paidAmount,
        status: loan.status,
        remainingAmount: remainingAmount,
      },
      payment: {
        id: payment._id,
        amount: payment.amount,
        method: payment.method,
        date: payment.paidAt,
      },
      paymentHistory: payments.map(payment => ({
        paymentId: payment._id,
        amount: payment.amount,
        method: payment.method,
        loanAmount: payment.loan.amount,
        loanStatus: payment.loan.status,
        paymentDate: payment.paidAt,
      })),
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: 'Server error while processing payment' });
  }
});

// GET /api/payment/history → Get all payment records for the consumer
router.get('/history', async (req, res) => {
  try {
    // Fetch all payments related to the logged-in consumer, with populated loan details
    const payments = await Payment.find({ consumer: req.user.id })
      .populate('loan', 'amount type status') // Populate loan details for display
      .sort({ paidAt: -1 }); // Sort by most recent payments

    // Send payment history as response
    res.status(200).json({
      success: true,
      payments: payments.map(payment => ({
        paymentId: payment._id,
        amount: payment.amount,
        method: payment.method,
        loanAmount: payment.loan.amount,
        loanStatus: payment.loan.status,
        paymentDate: payment.paidAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ success: false, message: 'Error fetching payment history' });
  }
});

module.exports = router;
