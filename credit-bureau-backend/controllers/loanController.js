const LoanRequest = require('../models/LoanOffer');
const User = require('../models/User');

// Request a loan
const requestLoan = async (req, res) => {
  const { amount, lenderId } = req.body;
  const consumerId = req.user.id;

  const loanRequest = new LoanRequest({
    consumer: consumerId,
    lender: lenderId,
    amount,
  });

  await loanRequest.save();
  res.status(201).json(loanRequest);
};

// Approve/Reject loan
const updateLoanStatus = async (req, res) => {
  const { loanId, status } = req.body;
  const loanRequest = await LoanRequest.findById(loanId);

  if (!loanRequest) return res.status(404).json({ message: "Loan request not found" });

  loanRequest.status = status;
  loanRequest.approved = status === 'approved';
  await loanRequest.save();

  res.status(200).json(loanRequest);
};

module.exports = { requestLoan, updateLoanStatus };
