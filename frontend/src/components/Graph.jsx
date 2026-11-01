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
import { getScamHistory } from "../api";

// Register Chart.js components
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
  const [historyData, setHistoryData] = useState({ totalReports: 0, timeSeries: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery) return;

    let isMounted = true;
    async function fetchHistory() {
      setLoading(true);
      try {
        const result = await getScamHistory(searchQuery);
        if (isMounted) {
          setHistoryData(result || { totalReports: 0, timeSeries: [] });
        }
      } catch (err) {
        console.warn("[graph] History fetch failed:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const targetLabel = searchQuery || "No Target Selected";
  const timeSeries = historyData.timeSeries || [];

  // Generate chart data from backend timeSeries or default baseline
  const labels = timeSeries.length > 0
    ? timeSeries.map((item) => item.date)
    : ["Day 1", "Day 2", "Day 3", "Today"];

  const dataPoints = timeSeries.length > 0
    ? timeSeries.map((item) => item.count)
    : [0, 0, 0, historyData.totalReports || 0];

  const chartData = {
    labels,
    datasets: [
      {
        label: `Reports for ${targetLabel}`,
        data: dataPoints,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
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
          color: "#334155",
          font: { family: "Lexend, sans-serif", size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(203, 213, 225, 0.4)" },
        ticks: {
          stepSize: 1,
          color: "#64748b",
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="w-full rounded-2xl bg-[#ebf1f4] p-5 shadow-[6px_6px_14px_rgba(163,177,198,0.2),-6px_-6px_14px_rgba(255,255,255,0.9)] border border-white/40 font-lexend">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📈</span> Historical Scam Reports Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Target: <span className="font-semibold text-slate-700">{targetLabel}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-slate-700 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
            Total Reports: <strong>{historyData.totalReports || 0}</strong>
          </span>
        </div>
      </div>

      <div className="h-64 w-full bg-white/50 rounded-xl p-3 border border-white/70">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            Loading historical data...
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default Graph;
