export function currency(value, code = "VND") {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function dateTime(value) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function dateOnly(value) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
}

export function shortDateInput(value) {
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

export function percentage(current, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((current / total) * 100)));
}

export function sum(items, selector = (item) => item) {
  return items.reduce((acc, item) => acc + Number(selector(item) || 0), 0);
}

export function groupBy(items, selector) {
  return items.reduce((acc, item) => {
    const key = selector(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function bmi(heightCm, weightKg) {
  if (!heightCm || !weightKg) return 0;
  const meters = Number(heightCm) / 100;
  return Number((Number(weightKg) / (meters * meters)).toFixed(1));
}

export function bmiLabel(score) {
  if (score < 18.5) return "Thiếu cân";
  if (score < 23) return "Cân đối";
  if (score < 25) return "Hơi thừa cân";
  return "Cần kiểm soát";
}

export function uid() {
  return crypto.randomUUID();
}
