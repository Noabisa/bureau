const express = require('express');
const Loan = require('../models/Loan');
const AvailableLoan = require('../models/AvailableLoan');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth); // All routes require authentication

// Credit Score Calculation Function
const calculateCreditScore = (loans) => {
  if (!loans || loans.length === 0) return 300;

  let onTimePayments = 0;
  let totalPayments = 0;
  let overdueCount = 0;

  loans.forEach(loan => {
    const interestRate = loan.interestRate || 0;
    const totalWithInterest = loan.amount * (1 + interestRate / 100);
    const paidAmount = loan.paidAmount || 0;
    const isOverdue = new Date() > new Date(loan.dueDate) && loan.status !== 'paid';

    if (loan.status === 'paid' || paidAmount >= totalWithInterest) {
      onTimePayments++;
    }

    if (isOverdue) overdueCount++;
    totalPayments++;
  });

  const paymentRatio = onTimePayments / totalPayments;
  let creditScore = 300 + paymentRatio * 550; // from 300 to 850
  creditScore -= overdueCount * 10; // penalty

  return Math.max(300, Math.min(850, Math.round(creditScore)));
};

// GET: Consumer's loans and credit score
router.get('/loans', async (req, res) => {
  try {
    const loans = await Loan.find({ consumer: req.user.id });
    const creditScore = calculateCreditScore(loans);

    const unpaidLoans = loans.filter(l => l.status !== 'paid');
    const totalUnpaidWithInterest = unpaidLoans.reduce((sum, loan) => {
      const interestRate = loan.interestRate || 5;
      const total = loan.amount * (1 + interestRate / 100);
      return sum + (total - (loan.paidAmount || 0));
    }, 0);

    res.send({
      loans,
      creditScore,
      totalUnpaidWithInterest: Number(totalUnpaidWithInterest.toFixed(2))
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
      interestRate: 5
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
    const availableLoans = await AvailableLoan.find();
    res.send({ availableLoans });
  } catch (err) {
    console.error('Error fetching available loans:', err);
    res.status(500).send({ message: 'Error fetching available loan offers' });
  }
});

// POST: Apply for a loan offer
router.post('/apply-loan', async (req, res) => {
  try {
    const { loanOfferId } = req.body;
    if (!loanOfferId) {
      return res.status(400).send({ message: 'Loan offer ID is required' });
    }

    const offer = await AvailableLoan.findById(loanOfferId);
    if (!offer) {
      return res.status(404).send({ message: 'Loan offer not found' });
    }

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + offer.durationMonths);

    const loan = await Loan.create({
      consumer: req.user.id,
      amount: offer.amount,
      type: offer.type,
      dueDate,
      status: 'pending',
      interestRate: offer.interestRate || 5
    });

    res.status(201).send(loan);
  } catch (err) {
    console.error('Error applying for available loan offer:', err);
    res.status(500).send({ message: 'Error applying for loan offer' });
  }
});

// GET: Credit report
router.get('/report', async (req, res) => {
  try {
    const loans = await Loan.find({ consumer: req.user.id });
    const creditScore = calculateCreditScore(loans);

    const report = {
      totalLoans: loans.length,
      paidLoans: loans.filter(l => l.status === 'paid').length,
      overdueLoans: loans.filter(l => l.status !== 'paid' && l.dueDate < new Date()).length,
      activeLoans: loans.filter(l => l.status !== 'paid').length,
      creditScore,
      history: loans
    };

    res.send(report);
  } catch (err) {
    console.error('Error generating credit report:', err);
    res.status(500).send({ message: 'Error generating credit report' });
  }
});

// POST: Make a loan payment
router.post('/pay', async (req, res) => {
  try {
    const { loanId, amount, method } = req.body;
    if (!loanId || !amount || !method) {
      return res.status(400).send({ message: 'Loan ID, amount, and payment method are required' });
    }

    const loan = await Loan.findOne({ _id: loanId, consumer: req.user.id });
    if (!loan) {
      return res.status(404).send({ message: 'Loan not found' });
    }

    const interestRate = loan.interestRate || 5;
    const totalDue = loan.amount * (1 + interestRate / 100);
    const newPaid = (loan.paidAmount || 0) + amount;

    loan.paidAmount = newPaid;
    loan.paymentMethod = method;
    loan.lastPaymentAmount = amount;
    loan.lastPaymentDate = new Date();

    if (newPaid >= totalDue) {
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

module.exports = router;
