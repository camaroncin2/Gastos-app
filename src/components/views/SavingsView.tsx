<<<<<<< Updated upstream
"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatCRC, getTodayStr } from "@/lib/utils";
import { Currency, CURRENCY_NAMES } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PiggyBank, Trash2, Edit3, TrendingUp, Target, Coins, ArrowUpCircle } from "lucide-react";

export default function SavingsView() {
  const { savings, addSaving, updateSaving, deleteSaving, addToSaving, convertToCRC, getTotalSavingsContributions } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [form, setForm] = useState({
    description: "", targetAmount: "", currentAmount: "0", currency: "USD" as Currency, monthlyContribution: "", startDate: getTodayStr(),
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const resetForm = () => {
    setForm({ description: "", targetAmount: "", currentAmount: "0", currency: "USD", monthlyContribution: "", startDate: getTodayStr() });
    setEditingId(null);
  };

  const totalMonthly = getTotalSavingsContributions();
  const totalSavedCRC = savings.reduce((s, sv) => s + convertToCRC(sv.currentAmount, sv.currency), 0);
  const totalTargetCRC = savings.reduce((s, sv) => s + convertToCRC(sv.targetAmount, sv.currency), 0);

  const byCurrency: Record<Currency, typeof savings> = {
    CRC: savings.filter((s) => s.currency === "CRC"),
    USD: savings.filter((s) => s.currency === "USD"),
    EUR: savings.filter((s) => s.currency === "EUR"),
  };

  const openEdit = (saving: typeof savings[0]) => {
    setEditingId(saving.id);
    setForm({
      description: saving.description, targetAmount: saving.targetAmount.toString(), currentAmount: saving.currentAmount.toString(),
      currency: saving.currency, monthlyContribution: saving.monthlyContribution.toString(), startDate: saving.startDate,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.targetAmount) return;
    const data = {
      description: form.description, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0,
      currency: form.currency, monthlyContribution: parseFloat(form.monthlyContribution) || 0, startDate: form.startDate,
    };
    if (editingId) updateSaving(editingId, data);
    else addSaving(data);
    resetForm();
    setShowModal(false);
  };

  const handleAddFunds = (id: string) => {
    const amount = parseFloat(addFundsAmount);
    if (amount > 0) { addToSaving(id, amount); setShowAddFunds(null); setAddFundsAmount(""); }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Ahorro Mensual" value={formatCRC(totalMonthly)} icon={<PiggyBank className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Total Ahorrado" value={formatCRC(totalSavedCRC)} icon={<Coins className="w-5 h-5" />} accentColor="orange" />
        <StatCard title="Meta Total" value={formatCRC(totalTargetCRC)} icon={<Target className="w-5 h-5" />} />
        <StatCard title="Progreso Global" value={`${totalTargetCRC > 0 ? Math.round((totalSavedCRC / totalTargetCRC) * 100) : 0}%`} icon={<TrendingUp className="w-5 h-5" />} accentColor="green" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Metas de Ahorro ({savings.length})</h2>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />Nueva Meta
        </motion.button>
      </div>

      {savings.length === 0 ? (
        <EmptyState icon={<PiggyBank className="w-8 h-8" />} title="Sin metas de ahorro" description="Crea metas de ahorro separadas por moneda para llevar un control proyectado a largo plazo."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Crear primera meta</motion.button>} />
      ) : (
        Object.entries(byCurrency).filter(([, items]) => items.length > 0).map(([currency, items]) => (
          <div key={currency} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ahorros en {CURRENCY_NAMES[currency as Currency]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {items.map((saving, idx) => {
                  const progress = saving.targetAmount > 0 ? (saving.currentAmount / saving.targetAmount) * 100 : 0;
                  const monthsLeft = saving.monthlyContribution > 0 ? Math.ceil((saving.targetAmount - saving.currentAmount) / saving.monthlyContribution) : null;
                  return (
                    <motion.div key={saving.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{saving.description}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Contribución: {formatCurrency(saving.monthlyContribution, saving.currency)}/mes
                            {monthsLeft !== null && monthsLeft > 0 && ` · ~${monthsLeft} meses restantes`}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${progress >= 100 ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-orange-50 dark:bg-orange-500/10 text-orange-500"}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="flex items-end justify-between mb-3">
                        <div><p className="text-xs text-gray-400">Ahorrado</p><p className="text-lg font-bold text-gray-800 dark:text-gray-100">{formatCurrency(saving.currentAmount, saving.currency)}</p></div>
                        <div className="text-right"><p className="text-xs text-gray-400">Meta</p><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{formatCurrency(saving.targetAmount, saving.currency)}</p></div>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden mb-4">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${progress >= 100 ? "bg-green-400" : "bg-orange-400"}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        {showAddFunds === saving.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input type="number" step="0.01" min="0" value={addFundsAmount} onChange={(e) => setAddFundsAmount(e.target.value)} placeholder="Monto"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" autoFocus />
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddFunds(saving.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg">Agregar</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setShowAddFunds(null); setAddFundsAmount(""); }} className="px-3 py-1.5 bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg">Cancelar</motion.button>
                          </div>
                        ) : (
                          <>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddFunds(saving.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-xl transition-colors">
                              <ArrowUpCircle className="w-3.5 h-3.5" />Agregar Fondos
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(saving)}
                              className="p-2 rounded-xl text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteSaving(saving.id)}
                              className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Meta" : "Nueva Meta de Ahorro"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Fondo de emergencia"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meta</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.targetAmount)} onChange={(e) => setForm({ ...form, targetAmount: rawNum(e.target.value) })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Moneda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                <option value="CRC">₡ Colones</option><option value="USD">$ Dólares</option><option value="EUR">€ Euros</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ahorro actual</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.currentAmount)} onChange={(e) => setForm({ ...form, currentAmount: rawNum(e.target.value) })} 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contribución mensual</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.monthlyContribution)} onChange={(e) => setForm({ ...form, monthlyContribution: rawNum(e.target.value) })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Crear Meta"}
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
import { Currency, CURRENCY_NAMES } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PiggyBank, Trash2, Edit3, TrendingUp, Target, Coins, ArrowUpCircle } from "lucide-react";

export default function SavingsView() {
  const { savings, addSaving, updateSaving, deleteSaving, addToSaving, convertToCRC, getTotalSavingsContributions } = useStore(useShallow((s) => ({
    savings: s.savings,
    addSaving: s.addSaving,
    updateSaving: s.updateSaving,
    deleteSaving: s.deleteSaving,
    addToSaving: s.addToSaving,
    convertToCRC: s.convertToCRC,
    getTotalSavingsContributions: s.getTotalSavingsContributions,
  })));
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [form, setForm] = useState({
    description: "", targetAmount: "", currentAmount: "0", currency: "USD" as Currency, monthlyContribution: "", startDate: getTodayStr(),
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const resetForm = () => {
    setForm({ description: "", targetAmount: "", currentAmount: "0", currency: "USD", monthlyContribution: "", startDate: getTodayStr() });
    setEditingId(null);
  };

  const totalMonthly = getTotalSavingsContributions();
  const totalSavedCRC = savings.reduce((s, sv) => s + convertToCRC(sv.currentAmount, sv.currency), 0);
  const totalTargetCRC = savings.reduce((s, sv) => s + convertToCRC(sv.targetAmount, sv.currency), 0);

  const byCurrency: Record<Currency, typeof savings> = {
    CRC: savings.filter((s) => s.currency === "CRC"),
    USD: savings.filter((s) => s.currency === "USD"),
    EUR: savings.filter((s) => s.currency === "EUR"),
  };

  const openEdit = (saving: typeof savings[0]) => {
    setEditingId(saving.id);
    setForm({
      description: saving.description, targetAmount: saving.targetAmount.toString(), currentAmount: saving.currentAmount.toString(),
      currency: saving.currency, monthlyContribution: saving.monthlyContribution.toString(), startDate: saving.startDate,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.targetAmount) return;
    const data = {
      description: form.description, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0,
      currency: form.currency, monthlyContribution: parseFloat(form.monthlyContribution) || 0, startDate: form.startDate,
    };
    if (editingId) updateSaving(editingId, data);
    else addSaving(data);
    resetForm();
    setShowModal(false);
  };

  const handleAddFunds = (id: string) => {
    const amount = parseFloat(addFundsAmount);
    if (amount > 0) { addToSaving(id, amount); setShowAddFunds(null); setAddFundsAmount(""); }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Ahorro Mensual" value={formatCRC(totalMonthly)} icon={<PiggyBank className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Total Ahorrado" value={formatCRC(totalSavedCRC)} icon={<Coins className="w-5 h-5" />} accentColor="orange" />
        <StatCard title="Meta Total" value={formatCRC(totalTargetCRC)} icon={<Target className="w-5 h-5" />} />
        <StatCard title="Progreso Global" value={`${totalTargetCRC > 0 ? Math.round((totalSavedCRC / totalTargetCRC) * 100) : 0}%`} icon={<TrendingUp className="w-5 h-5" />} accentColor="green" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Metas de Ahorro ({savings.length})</h2>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />Nueva Meta
        </motion.button>
      </div>

      {savings.length === 0 ? (
        <EmptyState icon={<PiggyBank className="w-8 h-8" />} title="Sin metas de ahorro" description="Crea metas de ahorro separadas por moneda para llevar un control proyectado a largo plazo."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Crear primera meta</motion.button>} />
      ) : (
        Object.entries(byCurrency).filter(([, items]) => items.length > 0).map(([currency, items]) => (
          <div key={currency} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ahorros en {CURRENCY_NAMES[currency as Currency]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {items.map((saving, idx) => {
                  const progress = saving.targetAmount > 0 ? (saving.currentAmount / saving.targetAmount) * 100 : 0;
                  const monthsLeft = saving.monthlyContribution > 0 ? Math.ceil((saving.targetAmount - saving.currentAmount) / saving.monthlyContribution) : null;
                  return (
                    <motion.div key={saving.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{saving.description}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Contribución: {formatCurrency(saving.monthlyContribution, saving.currency)}/mes
                            {monthsLeft !== null && monthsLeft > 0 && ` · ~${monthsLeft} meses restantes`}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${progress >= 100 ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-orange-50 dark:bg-orange-500/10 text-orange-500"}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="flex items-end justify-between mb-3">
                        <div><p className="text-xs text-gray-400">Ahorrado</p><p className="text-lg font-bold text-gray-800 dark:text-gray-100">{formatCurrency(saving.currentAmount, saving.currency)}</p></div>
                        <div className="text-right"><p className="text-xs text-gray-400">Meta</p><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{formatCurrency(saving.targetAmount, saving.currency)}</p></div>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden mb-4">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${progress >= 100 ? "bg-green-400" : "bg-orange-400"}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        {showAddFunds === saving.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input type="number" step="0.01" min="0" value={addFundsAmount} onChange={(e) => setAddFundsAmount(e.target.value)} placeholder="Monto"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" autoFocus />
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddFunds(saving.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg">Agregar</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setShowAddFunds(null); setAddFundsAmount(""); }} className="px-3 py-1.5 bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg">Cancelar</motion.button>
                          </div>
                        ) : (
                          <>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddFunds(saving.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-xl transition-colors">
                              <ArrowUpCircle className="w-3.5 h-3.5" />Agregar Fondos
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(saving)}
                              className="p-2 rounded-xl text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteSaving(saving.id)}
                              className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Meta" : "Nueva Meta de Ahorro"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Fondo de emergencia"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meta</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.targetAmount)} onChange={(e) => setForm({ ...form, targetAmount: rawNum(e.target.value) })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Moneda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
                <option value="CRC">₡ Colones</option><option value="USD">$ Dólares</option><option value="EUR">€ Euros</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ahorro actual</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.currentAmount)} onChange={(e) => setForm({ ...form, currentAmount: rawNum(e.target.value) })} 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contribución mensual</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.monthlyContribution)} onChange={(e) => setForm({ ...form, monthlyContribution: rawNum(e.target.value) })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Crear Meta"}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
>>>>>>> Stashed changes
