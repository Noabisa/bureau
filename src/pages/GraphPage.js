import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraphPage = () => {
  // UseRef hook for the chart component
  const chartRef = useRef(null);

  useEffect(() => {
    // Capture the ref value into a local variable to avoid changes during cleanup
    const chartInstance = chartRef.current;

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May'],  // Labels for x-axis
    datasets: [
      {
        label: 'Credit Score',
        data: [650, 700, 750, 800, 850], // Example data points for the chart
        fill: false,
        borderColor: 'rgb(75, 192, 192)', // Line color
        tension: 0.1  // Curvature of the line
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Credit Score Trend' // Title of the chart
      }
    }
  };

  return (
    <div className="graph-page">
      <div className="content-card">
        <h2 className="page-title">Credit Score Trend</h2>
        <div className="chart-container">
          <Line ref={chartRef} data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
