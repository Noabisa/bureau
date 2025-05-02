const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assume lender is a User as well
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  paidAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema);
