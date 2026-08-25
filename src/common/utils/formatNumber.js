export function formatOneDecimal(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "정보 없음";

  return String(Number(number.toFixed(1)));
}
