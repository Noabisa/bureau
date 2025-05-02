const express = require('express');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const User = require('../models/User');
const AvailableLoan = require('../models/AvailableLoan');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Utility: Calculate dynamic credit score
const calculateCreditScore = (loans) => {
  if (!loans.length) return 300;
  let onTimePayments = 0;
  let totalPayments = 0;
  let overdueCount = 0;

  loans.forEach(loan => {
    const interestRate = loan.interestRate || 0;
    const totalWithInterest = loan.amount * (1 + interestRate / 100);
    const paidAmount = loan.paidAmount || 0;
    const isOverdue = new Date() > new Date(loan.dueDate) && loan.status !== 'paid';

    if (loan.status === 'paid' || paidAmount >= totalWithInterest) onTimePayments++;
    if (isOverdue) overdueCount++;

    totalPayments++;
  });

  const ratio = onTimePayments / totalPayments;
  let score = 300 + ratio * 550;
  score -= overdueCount * 10;

  return Math.max(300, Math.min(850, Math.round(score)));
};

// GET: All consumer loans, repayments, and user info
router.get('/loans', async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await Loan.find({ consumer: userId });
    const user = await User.findById(userId).select('name email');
    const creditScore = calculateCreditScore(loans);

    const repayments = loans
      .filter(l => l.lastPaymentAmount)
      .map(l => ({
        loanId: l._id,
        amount: l.lastPaymentAmount,
        method: l.paymentMethod,
        date: l.lastPaymentDate,
      }));

    const unpaid = loans.filter(l => l.status !== 'paid');
    const totalUnpaidWithInterest = unpaid.reduce((sum, l) => {
      const interest = l.interestRate || 15; // Set interest rate to 15%
      const total = l.amount * (1 + interest / 100);
      return sum + (total - (l.paidAmount || 0));
    }, 0);

    res.send({
      loans,
      repayments,
      creditScore,
      totalUnpaidWithInterest: Number(totalUnpaidWithInterest.toFixed(2)),
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).send({ message: 'Error fetching loans' });
  }
});

// POST: Apply for a custom loan
router.post('/loans', async (req, res) => {
  try {
    const { amount, type } = req.body;
    if (!amount || !type) {
      return res.status(400).send({ message: 'Amount and type are required' });
    }

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 6);

    const loan = await Loan.create({
      consumer: req.user.id,
      amount,
      type,
      dueDate,
      status: 'pending',
      interestRate: 15 // Set interest rate to 15%
    });

    res.status(201).send(loan);
  } catch (err) {
    console.error('Error applying for custom loan:', err);
    res.status(500).send({ message: 'Error applying for loan' });
  }
});

// GET: Available loan offers
router.get('/available-loans', async (req, res) => {
  try {
    const offers = await AvailableLoan.find();
    res.send({ availableLoans: offers });
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).send({ message: 'Error fetching loan offers' });
  }
});

// POST: Apply for a loan offer
router.post('/apply-loan', async (req, res) => {
  try {
    const { loanOfferId } = req.body;
    const offer = await AvailableLoan.findById(loanOfferId);
    if (!offer) return res.status(404).send({ message: 'Loan offer not found' });

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + offer.durationMonths);

    const loan = await Loan.create({
      consumer: req.user.id,
      amount: offer.amount,
      type: offer.type,
      dueDate,
      status: 'pending',
      interestRate: 15 // Set interest rate to 15%
    });

    res.status(201).send(loan);
  } catch (err) {
    console.error('Error applying for loan offer:', err);
    res.status(500).send({ message: 'Error applying for loan offer' });
  }
});

// POST: Pay a loan (includes interest & tracking)
router.post('/pay', async (req, res) => {
  try {
    const { loanId, amount, method } = req.body;
    if (!loanId || !amount || !method) {
      return res.status(400).send({ message: 'Loan ID, amount, and payment method are required' });
    }

    const loan = await Loan.findOne({ _id: loanId, consumer: req.user.id });
    if (!loan) return res.status(404).send({ message: 'Loan not found' });

    const interest = loan.interestRate || 15; // Use 15% interest
    const totalDue = loan.amount * (1 + interest / 100);
    loan.paidAmount = (loan.paidAmount || 0) + amount;

    loan.lastPaymentAmount = amount;
    loan.lastPaymentDate = new Date();
    loan.paymentMethod = method;

    if (loan.paidAmount >= totalDue) {
      loan.status = 'paid';
      loan.paidAt = new Date();
    }

    // Save payment record to Payment schema
    const payment = new Payment({
      loanId: loan._id,
      amount,
      method,
      paymentDate: loan.lastPaymentDate
    });
    await payment.save();

    await loan.save();
    res.send({ message: 'Payment successful', loan });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).send({ message: 'Payment failed' });
  }
});

// GET: Credit report with score, user, and last payment
router.get('/report', async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await Loan.find({ consumer: userId }).sort({ lastPaymentDate: -1 });
    const user = await User.findById(userId).select('name email');
    const creditScore = calculateCreditScore(loans);
    const lastPayment = loans.find(l => l.lastPaymentAmount);

    res.send({
      user: {
        name: user.name,
        email: user.email
      },
      totalLoans: loans.length,
      paidLoans: loans.filter(l => l.status === 'paid').length,
      overdueLoans: loans.filter(l => l.status !== 'paid' && l.dueDate < new Date()).length,
      activeLoans: loans.filter(l => l.status !== 'paid').length,
      creditScore,
      lastPayment: lastPayment ? {
        loanId: lastPayment._id,
        amount: lastPayment.lastPaymentAmount,
        method: lastPayment.paymentMethod,
        date: lastPayment.lastPaymentDate
      } : null,
      history: loans
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).send({ message: 'Error generating credit report' });
  }
});

module.exports = router;
