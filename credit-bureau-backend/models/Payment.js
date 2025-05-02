const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  paymentDate: { type: Date, required: true },
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
