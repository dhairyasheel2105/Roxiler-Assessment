const Transaction = require('../models/Transaction');

// API to fetch all transactions with pagination and search
const getTransactions = async (req, res) => {
  const { month, page = 1, perPage = 10, search = "" } = req.query;

  const startOfMonth = new Date(`2023-${month}-01T00:00:00.000Z`);
  const endOfMonth = new Date(`2023-${month}-01T23:59:59.999Z`);
  
  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } },
      ]
    })
    .skip((page - 1) * perPage)
    .limit(perPage);

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API for statistics
const getStatistics = async (req, res) => {
  const { month } = req.query;

  const startOfMonth = new Date(`2023-${month}-01T00:00:00.000Z`);
  const endOfMonth = new Date(`2023-${month}-01T23:59:59.999Z`);
  
  try {
    const totalSale = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'sold'
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'not sold'
    });

    res.json({
      totalSale: totalSale[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API for bar chart data
const getBarChartData = async (req, res) => {
  const { month } = req.query;

  const startOfMonth = new Date(`2023-${month}-01T00:00:00.000Z`);
  const endOfMonth = new Date(`2023-${month}-01T23:59:59.999Z`);
  
  try {
    const priceRanges = [
      { $match: { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: "Other",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ];

    const result = await Transaction.aggregate(priceRanges);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API for pie chart data
const getPieChartData = async (req, res) => {
  const { month } = req.query;

  const startOfMonth = new Date(`2023-${month}-01T00:00:00.000Z`);
  const endOfMonth = new Date(`2023-${month}-01T23:59:59.999Z`);
  
  try {
    const categories = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API to initialize the database
const initializeDatabase = async (req, res) => {
  const transactions = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json')
    .then(res => res.json());

  try {
    await Transaction.insertMany(transactions);
    res.json({ message: 'Database initialized successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
  initializeDatabase,
};
