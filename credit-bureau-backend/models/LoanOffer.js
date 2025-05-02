// models/LoanOffer.js
const mongoose = require('mongoose');

const loanOfferSchema = new mongoose.Schema({
  amount: Number,
  interestRate: Number,
  durationMonths: Number,
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, default: 'Personal' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LoanOffer', loanOfferSchema);