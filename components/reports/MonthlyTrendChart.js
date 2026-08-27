'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function MonthlyTrendChart({ trendData }) {
  if (!trendData || trendData.length === 0) return <div className="flex items-center justify-center h-64 text-sm text-gray-500">No data available</div>;

  const data = {
    labels: trendData.map((d) => d.label),
    datasets: [
      { label: 'Expenses', data: trendData.map((d) => d.expenses), backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: 'rgb(239, 68, 68)', borderWidth: 1, borderRadius: 4 },
      { label: 'Income', data: trendData.map((d) => d.income), backgroundColor: 'rgba(34, 197, 94, 0.7)', borderColor: 'rgb(34, 197, 94)', borderWidth: 1, borderRadius: 4 },
    ],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'rect', font: { size: 12 } } }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: \u20b9${ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `\u20b9${v.toLocaleString('en-IN')}` }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } },
  };

  return <div className="h-72"><Bar data={data} options={options} /></div>;
}
