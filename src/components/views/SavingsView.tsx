"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { formatCurrency, getTodayStr } from "@/lib/utils";
import { Currency, CURRENCY_NAMES } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PiggyBank, Trash2, Edit3, TrendingUp, Target, Coins, ArrowUpCircle, ChevronDown, Calendar, DollarSign } from "lucide-react";

export default function SavingsView() {
  const { savings, addSaving, updateSaving, deleteSaving, addToSaving, convertToCRC, getTotalSavingsContributions, formatAmount } = useStore(useShallow((s) => ({
    savings: s.savings,
    addSaving: s.addSaving,
    updateSaving: s.updateSaving,
    deleteSaving: s.deleteSaving,
    addToSaving: s.addToSaving,
    convertToCRC: s.convertToCRC,
    getTotalSavingsContributions: s.getTotalSavingsContributions,
    formatAmount: s.formatAmount,
  })));
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
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
        <StatCard title="Ahorro Mensual" value={formatAmount(totalMonthly)} icon={<PiggyBank className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Total Ahorrado" value={formatAmount(totalSavedCRC)} icon={<Coins className="w-5 h-5" />} accentColor="orange" />
        <StatCard title="Meta Total" value={formatAmount(totalTargetCRC)} icon={<Target className="w-5 h-5" />} />
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
                      className={`bg-white dark:bg-dark-card rounded-2xl border relative overflow-hidden transition-colors ${progress >= 100 ? "border-green-200 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5" : "border-gray-100 dark:border-dark-border"}`}>

                      {/* Main card - clickable */}
                      <div className="p-5 cursor-pointer" onClick={() => toggleExpand(saving.id)}>
                        {progress >= 100 && (
                          <div className="absolute top-3 right-10">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">✓ Completado</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{saving.description}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Contribución: {formatCurrency(saving.monthlyContribution, saving.currency)}/mes
                              {monthsLeft !== null && monthsLeft > 0 && ` · ~${monthsLeft} meses restantes`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${progress >= 100 ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-orange-50 dark:bg-orange-500/10 text-orange-500"}`}>
                              {Math.round(progress)}%
                            </span>
                            <motion.div animate={{ rotate: expandedIds.has(saving.id) ? 180 : 0 }} transition={{ duration: 0.2 }} className="p-1 text-gray-400">
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                          <div className="min-w-0"><p className="text-xs text-gray-400">Ahorrado</p><p className="text-xs sm:text-sm font-semibold text-green-500 truncate">{formatCurrency(saving.currentAmount, saving.currency)}</p></div>
                          <div className="min-w-0"><p className="text-xs text-gray-400">Meta</p><p className="text-xs sm:text-sm font-semibold text-orange-500 truncate">{formatCurrency(saving.targetAmount, saving.currency)}</p></div>
                          <div className="min-w-0"><p className="text-xs text-gray-400">Restante</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{formatCurrency(Math.max(saving.targetAmount - saving.currentAmount, 0), saving.currency)}</p></div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Progreso de ahorro</span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${progress >= 100 ? "bg-green-400" : "bg-orange-400"}`} />
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail panel */}
                      <AnimatePresence>
                        {expandedIds.has(saving.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t border-gray-100 dark:border-dark-border pt-4 space-y-4">
                              {/* Key summary */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3">
                                  <p className="text-[10px] uppercase font-medium text-orange-600 dark:text-orange-400 tracking-wide">Contribución Mensual</p>
                                  <p className="text-sm font-bold text-orange-700 dark:text-orange-300 mt-0.5">{formatCurrency(saving.monthlyContribution, saving.currency)}</p>
                                  <p className="text-[10px] text-orange-500 mt-0.5">Inicio: {new Date(saving.startDate + "T12:00:00").toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "numeric" })}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-3">
                                  <p className="text-[10px] uppercase font-medium text-green-600 dark:text-green-400 tracking-wide">Total Ahorrado</p>
                                  <p className="text-sm font-bold text-green-700 dark:text-green-300 mt-0.5">{formatCurrency(saving.currentAmount, saving.currency)}</p>
                                  <p className="text-[10px] text-green-500 mt-0.5">{Math.round(progress)}% de la meta</p>
                                </div>
                              </div>

                              {/* Projection */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" /> Proyección
                                </h5>
                                <div className="bg-gray-50 dark:bg-dark-surface rounded-xl p-3 space-y-1.5">
                                  {monthsLeft !== null && monthsLeft > 0 ? (
                                    <>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Meses restantes estimados</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{monthsLeft} meses</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Fecha estimada de meta</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                                          {(() => { const d = new Date(); d.setMonth(d.getMonth() + monthsLeft); return d.toLocaleDateString("es-CR", { year: "numeric", month: "short" }); })()}
                                        </span>
                                      </div>
                                    </>
                                  ) : saving.monthlyContribution <= 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-1">Establece una contribución mensual para ver la proyección</p>
                                  ) : (
                                    <p className="text-xs text-green-500 text-center py-1 font-medium">¡Meta alcanzada!</p>
                                  )}
                                </div>
                              </div>

                              {/* CRC equivalent */}
                              {saving.currency !== "CRC" && (
                                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3">
                                  <p className="text-[10px] uppercase font-medium text-blue-600 dark:text-blue-400 tracking-wide">Equivalente en Colones</p>
                                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Ahorrado: {formatAmount(convertToCRC(saving.currentAmount, saving.currency))} · Meta: {formatAmount(convertToCRC(saving.targetAmount, saving.currency))}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 px-5 pb-4">
                        {showAddFunds === saving.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input type="number" step="0.01" min="0" value={addFundsAmount} onChange={(e) => setAddFundsAmount(e.target.value)} placeholder="Monto"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" autoFocus />
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddFunds(saving.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg">Agregar</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setShowAddFunds(null); setAddFundsAmount(""); }} className="px-3 py-1.5 bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg">Cancelar</motion.button>
                          </div>
                        ) : (
                          <>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={(e) => { e.stopPropagation(); setShowAddFunds(saving.id); }}
                              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-xl transition-colors">
                              <ArrowUpCircle className="w-3.5 h-3.5" />Agregar Fondos
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); openEdit(saving); }}
                              className="p-2 rounded-xl text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); deleteSaving(saving.id); }}
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
