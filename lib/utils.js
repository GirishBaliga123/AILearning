export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
}
export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
export function calculatePercentage(spent, limit) {
  if (!limit || limit === 0) return 0;
  return Math.round((spent / limit) * 100);
}
export function getBudgetStatusColor(percentage) {
  if (percentage >= 100) return 'red';
  if (percentage >= 80) return 'yellow';
  return 'green';
}
