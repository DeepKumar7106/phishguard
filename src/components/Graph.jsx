import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import ErrorModal from "./ErrorModal";

// Register Chart.js components (required for v3/v4)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Graph = ({ searchQuery }) => {
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchQuery) return;

    async function fetchScamHistory() {
      setLoading(true);
      setError(null);

      try {
        // Replace with your FastAPI backend endpoint
        // ***
        const response = await fetch(
          `${process.env.BACKEND_ENDPOINT}/scam-history?q=${encodeURIComponent(searchQuery)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch historical data from server.");
        }

        const result = await response.json();
        // Expected API response format: [{ date: 'Jan', reports: 4 }, { date: 'Feb', reports: 12 }]
        setApiData(result);
      } catch (err) {
        setError(err.message);
        // Fallback mock data if API isn't live yet
        setApiData([
          { date: "Jan", reports: 2 },
          { date: "Feb", reports: 5 },
          { date: "Mar", reports: 1 },
          { date: "Apr", reports: 14 },
          { date: "May", reports: 22 },
          { date: "Jun", reports: 38 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchScamHistory();
  }, [searchQuery]);

  if (!searchQuery) {
    return (
      <div className="p-4 text-sm text-white/70">
        Enter a domain or email to view historical reports.
      </div>
    );
  }

  // Map API data into Chart.js format
  const chartData = {
    labels: apiData.map((item) => item.date),
    datasets: [
      {
        label: "Scam Reports",
        data: apiData.map((item) => item.reports),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#ef4444",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#ffffff",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.12)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.12)",
        },
      },
    },
  };

  return (
    <div className="w-full rounded-[28px] border border-white/30 bg-white/20 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          Scam Reports Over Time for:{" "}
          <span className="font-mono text-sm text-blue-200">{searchQuery}</span>
        </h3>
      </div>

      {loading && (
        <div className="py-10 text-center text-white/80">
          Loading historical data...
        </div>
      )}
      {error && (
        <div className="mb-2 text-xs text-amber-200">
          Notice:(sample data rehta) Using fallback data ({error})
        </div>
      )}

      {!loading && (
        <div className="h-72 w-full rounded-2xl border border-white/40 bg-white/15 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(148,163,184,0.12)]">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default Graph;
