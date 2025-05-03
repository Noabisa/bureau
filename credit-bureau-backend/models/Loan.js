const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Personal', 'Auto', 'Mortgage'], required: true },
  interestRate: { type: Number, default: 5 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  paidAmount: { type: Number, default: 0 },
  paidAt: { type: Date },
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Assuming you want to reference the lender
});

module.exports = mongoose.model('Loan', LoanSchema);
