const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  dateOfSale: Date,
  status: String, // "sold" or "not sold"
});

module.exports = mongoose.model('Transaction', transactionSchema);
