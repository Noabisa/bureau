const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Consumer who took the loan
  amount: { type: Number, required: true }, // Principal amount of the loan
  type: { type: String, enum: ['Personal', 'Auto', 'Mortgage'], required: true }, // Type of loan
  interestRate: { type: Number, default: 5 }, // Interest rate (default 5%)
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'paid'], 
    default: 'pending' 
  }, // Current loan status
  createdAt: { type: Date, default: Date.now }, // Date when the loan was created
  dueDate: { type: Date }, // Due date for the loan repayment
  paidAmount: { type: Number, default: 0 }, // Amount already paid
  paidAt: { type: Date }, // Date when the loan was fully paid (if applicable)
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Lender who provided the loan
  lastPaymentAmount: { type: Number, default: 0 }, // Amount of the last payment made
  lastPaymentDate: { type: Date }, // Date of the last payment
  totalAmountDue: { type: Number, default: 0 }, // Calculated total amount due (including interest)
  paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }], // Array of payment IDs related to the loan
});

LoanSchema.methods.calculateTotalAmountDue = function() {
  return this.amount * (1 + this.interestRate / 100);
};

LoanSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('interestRate')) {
    this.totalAmountDue = this.calculateTotalAmountDue();
  }
  next();
});

module.exports = mongoose.model('Loan', LoanSchema);
