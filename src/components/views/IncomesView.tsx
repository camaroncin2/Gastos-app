<<<<<<< Updated upstream
"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatCRC, getTodayStr } from "@/lib/utils";
import { Currency } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Wallet,
  Trash2,
  Edit3,
  DollarSign,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpDown,
} from "lucide-react";

const INCOME_TYPE_LABELS: Record<string, string> = {
  salary: "Salario Base",
  quincenal1: "Quincena 1",
  quincenal2: "Quincena 2",
  extra: "Ingreso Extra",
};

type SortKey = "date" | "amount" | "type";
type FilterType = "all" | "salary" | "quincenal1" | "quincenal2" | "extra";

export default function IncomesView() {
  const {
    incomes,
    currentMonth,
    addIncome,
    updateIncome,
    deleteIncome,
    convertToCRC,
    getTotalIncomes,
  } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: "CRC" as Currency,
    type: "salary" as "salary" | "quincenal1" | "quincenal2" | "extra",
    date: getTodayStr(),
    recurring: false,
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const resetForm = () => {
    setForm({ description: "", amount: "", currency: "CRC", type: "salary", date: getTodayStr(), recurring: false });
    setEditingId(null);
  };

  const monthIncomes = incomes.filter((i) => i.date.startsWith(currentMonth));
  const totalCRC = getTotalIncomes();

  const q1 = monthIncomes
    .filter((i) => i.type === "quincenal1" || i.type === "salary")
    .reduce((s, i) => s + convertToCRC(i.amount, i.currency), 0);
  const q2 = monthIncomes
    .filter((i) => i.type === "quincenal2")
    .reduce((s, i) => s + convertToCRC(i.amount, i.currency), 0);
  const extras = monthIncomes
    .filter((i) => i.type === "extra")
    .reduce((s, i) => s + convertToCRC(i.amount, i.currency), 0);

  const filtered = filterType === "all" ? monthIncomes : monthIncomes.filter((i) => i.type === filterType);
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "date") cmp = a.date.localeCompare(b.date);
    else if (sortKey === "amount") cmp = convertToCRC(a.amount, a.currency) - convertToCRC(b.amount, b.currency);
    else cmp = a.type.localeCompare(b.type);
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const openEdit = (income: typeof incomes[0]) => {
    setEditingId(income.id);
    setForm({ description: income.description, amount: income.amount.toString(), currency: income.currency, type: income.type, date: income.date, recurring: income.recurring });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const data = { description: form.description, amount: parseFloat(form.amount), currency: form.currency, type: form.type, date: form.date, recurring: form.recurring };
    if (editingId) updateIncome(editingId, data);
    else addIncome(data);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total Ingresos" value={formatCRC(totalCRC)} icon={<Wallet className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Quincena 1 / Salario" value={formatCRC(q1)} icon={<ArrowDownRight className="w-5 h-5" />} />
        <StatCard title="Quincena 2" value={formatCRC(q2)} icon={<ArrowUpRight className="w-5 h-5" />} />
        <StatCard title="Extras" value={formatCRC(extras)} icon={<DollarSign className="w-5 h-5" />} accentColor="orange" />
      </div>

      {/* Filters & sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "salary", "quincenal1", "quincenal2", "extra"] as FilterType[]).map((t) => (
            <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === t ? "bg-orange-400 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}>
              {t === "all" ? "Todos" : INCOME_TYPE_LABELS[t]}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(["date", "amount", "type"] as SortKey[]).map((k) => (
            <button key={k} onClick={() => handleSort(k)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${sortKey === k ? "bg-orange-100 dark:bg-orange-500/20 text-orange-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
              <ArrowUpDown className="w-2.5 h-2.5" />
              {k === "date" ? "Fecha" : k === "amount" ? "Monto" : "Tipo"}
            </button>
          ))}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            Agregar
          </motion.button>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <EmptyState icon={<Wallet className="w-8 h-8" />} title="Sin ingresos registrados" description="Agrega tu salario, quincenas o ingresos extras para comenzar a gestionar tus finanzas."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primer ingreso</motion.button>} />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map((income, idx) => (
              <motion.div key={income.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -1 }}
                className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{income.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400">{INCOME_TYPE_LABELS[income.type]}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{income.date}</span>
                      {income.recurring && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-400">Recurrente</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(income.amount, income.currency)}</p>
                    {income.currency !== "CRC" && <p className="text-xs text-gray-400">≈ {formatCRC(convertToCRC(income.amount, income.currency))}</p>}
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(income)}
                    className="p-2 rounded-lg text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteIncome(income.id)}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Ingreso" : "Agregar Ingreso"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Salario mensual"
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                <option value="salary">Salario Base</option>
                <option value="quincenal1">Quincena 1</option>
                <option value="quincenal2">Quincena 2</option>
                <option value="extra">Ingreso Extra</option>
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
            <span className="text-sm text-gray-600">Ingreso recurrente</span>
          </label>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar Ingreso"}
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
import { Currency } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Wallet,
  Trash2,
  Edit3,
  DollarSign,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  ArrowUpDown,
} from "lucide-react";

const INCOME_TYPE_LABELS: Record<string, string> = {
  salary: "Salario Base",
  quincenal1: "Quincena 1",
  quincenal2: "Quincena 2",
  extra: "Ingreso Extra",
};

type SortKey = "date" | "amount" | "type";
type FilterType = "all" | "salary" | "quincenal1" | "quincenal2" | "extra";

export default function IncomesView() {
  const {
    incomes,
    currentMonth,
    addIncome,
    updateIncome,
    deleteIncome,
    convertToCRC,
    getTotalIncomes,
  } = useStore(useShallow((s) => ({
    incomes: s.incomes,
    currentMonth: s.currentMonth,
    addIncome: s.addIncome,
    updateIncome: s.updateIncome,
    deleteIncome: s.deleteIncome,
    convertToCRC: s.convertToCRC,
    getTotalIncomes: s.getTotalIncomes,
  })));
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: "CRC" as Currency,
    type: "salary" as "salary" | "quincenal1" | "quincenal2" | "extra",
    date: getTodayStr(),
    recurring: false,
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const resetForm = () => {
    setForm({ description: "", amount: "", currency: "CRC", type: "salary", date: getTodayStr(), recurring: false });
    setEditingId(null);
  };

  const monthIncomes = incomes.filter((i) => i.date.startsWith(currentMonth));
  const totalCRC = getTotalIncomes();

  const q1 = monthIncomes
    .filter((i) => i.type === "quincenal1" || i.type === "salary")
    .reduce((s, i) => s + convertToCRC(i.amount, i.currency), 0);
  const q2 = monthIncomes
    .filter((i) => i.type === "quincenal2")
    .reduce((s, i) => s + convertToCRC(i.amount, i.currency), 0);
  const extras = monthIncomes
    .filter((i) => i.type === "extra")
    .reduce((s, i) => s + convertToCRC(i.amount, i.currency), 0);

  const filtered = filterType === "all" ? monthIncomes : monthIncomes.filter((i) => i.type === filterType);
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "date") cmp = a.date.localeCompare(b.date);
    else if (sortKey === "amount") cmp = convertToCRC(a.amount, a.currency) - convertToCRC(b.amount, b.currency);
    else cmp = a.type.localeCompare(b.type);
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const openEdit = (income: typeof incomes[0]) => {
    setEditingId(income.id);
    setForm({ description: income.description, amount: income.amount.toString(), currency: income.currency, type: income.type, date: income.date, recurring: income.recurring });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const data = { description: form.description, amount: parseFloat(form.amount), currency: form.currency, type: form.type, date: form.date, recurring: form.recurring };
    if (editingId) updateIncome(editingId, data);
    else addIncome(data);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total Ingresos" value={formatCRC(totalCRC)} icon={<Wallet className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Quincena 1 / Salario" value={formatCRC(q1)} icon={<ArrowDownRight className="w-5 h-5" />} />
        <StatCard title="Quincena 2" value={formatCRC(q2)} icon={<ArrowUpRight className="w-5 h-5" />} />
        <StatCard title="Extras" value={formatCRC(extras)} icon={<DollarSign className="w-5 h-5" />} accentColor="orange" />
      </div>

      {/* Filters & sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "salary", "quincenal1", "quincenal2", "extra"] as FilterType[]).map((t) => (
            <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === t ? "bg-orange-400 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}>
              {t === "all" ? "Todos" : INCOME_TYPE_LABELS[t]}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(["date", "amount", "type"] as SortKey[]).map((k) => (
            <button key={k} onClick={() => handleSort(k)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${sortKey === k ? "bg-orange-100 dark:bg-orange-500/20 text-orange-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
              <ArrowUpDown className="w-2.5 h-2.5" />
              {k === "date" ? "Fecha" : k === "amount" ? "Monto" : "Tipo"}
            </button>
          ))}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            Agregar
          </motion.button>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <EmptyState icon={<Wallet className="w-8 h-8" />} title="Sin ingresos registrados" description="Agrega tu salario, quincenas o ingresos extras para comenzar a gestionar tus finanzas."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primer ingreso</motion.button>} />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map((income, idx) => (
              <motion.div key={income.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -1 }}
                className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{income.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400">{INCOME_TYPE_LABELS[income.type]}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{income.date}</span>
                      {income.recurring && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-400">Recurrente</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(income.amount, income.currency)}</p>
                    {income.currency !== "CRC" && <p className="text-xs text-gray-400">≈ {formatCRC(convertToCRC(income.amount, income.currency))}</p>}
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(income)}
                    className="p-2 rounded-lg text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteIncome(income.id)}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Ingreso" : "Agregar Ingreso"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Salario mensual"
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                <option value="salary">Salario Base</option>
                <option value="quincenal1">Quincena 1</option>
                <option value="quincenal2">Quincena 2</option>
                <option value="extra">Ingreso Extra</option>
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
            <span className="text-sm text-gray-600">Ingreso recurrente</span>
          </label>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar Ingreso"}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
>>>>>>> Stashed changes
