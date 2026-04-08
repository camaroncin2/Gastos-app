import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  Income,
  Expense,
  Debt,
  Saving,
  VaultEntry,
  Loan,
  LoanPayment,
  Currency,
  ExpenseCategory,
  Subscription,
} from "@/types";

interface ExchangeRates {
  USD_TO_CRC: number;
  EUR_TO_CRC: number;
}

interface AppState {
  _ready: boolean;
  currentMonth: string;
  darkMode: boolean;
  userName: string;
  vaultPin: string;
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  savings: Saving[];
  vault: VaultEntry[];
  loans: Loan[];
  subscriptions: Subscription[];
  vaultUnlocked: boolean;
  exchangeRates: ExchangeRates;
  lastRatesUpdate: string | null;
  dismissedNotifications: string[];

  // Actions
  setCurrentMonth: (month: string) => void;
  toggleDarkMode: () => void;
  setUserName: (name: string) => void;
  setVaultPin: (pin: string) => void;
  dismissNotification: (id: string) => void;
  clearDismissedNotifications: () => void;
  setExchangeRates: (rates: ExchangeRates) => void;
  generateRecurring: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;

  // Income
  addIncome: (income: Omit<Income, "id">) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // Expenses
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Debts
  addDebt: (debt: Omit<Debt, "id">) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  makeDebtPayment: (id: string) => void;

  // Savings
  addSaving: (saving: Omit<Saving, "id">) => void;
  updateSaving: (id: string, saving: Partial<Saving>) => void;
  deleteSaving: (id: string) => void;
  addToSaving: (id: string, amount: number) => void;

  // Loans
  addLoan: (loan: Omit<Loan, "id" | "payments">) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addLoanPayment: (loanId: string, payment: Omit<LoanPayment, "id">) => void;
  deleteLoanPayment: (loanId: string, paymentId: string) => void;

  // Subscriptions
  addSubscription: (subscription: Omit<Subscription, "id">) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  // Vault
  addVaultEntry: (entry: Omit<VaultEntry, "id">) => void;
  updateVaultEntry: (id: string, entry: Partial<VaultEntry>) => void;
  deleteVaultEntry: (id: string) => void;
  setVaultUnlocked: (unlocked: boolean) => void;

  // Computed
  convertToCRC: (amount: number, currency: Currency) => number;
  getTotalIncomes: () => number;
  getTotalExpenses: () => number;
  getTotalDebtPayments: () => number;
  getTotalSavingsContributions: () => number;
  getRemainingBalance: () => number;
  getExpensesByCategory: () => Record<ExpenseCategory, number>;
}

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const useStore = create<AppState>()(
  (set, get) => ({
    _ready: false,
    currentMonth: getCurrentMonth(),
    darkMode: false,
    userName: "Usuario",
    vaultPin: "1234",
    incomes: [],
    expenses: [],
    debts: [],
    savings: [],
    vault: [],
    loans: [],
    subscriptions: [],
    vaultUnlocked: false,
    exchangeRates: {
      USD_TO_CRC: 510,
      EUR_TO_CRC: 555,
    },
    lastRatesUpdate: null,
    dismissedNotifications: [],

      setCurrentMonth: (month) => set({ currentMonth: month }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setUserName: (name) => set({ userName: name }),
      setVaultPin: (pin) => set({ vaultPin: pin }),
      setExchangeRates: (rates) => set({ exchangeRates: rates, lastRatesUpdate: new Date().toISOString() }),
      dismissNotification: (id) =>
        set((state) => ({
          dismissedNotifications: [...state.dismissedNotifications, id],
        })),
      clearDismissedNotifications: () => set({ dismissedNotifications: [] }),

      generateRecurring: () => {
        const state = get();
        const month = state.currentMonth;
        // Clone recurring incomes that don't exist yet this month
        const existingIncomeDescs = state.incomes
          .filter((i) => i.date.startsWith(month))
          .map((i) => `${i.description}__${i.type}`);
        const recurringIncomes = state.incomes.filter(
          (i) => i.recurring && !i.date.startsWith(month)
        );
        const newIncomes = recurringIncomes
          .filter((i) => !existingIncomeDescs.includes(`${i.description}__${i.type}`))
          .map((i) => ({
            ...i,
            id: uuidv4(),
            date: `${month}-${i.date.split("-")[2] || "01"}`,
          }));

        // Clone recurring expenses that don't exist yet this month
        const existingExpenseDescs = state.expenses
          .filter((e) => e.date.startsWith(month))
          .map((e) => `${e.description}__${e.category}`);
        const recurringExpenses = state.expenses.filter(
          (e) => e.recurring && !e.date.startsWith(month)
        );
        const newExpenses = recurringExpenses
          .filter((e) => !existingExpenseDescs.includes(`${e.description}__${e.category}`))
          .map((e) => ({
            ...e,
            id: uuidv4(),
            date: `${month}-${e.date.split("-")[2] || "01"}`,
          }));

        if (newIncomes.length > 0 || newExpenses.length > 0) {
          set((s) => ({
            incomes: [...s.incomes, ...newIncomes],
            expenses: [...s.expenses, ...newExpenses],
          }));
        }
      },

      exportData: () => {
        const state = get();
        const data = {
          incomes: state.incomes,
          expenses: state.expenses,
          debts: state.debts,
          savings: state.savings,
          vault: state.vault,
          loans: state.loans,
          subscriptions: state.subscriptions,
          exchangeRates: state.exchangeRates,
          userName: state.userName,
          vaultPin: state.vaultPin,
          darkMode: state.darkMode,
        };
        return JSON.stringify(data, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data || typeof data !== "object") return false;
          const update: Partial<AppState> = {};
          if (Array.isArray(data.incomes)) update.incomes = data.incomes;
          if (Array.isArray(data.expenses)) update.expenses = data.expenses;
          if (Array.isArray(data.debts)) update.debts = data.debts;
          if (Array.isArray(data.savings)) update.savings = data.savings;
          if (Array.isArray(data.vault)) update.vault = data.vault;
          if (Array.isArray(data.loans)) update.loans = data.loans;
          if (Array.isArray(data.subscriptions)) update.subscriptions = data.subscriptions;
          if (data.exchangeRates) update.exchangeRates = data.exchangeRates;
          if (data.userName) update.userName = data.userName;
          if (data.vaultPin) update.vaultPin = data.vaultPin;
          if (typeof data.darkMode === "boolean") update.darkMode = data.darkMode;
          set(update);
          return true;
        } catch {
          return false;
        }
      },

      // Income actions
      addIncome: (income) =>
        set((state) => ({
          incomes: [...state.incomes, { ...income, id: uuidv4() }],
        })),
      updateIncome: (id, income) =>
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, ...income } : i
          ),
        })),
      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),

      // Expense actions
      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: uuidv4() }],
        })),
      updateExpense: (id, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expense } : e
          ),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      // Debt actions
      addDebt: (debt) =>
        set((state) => ({
          debts: [...state.debts, { ...debt, id: uuidv4() }],
        })),
      updateDebt: (id, debt) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, ...debt } : d
          ),
        })),
      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),
      makeDebtPayment: (id) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id && d.paidMonths < d.totalMonths
              ? { ...d, paidMonths: d.paidMonths + 1 }
              : d
          ),
        })),

      // Savings actions
      addSaving: (saving) =>
        set((state) => ({
          savings: [...state.savings, { ...saving, id: uuidv4() }],
        })),
      updateSaving: (id, saving) =>
        set((state) => ({
          savings: state.savings.map((s) =>
            s.id === id ? { ...s, ...saving } : s
          ),
        })),
      deleteSaving: (id) =>
        set((state) => ({
          savings: state.savings.filter((s) => s.id !== id),
        })),
      addToSaving: (id, amount) =>
        set((state) => ({
          savings: state.savings.map((s) =>
            s.id === id
              ? { ...s, currentAmount: s.currentAmount + amount }
              : s
          ),
        })),

      // Loan actions
      addLoan: (loan) =>
        set((state) => ({
          loans: [...state.loans, { ...loan, id: uuidv4(), payments: [] }],
        })),
      updateLoan: (id, loan) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === id ? { ...l, ...loan } : l
          ),
        })),
      deleteLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter((l) => l.id !== id),
        })),
      addLoanPayment: (loanId, payment) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === loanId
              ? { ...l, payments: [...l.payments, { ...payment, id: uuidv4() }] }
              : l
          ),
        })),
      deleteLoanPayment: (loanId, paymentId) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === loanId
              ? { ...l, payments: l.payments.filter((p) => p.id !== paymentId) }
              : l
          ),
        })),

      // Subscription actions
      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, { ...subscription, id: uuidv4() }],
        })),
      updateSubscription: (id, subscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...subscription } : s
          ),
        })),
      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),

      // Vault actions
      addVaultEntry: (entry) =>
        set((state) => ({
          vault: [...state.vault, { ...entry, id: uuidv4() }],
        })),
      updateVaultEntry: (id, entry) =>
        set((state) => ({
          vault: state.vault.map((v) =>
            v.id === id ? { ...v, ...entry } : v
          ),
        })),
      deleteVaultEntry: (id) =>
        set((state) => ({
          vault: state.vault.filter((v) => v.id !== id),
        })),
      setVaultUnlocked: (unlocked) => set({ vaultUnlocked: unlocked }),

      // Computed helpers
      convertToCRC: (amount, currency) => {
        const { exchangeRates } = get();
        switch (currency) {
          case "USD":
            return amount * exchangeRates.USD_TO_CRC;
          case "EUR":
            return amount * exchangeRates.EUR_TO_CRC;
          default:
            return amount;
        }
      },

      getTotalIncomes: () => {
        const state = get();
        const monthIncomes = state.incomes.filter((i) =>
          i.date.startsWith(state.currentMonth)
        );
        return monthIncomes.reduce(
          (sum, i) => sum + state.convertToCRC(i.amount, i.currency),
          0
        );
      },

      getTotalExpenses: () => {
        const state = get();
        const monthExpenses = state.expenses.filter((e) =>
          e.date.startsWith(state.currentMonth)
        );
        return monthExpenses.reduce(
          (sum, e) => sum + state.convertToCRC(e.amount, e.currency),
          0
        );
      },

      getTotalDebtPayments: () => {
        const state = get();
        return state.debts
          .filter((d) => d.paidMonths < d.totalMonths)
          .reduce(
            (sum, d) =>
              sum + state.convertToCRC(d.monthlyPayment, d.currency),
            0
          );
      },

      getTotalSavingsContributions: () => {
        const state = get();
        return state.savings.reduce(
          (sum, s) =>
            sum + state.convertToCRC(s.monthlyContribution, s.currency),
          0
        );
      },

      getRemainingBalance: () => {
        const state = get();
        return (
          state.getTotalIncomes() -
          state.getTotalExpenses() -
          state.getTotalDebtPayments() -
          state.getTotalSavingsContributions()
        );
      },

      getExpensesByCategory: () => {
        const state = get();
        const monthExpenses = state.expenses.filter((e) =>
          e.date.startsWith(state.currentMonth)
        );
        const categories: Record<ExpenseCategory, number> = {
          casa: 0,
          deudas_fijas: 0,
          tarjeta: 0,
          gasolina: 0,
          personal: 0,
          otros: 0,
        };
        monthExpenses.forEach((e) => {
          categories[e.category] += state.convertToCRC(e.amount, e.currency);
        });
        return categories;
      },
    })
);

// --- Backend-only sync: no localStorage ---

type Persistable = Omit<AppState, "_ready" | keyof ReturnType<typeof Object.getOwnPropertyNames>>;

const PERSIST_KEYS: (keyof AppState)[] = [
  "currentMonth", "darkMode", "userName", "vaultPin",
  "incomes", "expenses", "debts", "savings", "vault", "loans", "subscriptions",
  "vaultUnlocked", "exchangeRates", "lastRatesUpdate", "dismissedNotifications",
];

function getSnapshot(): Record<string, unknown> {
  const state = useStore.getState();
  const snap: Record<string, unknown> = {};
  for (const k of PERSIST_KEYS) {
    snap[k] = state[k];
  }
  return snap;
}

let _saveTimeout: ReturnType<typeof setTimeout> | null = null;
let _pulling = false;
let _pollInterval: ReturnType<typeof setInterval> | null = null;
let _lastSavedJSON = "";

function saveToServer() {
  if (_pulling) return;
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => {
    const json = JSON.stringify(getSnapshot());
    if (json === _lastSavedJSON) return; // nothing changed
    _lastSavedJSON = json;
    fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
    }).catch(() => {});
  }, 300);
}

function loadFromServer() {
  return fetch("/api/data")
    .then((r) => r.text())
    .then((text) => {
      if (!text || text === "null" || text.trim() === "") return;
      if (text === _lastSavedJSON) return; // identical to what we last saved
      _lastSavedJSON = text;
      try {
        const data = JSON.parse(text);
        if (!data || typeof data !== "object") return;
        _pulling = true;
        const update: Partial<AppState> = {};
        for (const k of PERSIST_KEYS) {
          if (k in data) {
            (update as Record<string, unknown>)[k] = data[k];
          }
        }
        useStore.setState(update);
        setTimeout(() => { _pulling = false; }, 300);
      } catch { /* ignore bad JSON */ }
    })
    .catch(() => {});
}

if (typeof window !== "undefined") {
  // Initial load from server
  loadFromServer().finally(() => {
    useStore.setState({ _ready: true });
  });

  // Poll every 5 seconds
  _pollInterval = setInterval(() => {
    if (document.visibilityState === "visible") {
      loadFromServer();
    }
  }, 5000);

  // Immediate load when returning to tab
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      loadFromServer();
    }
  });

  // Save on every change
  useStore.subscribe(() => {
    if (useStore.getState()._ready) {
      saveToServer();
    }
  });
}
