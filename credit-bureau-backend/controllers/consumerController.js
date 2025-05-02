// controllers/consumerController.js

const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const User = require('../models/User');

exports.getConsumerLoanData = async (req, res) => {
  try {
    const loans = await Loan.find({ consumerId: req.user.id });
    const repayments = await Payment.find({ consumerId: req.user.id });
    const consumer = await User.findById(req.user.id).select('fullName email');

    res.json({ loans, repayments, consumer });
  } catch (err) {
    console.error('Error fetching credit report data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
