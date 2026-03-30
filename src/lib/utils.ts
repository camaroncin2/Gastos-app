import { Currency, CURRENCY_SYMBOLS } from "@/types";

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: currency === "CRC" ? 0 : 2,
    maximumFractionDigits: currency === "CRC" ? 0 : 2,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function formatCRC(amount: number): string {
  return formatCurrency(amount, "CRC");
}

export function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
}

export function getCurrentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}
