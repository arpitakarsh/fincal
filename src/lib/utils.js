export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return '₹' + Math.round(Number(amount)).toLocaleString('en-IN');
}

export function formatLakh(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1) + 'Cr';
  if (num >= 100000)   return '₹' + (num / 100000).toFixed(num % 100000 === 0 ? 0 : 1) + 'L';
  return '₹' + num.toLocaleString('en-IN');
}

export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

export function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(Number(value) * factor) / factor;
}

export function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function pctToDecimal(pct) {
  return Number(pct) / 100;
}

export function safeNumber(val) {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export function isValidPositive(val) {
  const n = Number(val);
  return !isNaN(n) && n > 0;
}