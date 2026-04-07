<<<<<<< Updated upstream
"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatCRC, getTodayStr } from "@/lib/utils";
import { Currency, ExpenseCategory, EXPENSE_CATEGORY_LABELS } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Receipt, Trash2, Edit3, Calendar,
  Home, CreditCard, Fuel, User, FileText, Tag,
} from "lucide-react";

const CATEGORY_ICONS: Record<ExpenseCategory, typeof Home> = {
  casa: Home, deudas_fijas: FileText, tarjeta: CreditCard, gasolina: Fuel, personal: User, otros: Tag,
};

export default function ExpensesView() {
  const { expenses, currentMonth, addExpense, updateExpense, deleteExpense, convertToCRC, getTotalExpenses, getExpensesByCategory } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all");
  const [form, setForm] = useState({
    description: "", amount: "", currency: "CRC" as Currency, category: "personal" as ExpenseCategory, date: getTodayStr(), recurring: false,
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const resetForm = () => {
    setForm({ description: "", amount: "", currency: "CRC", category: "personal", date: getTodayStr(), recurring: false });
    setEditingId(null);
  };

  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const filtered = filterCategory === "all" ? monthExpenses : monthExpenses.filter((e) => e.category === filterCategory);
  const totalCRC = getTotalExpenses();
  const byCategory = getExpensesByCategory();

  const openEdit = (expense: typeof expenses[0]) => {
    setEditingId(expense.id);
    setForm({ description: expense.description, amount: expense.amount.toString(), currency: expense.currency, category: expense.category, date: expense.date, recurring: expense.recurring });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const data = { description: form.description, amount: parseFloat(form.amount), currency: form.currency, category: form.category, date: form.date, recurring: form.recurring };
    if (editingId) updateExpense(editingId, data);
    else addExpense(data);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total Gastos" value={formatCRC(totalCRC)} icon={<Receipt className="w-5 h-5" />} accentColor="red" />
        <StatCard title="Gastos de Casa" value={formatCRC(byCategory.casa)} icon={<Home className="w-5 h-5" />} />
        <StatCard title="Tarjeta" value={formatCRC(byCategory.tarjeta)} icon={<CreditCard className="w-5 h-5" />} />
        <StatCard title="Personales" value={formatCRC(byCategory.personal)} icon={<User className="w-5 h-5" />} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCategory === "all" ? "bg-orange-400 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}>
            Todos
          </motion.button>
          {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
            <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCategory === cat ? "bg-orange-400 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}>
              {EXPENSE_CATEGORY_LABELS[cat]}
            </motion.button>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Agregar Gasto
        </motion.button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Receipt className="w-8 h-8" />} title="Sin gastos registrados" description="Registra tus gastos de casa, tarjeta, gasolina y más para tener un control completo."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primer gasto</motion.button>} />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((expense, idx) => {
              const Icon = CATEGORY_ICONS[expense.category];
              return (
                <motion.div key={expense.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.04 }} whileHover={{ y: -1 }}
                  className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400">{EXPENSE_CATEGORY_LABELS[expense.category]}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{expense.date}</span>
                        {expense.recurring && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-400">Recurrente</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(expense.amount, expense.currency)}</p>
                      {expense.currency !== "CRC" && <p className="text-xs text-gray-400">≈ {formatCRC(convertToCRC(expense.amount, expense.currency))}</p>}
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(expense)}
                      className="p-2 rounded-lg text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteExpense(expense.id)}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Gasto" : "Agregar Gasto"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Recibo de luz"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Monto</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.amount)} onChange={(e) => setForm({ ...form, amount: rawNum(e.target.value) })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Moneda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                <option value="CRC">₡ Colones</option>
                <option value="USD">$ Dólares</option>
                <option value="EUR">€ Euros</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-orange-400 focus:ring-orange-300" />
            <span className="text-sm text-gray-600">Gasto recurrente</span>
          </label>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar Gasto"}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
=======
"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { formatCurrency, formatCRC, getTodayStr } from "@/lib/utils";
import { Currency, ExpenseCategory, EXPENSE_CATEGORY_LABELS } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Receipt, Trash2, Edit3, Calendar,
  Home, CreditCard, Fuel, User, FileText, Tag,
} from "lucide-react";

const CATEGORY_ICONS: Record<ExpenseCategory, typeof Home> = {
  casa: Home, deudas_fijas: FileText, tarjeta: CreditCard, gasolina: Fuel, personal: User, otros: Tag,
};

export default function ExpensesView() {
  const { expenses, currentMonth, addExpense, updateExpense, deleteExpense, convertToCRC, getTotalExpenses, getExpensesByCategory } = useStore(useShallow((s) => ({
    expenses: s.expenses,
    currentMonth: s.currentMonth,
    addExpense: s.addExpense,
    updateExpense: s.updateExpense,
    deleteExpense: s.deleteExpense,
    convertToCRC: s.convertToCRC,
    getTotalExpenses: s.getTotalExpenses,
    getExpensesByCategory: s.getExpensesByCategory,
  })));
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all");
  const [form, setForm] = useState({
    description: "", amount: "", currency: "CRC" as Currency, category: "personal" as ExpenseCategory, date: getTodayStr(), recurring: false,
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const resetForm = () => {
    setForm({ description: "", amount: "", currency: "CRC", category: "personal", date: getTodayStr(), recurring: false });
    setEditingId(null);
  };

  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const filtered = filterCategory === "all" ? monthExpenses : monthExpenses.filter((e) => e.category === filterCategory);
  const totalCRC = getTotalExpenses();
  const byCategory = getExpensesByCategory();

  const openEdit = (expense: typeof expenses[0]) => {
    setEditingId(expense.id);
    setForm({ description: expense.description, amount: expense.amount.toString(), currency: expense.currency, category: expense.category, date: expense.date, recurring: expense.recurring });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const data = { description: form.description, amount: parseFloat(form.amount), currency: form.currency, category: form.category, date: form.date, recurring: form.recurring };
    if (editingId) updateExpense(editingId, data);
    else addExpense(data);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total Gastos" value={formatCRC(totalCRC)} icon={<Receipt className="w-5 h-5" />} accentColor="red" />
        <StatCard title="Gastos de Casa" value={formatCRC(byCategory.casa)} icon={<Home className="w-5 h-5" />} />
        <StatCard title="Tarjeta" value={formatCRC(byCategory.tarjeta)} icon={<CreditCard className="w-5 h-5" />} />
        <StatCard title="Personales" value={formatCRC(byCategory.personal)} icon={<User className="w-5 h-5" />} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCategory === "all" ? "bg-orange-400 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}>
            Todos
          </motion.button>
          {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
            <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCategory === cat ? "bg-orange-400 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}>
              {EXPENSE_CATEGORY_LABELS[cat]}
            </motion.button>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Agregar Gasto
        </motion.button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Receipt className="w-8 h-8" />} title="Sin gastos registrados" description="Registra tus gastos de casa, tarjeta, gasolina y más para tener un control completo."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primer gasto</motion.button>} />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((expense, idx) => {
              const Icon = CATEGORY_ICONS[expense.category];
              return (
                <motion.div key={expense.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.04 }} whileHover={{ y: -1 }}
                  className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400">{EXPENSE_CATEGORY_LABELS[expense.category]}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{expense.date}</span>
                        {expense.recurring && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-400">Recurrente</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(expense.amount, expense.currency)}</p>
                      {expense.currency !== "CRC" && <p className="text-xs text-gray-400">≈ {formatCRC(convertToCRC(expense.amount, expense.currency))}</p>}
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(expense)}
                      className="p-2 rounded-lg text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteExpense(expense.id)}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Gasto" : "Agregar Gasto"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Recibo de luz"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Monto</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.amount)} onChange={(e) => setForm({ ...form, amount: rawNum(e.target.value) })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Moneda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                <option value="CRC">₡ Colones</option>
                <option value="USD">$ Dólares</option>
                <option value="EUR">€ Euros</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-orange-400 focus:ring-orange-300" />
            <span className="text-sm text-gray-600">Gasto recurrente</span>
          </label>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar Gasto"}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
>>>>>>> Stashed changes
