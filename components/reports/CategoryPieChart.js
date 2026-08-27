'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ chartData }) {
  if (!chartData || chartData.length === 0) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-500">No expense data to display</div>;
  }

  const data = {
    labels: chartData.map((c) => `${c.icon} ${c.name}`),
    datasets: [{
      data: chartData.map((c) => c.spent || c.total),
      backgroundColor: chartData.map((c) => c.color),
      borderColor: chartData.map((c) => c.color),
      borderWidth: 1,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } },
      tooltip: { callbacks: { label: function (context) { const value = context.parsed; const total = context.dataset.data.reduce((a, b) => a + b, 0); const percentage = Math.round((value / total) * 100); return ` \u20b9${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${percentage}%)`; } } },
    },
  };

  return <div className="h-72"><Pie data={data} options={options} /></div>;
}
