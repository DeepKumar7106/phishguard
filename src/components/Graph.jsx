import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ErrorModal from './ErrorModal';

// Register Chart.js components (required for v3/v4)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Graph = ({searchQuery}) => {
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
        const response = await fetch(`${process.env.BACKEND_ENDPOINT}/scam-history?q=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data from server.');
        }

        const result = await response.json();
        // Expected API response format: [{ date: 'Jan', reports: 4 }, { date: 'Feb', reports: 12 }]
        setApiData(result);
      } catch (err) {
        setError(err.message);
        // Fallback mock data if API isn't live yet
        setApiData([
          { date: 'Jan', reports: 2 },
          { date: 'Feb', reports: 5 },
          { date: 'Mar', reports: 1 },
          { date: 'Apr', reports: 14 },
          { date: 'May', reports: 22 },
          { date: 'Jun', reports: 38 }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchScamHistory();
  }, [searchQuery]);

  if (!searchQuery) {
    return <div className="text-gray-400 text-sm p-4">Enter a domain or email to view historical reports.</div>;
  }

  // Map API data into Chart.js format
  const chartData = {
    labels: apiData.map(item => item.date),
    datasets: [
      {
        label: 'Scam Reports',
        data: apiData.map(item => item.reports),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#ef4444',
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
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Prevents decimal counts like 1.5 scam reports
        }
      }
    }
  };

  return (
      <div className="w-full bg-white p-6 rounded-xl shadow-md border border-gray-200">
        
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Scam Reports Over Time for: <span className="text-blue-600 font-mono text-sm">{searchQuery}</span>
        </h3>
      </div>

      {loading && <div className="text-center py-10 text-gray-500">Loading historical data...</div>}
      {error && <div className="text-amber-600 text-xs mb-2">Notice:(sample data rehta) Using fallback data ({error})</div>}

      {!loading && (
        <div className="w-full h-72">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}

export default Graph