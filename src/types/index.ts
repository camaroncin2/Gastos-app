export type Currency = "CRC" | "USD" | "EUR";

// ── Display currency (what the user sees throughout the app) ──────

export type DisplayCurrencyCode =
  | "CRC" | "USD" | "EUR" | "COP" | "ARS" | "MXN" | "PEN" | "CLP" | "BRL"
  | "BOB" | "UYU" | "PYG" | "VES" | "DOP" | "GTQ" | "HNL" | "NIO" | "PAB"
  | "GBP" | "CAD" | "JPY" | "CNY";

export interface DisplayCurrency {
  code: DisplayCurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}

export const DISPLAY_CURRENCIES: DisplayCurrency[] = [
  { code: "CRC", symbol: "₡",    name: "Colón Costarricense",   flag: "🇨🇷", decimals: 0 },
  { code: "USD", symbol: "$",    name: "Dólar Estadounidense",  flag: "🇺🇸", decimals: 2 },
  { code: "EUR", symbol: "€",    name: "Euro",                  flag: "🇪🇺", decimals: 2 },
  { code: "COP", symbol: "$",    name: "Peso Colombiano",       flag: "🇨🇴", decimals: 0 },
  { code: "ARS", symbol: "$",    name: "Peso Argentino",        flag: "🇦🇷", decimals: 0 },
  { code: "MXN", symbol: "$",    name: "Peso Mexicano",         flag: "🇲🇽", decimals: 2 },
  { code: "PEN", symbol: "S/",   name: "Sol Peruano",           flag: "🇵🇪", decimals: 2 },
  { code: "CLP", symbol: "$",    name: "Peso Chileno",          flag: "🇨🇱", decimals: 0 },
  { code: "BRL", symbol: "R$",   name: "Real Brasileño",        flag: "🇧🇷", decimals: 2 },
  { code: "BOB", symbol: "Bs.",  name: "Boliviano",             flag: "🇧🇴", decimals: 2 },
  { code: "UYU", symbol: "$U",   name: "Peso Uruguayo",         flag: "🇺🇾", decimals: 2 },
  { code: "PYG", symbol: "₲",    name: "Guaraní Paraguayo",     flag: "🇵🇾", decimals: 0 },
  { code: "VES", symbol: "Bs.S", name: "Bolívar Venezolano",    flag: "🇻🇪", decimals: 2 },
  { code: "DOP", symbol: "RD$",  name: "Peso Dominicano",       flag: "🇩🇴", decimals: 2 },
  { code: "GTQ", symbol: "Q",    name: "Quetzal Guatemalteco",  flag: "🇬🇹", decimals: 2 },
  { code: "HNL", symbol: "L",    name: "Lempira Hondureño",     flag: "🇭🇳", decimals: 2 },
  { code: "NIO", symbol: "C$",   name: "Córdoba Nicaragüense",  flag: "🇳🇮", decimals: 2 },
  { code: "PAB", symbol: "B/.",  name: "Balboa Panameño",       flag: "🇵🇦", decimals: 2 },
  { code: "GBP", symbol: "£",    name: "Libra Esterlina",       flag: "🇬🇧", decimals: 2 },
  { code: "CAD", symbol: "C$",   name: "Dólar Canadiense",      flag: "🇨🇦", decimals: 2 },
  { code: "JPY", symbol: "¥",    name: "Yen Japonés",           flag: "🇯🇵", decimals: 0 },
  { code: "CNY", symbol: "¥",    name: "Yuan Chino",            flag: "🇨🇳", decimals: 2 },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CRC: "₡",
  USD: "$",
  EUR: "€",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  CRC: "Colones",
  USD: "Dólares",
  EUR: "Euros",
};

export interface Income {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  type: "salary" | "quincenal1" | "quincenal2" | "extra";
  date: string;
  recurring: boolean;
}

export type ExpenseCategory =
  | "casa"
  | "deudas_fijas"
  | "tarjeta"
  | "gasolina"
  | "personal"
  | "otros";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  casa: "Gastos de Casa",
  deudas_fijas: "Deudas Fijas",
  tarjeta: "Gastos de Tarjeta",
  gasolina: "Gasolina",
  personal: "Gastos Personales",
  otros: "Otros",
};

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  date: string;
  recurring: boolean;
  paymentDate?: string;
}

export interface Debt {
  id: string;
  description: string;
  totalAmount: number;
  currency: Currency;
  monthlyPayment: number;
  totalMonths: number;
  paidMonths: number;
  startDate: string;
  paymentDay: number;
}

export interface Saving {
  id: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  monthlyContribution: number;
  startDate: string;
}

export interface VaultEntry {
  id: string;
  name: string;
  username: string;
  encryptedPassword: string;
  encryptedPin: string;
  notes: string;
  category: string;
}

export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Loan {
  id: string;
  borrowerName: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
  payments: LoanPayment[];
}

export type BillingCycle = "weekly" | "monthly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type SubscriptionCategory =
  | "streaming"
  | "software"
  | "gaming"
  | "music"
  | "cloud"
  | "fitness"
  | "news"
  | "otros";

export const SUBSCRIPTION_CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  streaming: "Streaming",
  software: "Software",
  gaming: "Gaming",
  music: "Música",
  cloud: "Almacenamiento",
  fitness: "Fitness",
  news: "Noticias",
  otros: "Otros",
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  startDate: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  notes: string;
}

export interface MonthData {
  month: string; // YYYY-MM
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  savings: Saving[];
}
