const express = require('express');
const axios = require('axios');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Fetch transactions from third-party API
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Save data to MongoDB (optional)
    await Transaction.insertMany(transactions);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
});

// Get Total Amount of Transactions
router.get('/total', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const totalAmount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    res.json({ totalAmount });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating total amount', error });
  }
});

// Get Average Amount of Transactions
router.get('/average', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const totalAmount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const averageAmount = totalAmount / transactions.length;
    res.json({ averageAmount });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating average amount', error });
  }
});

// Get Category-wise Statistics
router.get('/categories', async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const categoryStats = transactions.reduce((acc, transaction) => {
      if (acc[transaction.category]) {
        acc[transaction.category] += transaction.amount;
      } else {
        acc[transaction.category] = transaction.amount;
      }
      return acc;
    }, {});

    res.json(categoryStats);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating category statistics', error });
  }
});

module.exports = router;
