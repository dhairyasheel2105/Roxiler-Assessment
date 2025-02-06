const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
const DATA_URL = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

// Fetch transaction data from the external source
let transactionsData = [];

const loadData = async () => {
  try {
    const response = await axios.get(DATA_URL);
    transactionsData = response.data;
    console.log("Data successfully loaded.");
  } catch (error) {
    console.error("Error loading transaction data:", error);
  }
};

// Load data at server startup
loadData();

// Helper to filter data by month
const filterByMonth = (data, month) => {
  return data.filter((transaction) => {
    const transactionMonth = new Date(transaction.dateOfSale).toLocaleString("en-US", { month: "long" });
    return transactionMonth === month;
  });
};

// Endpoint: Fetch Transactions
app.get("/api/transactions", (req, res) => {
  const { month, search = "", page = 1, perPage = 10 } = req.query;
  const filtered = filterByMonth(transactionsData, month).filter((transaction) =>
    transaction.title.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  res.json(paginated);
});

// Endpoint: Fetch Statistics
app.get("/api/statistics", (req, res) => {
  const { month } = req.query;
  const filtered = filterByMonth(transactionsData, month);
  const totalSale = filtered.reduce((sum, transaction) => sum + transaction.price, 0);
  const soldItems = filtered.length;
  const notSoldItems = transactionsData.length - soldItems;

  res.json({
    totalSale,
    soldItems,
    notSoldItems,
  });
});

// Endpoint: Bar Chart Data
app.get("/api/bar-chart", (req, res) => {
  const { month } = req.query;
  const filtered = filterByMonth(transactionsData, month);

  const priceRanges = {
    "0-100": 0,
    "101-200": 0,
    "201-300": 0,
    "301-400": 0,
    "401+": 0,
  };

  filtered.forEach((transaction) => {
    if (transaction.price <= 100) priceRanges["0-100"]++;
    else if (transaction.price <= 200) priceRanges["101-200"]++;
    else if (transaction.price <= 300) priceRanges["201-300"]++;
    else if (transaction.price <= 400) priceRanges["301-400"]++;
    else priceRanges["401+"]++;
  });

  res.json({
    labels: Object.keys(priceRanges),
    datasets: [
      {
        label: "Transactions by Price Range",
        data: Object.values(priceRanges),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  });
});

// Endpoint: Pie Chart Data
app.get("/api/pie-chart", (req, res) => {
  const { month } = req.query;
  const filtered = filterByMonth(transactionsData, month);

  const categoryCounts = filtered.reduce((counts, transaction) => {
    counts[transaction.category] = (counts[transaction.category] || 0) + 1;
    return counts;
  }, {});

  res.json({
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: "Transactions by Category",
        data: Object.values(categoryCounts),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
