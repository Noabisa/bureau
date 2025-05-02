const mongoose = require('mongoose');

const availableLoanSchema = new mongoose.Schema({
  amount: Number,
  interestRate: Number,
  durationMonths: Number,
  type: String,
});

module.exports = mongoose.model('AvailableLoan', availableLoanSchema);