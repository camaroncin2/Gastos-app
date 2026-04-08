export type Currency = "CRC" | "USD" | "EUR";

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
