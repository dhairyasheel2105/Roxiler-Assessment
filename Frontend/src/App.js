import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./styles.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState("March");
  const [search, setSearch] = useState("");
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchData();
    fetchStatistics();
    fetchBarChartData();
    fetchPieChartData();
  }, [month, pagination.page, search]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions", {
        params: {
          month,
          search,
          page: pagination.page,
          perPage: pagination.perPage,
        },
      });
      setTransactions(res.data || []);
    } catch (error) {
      console.error("Error fetching transactions data", error);
      setTransactions([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/statistics", {
        params: { month },
      });
      setStatistics(res.data || {});
    } catch (error) {
      console.error("Error fetching statistics", error);
      setStatistics({});
    }
  };

  const fetchBarChartData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bar-chart", {
        params: { month },
      });
      setBarChartData(res.data || {});
    } catch (error) {
      console.error("Error fetching bar chart data", error);
      setBarChartData({});
    }
  };

  const fetchPieChartData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/pie-chart", {
        params: { month },
      });
      setPieChartData(res.data || {});
    } catch (error) {
      console.error("Error fetching pie chart data", error);
      setPieChartData({});
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset page to 1 when month changes
    }));
  };

  const handlePagination = (direction) => {
    setPagination((prev) => ({
      ...prev,
      page: direction === "next" ? prev.page + 1 : prev.page - 1,
    }));
  };

  return (
    <div className="App">
      <h1>Transaction Dashboard</h1>

      <div className="filters">
        <select value={month} onChange={handleMonthChange}>
          {months.map((month, index) => (
            <option key={index} value={month}>
              {month}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search Transactions"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="statistics">
        <div>Total Sale: {statistics.totalSale || 0}</div>
        <div>Total Sold Items: {statistics.soldItems || 0}</div>
        <div>Total Not Sold Items: {statistics.notSoldItems || 0}</div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.title}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.price}</td>
                  <td>{transaction.dateOfSale}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No transactions available</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button
            onClick={() => handlePagination("previous")}
            disabled={pagination.page === 1}
          >
            Previous
          </button>

          <span className="page-number">Page {pagination.page}</span>

          <button onClick={() => handlePagination("next")}>Next</button>
        </div>
      </div>

      <div className="charts">
        <div className="bar-chart">
          <h3>Price Range Distribution</h3>
          {barChartData.datasets ? (
            <Bar data={barChartData} />
          ) : (
            <p>Loading bar chart...</p>
          )}
        </div>

        <div className="pie-chart">
          <h3>Category Distribution</h3>
          {pieChartData.datasets ? (
            <Pie data={pieChartData} />
          ) : (
            <p>Loading pie chart...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
