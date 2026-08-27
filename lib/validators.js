export function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
export function validatePassword(password) { return password && password.length >= 8; }
export function validateAmount(amount) { const n = parseFloat(amount); return !isNaN(n) && n > 0; }
export function validateRequired(value) { return value !== null && value !== undefined && value.toString().trim() !== ''; }
export function validateDayOfMonth(day) { const n = parseInt(day); return !isNaN(n) && n >= 1 && n <= 28; }
