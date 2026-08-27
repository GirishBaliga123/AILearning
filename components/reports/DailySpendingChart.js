'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function DailySpendingChart({ dailyData }) {
  if (!dailyData || dailyData.length === 0) return <div className="flex items-center justify-center h-64 text-sm text-gray-500">No data available</div>;

  const data = {
    labels: dailyData.map((d) => d.day.toString()),
    datasets: [{ label: 'Daily Spending', data: dailyData.map((d) => d.amount), borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 2, pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: 'rgb(59, 130, 246)', tension: 0.3, fill: true }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { title: (ctx) => `Day ${ctx[0].label}`, label: (ctx) => `Spent: \u20b9${ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `\u20b9${v.toLocaleString('en-IN')}` }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { title: { display: true, text: 'Day of Month', font: { size: 11 } }, grid: { display: false } } },
  };

  return <div className="h-64"><Line data={data} options={options} /></div>;
}
