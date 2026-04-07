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
import { Plus, CreditCard, Trash2, Edit3, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function DebtsView() {
  const { debts, addDebt, updateDebt, deleteDebt, makeDebtPayment, convertToCRC, getTotalDebtPayments } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualPayment, setManualPayment] = useState(false);
  const [form, setForm] = useState({
    description: "", totalAmount: "", currency: "CRC" as Currency, monthlyPayment: "", totalMonths: "", paidMonths: "0", startDate: getTodayStr(), paymentDay: "15",
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const autoCalcPayment = (total: string, months: string) => {
    const t = parseFloat(total); const m = parseInt(months);
    if (!t || !m || m <= 0) return "";
    return (t / m).toFixed(2);
  };

  const updateForm = (patch: Partial<typeof form>) => {
    const next = { ...form, ...patch };
    if (!manualPayment && ("totalAmount" in patch || "totalMonths" in patch)) {
      next.monthlyPayment = autoCalcPayment(next.totalAmount, next.totalMonths);
    }
    setForm(next);
  };

  const resetForm = () => {
    setForm({ description: "", totalAmount: "", currency: "CRC", monthlyPayment: "", totalMonths: "", paidMonths: "0", startDate: getTodayStr(), paymentDay: "15" });
    setEditingId(null);
    setManualPayment(false);
  };

  const activeDebts = debts.filter((d) => d.paidMonths < d.totalMonths);
  const completedDebts = debts.filter((d) => d.paidMonths >= d.totalMonths);
  const totalMonthly = getTotalDebtPayments();
  const totalDebtRemaining = activeDebts.reduce((s, d) => s + convertToCRC(d.monthlyPayment * (d.totalMonths - d.paidMonths), d.currency), 0);
  const totalPaid = debts.reduce((s, d) => s + convertToCRC(d.monthlyPayment * d.paidMonths, d.currency), 0);

  const openEdit = (debt: typeof debts[0]) => {
    setEditingId(debt.id);
    setForm({
      description: debt.description, totalAmount: debt.totalAmount.toString(), currency: debt.currency,
      monthlyPayment: debt.monthlyPayment.toString(), totalMonths: debt.totalMonths.toString(),
      paidMonths: debt.paidMonths.toString(), startDate: debt.startDate, paymentDay: debt.paymentDay.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.totalAmount || !form.totalMonths) return;
    const totalMonths = parseInt(form.totalMonths);
    const totalAmount = parseFloat(form.totalAmount);
    const data = {
      description: form.description, totalAmount, currency: form.currency,
      monthlyPayment: form.monthlyPayment ? parseFloat(form.monthlyPayment) : totalAmount / totalMonths,
      totalMonths, paidMonths: parseInt(form.paidMonths) || 0, startDate: form.startDate, paymentDay: parseInt(form.paymentDay) || 15,
    };
    if (editingId) updateDebt(editingId, data);
    else addDebt(data);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Cuota Mensual Total" value={formatCRC(totalMonthly)} icon={<CreditCard className="w-5 h-5" />} accentColor="orange" />
        <StatCard title="Deuda Restante" value={formatCRC(totalDebtRemaining)} icon={<AlertCircle className="w-5 h-5" />} accentColor="red" />
        <StatCard title="Total Pagado" value={formatCRC(totalPaid)} icon={<CheckCircle className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Deudas Activas" value={`${activeDebts.length}`} subtitle={`${completedDebts.length} completadas`} icon={<Clock className="w-5 h-5" />} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Deudas a Plazos ({activeDebts.length} activas)</h2>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />Agregar Deuda
        </motion.button>
      </div>

      {debts.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-8 h-8" />} title="Sin deudas registradas" description="Agrega tus préstamos o suscripciones con plazos para llevar un control automático de pagos."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primera deuda</motion.button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {debts.map((debt, idx) => {
              const progress = (debt.paidMonths / debt.totalMonths) * 100;
              const remaining = debt.monthlyPayment * (debt.totalMonths - debt.paidMonths);
              const isComplete = debt.paidMonths >= debt.totalMonths;
              return (
                <motion.div key={debt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-dark-card rounded-2xl border p-5 relative overflow-hidden transition-colors ${isComplete ? "border-green-200 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5" : "border-gray-100 dark:border-dark-border"}`}>
                  {isComplete && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">✓ Pagada</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{debt.description}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Día de pago: {debt.paymentDay} · Inicio: {debt.startDate}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <div className="min-w-0"><p className="text-xs text-gray-400">Total</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{formatCurrency(debt.totalAmount, debt.currency)}</p></div>
                    <div className="min-w-0"><p className="text-xs text-gray-400">Cuota</p><p className="text-xs sm:text-sm font-semibold text-orange-500 truncate">{formatCurrency(debt.monthlyPayment, debt.currency)}</p></div>
                    <div className="min-w-0"><p className="text-xs text-gray-400">Restante</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{formatCurrency(remaining, debt.currency)}</p></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{debt.paidMonths} de {debt.totalMonths} meses</span>
                      <span className="font-medium text-gray-600 dark:text-gray-300">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${isComplete ? "bg-green-400" : "bg-orange-400"}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isComplete && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => makeDebtPayment(debt.id)}
                        className="flex-1 py-2 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-xl transition-colors">
                        Registrar Pago
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(debt)}
                      className="p-2 rounded-xl text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteDebt(debt.id)}
                      className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Deuda" : "Agregar Deuda"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Préstamo Auto"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Monto Total</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.totalAmount)} onChange={(e) => updateForm({ totalAmount: rawNum(e.target.value) })} placeholder="0"
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Plazo (meses)</label>
              <input type="number" min="1" value={form.totalMonths} onChange={(e) => updateForm({ totalMonths: e.target.value })} placeholder="24"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cuota Mensual (opcional)</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.monthlyPayment)} onChange={(e) => { setManualPayment(true); setForm({ ...form, monthlyPayment: rawNum(e.target.value) }); }} placeholder="Auto-calculada"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meses pagados</label>
              <input type="number" min="0" value={form.paidMonths} onChange={(e) => setForm({ ...form, paidMonths: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Día de pago</label>
              <input type="number" min="1" max="31" value={form.paymentDay} onChange={(e) => setForm({ ...form, paymentDay: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha inicio</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar Deuda"}
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
import { Plus, CreditCard, Trash2, Edit3, CheckCircle, AlertCircle, Clock, ChevronDown, Calendar, DollarSign, X } from "lucide-react";

export default function DebtsView() {
  const { debts, addDebt, updateDebt, deleteDebt, makeDebtPayment, convertToCRC, getTotalDebtPayments } = useStore(useShallow((s) => ({
    debts: s.debts,
    addDebt: s.addDebt,
    updateDebt: s.updateDebt,
    deleteDebt: s.deleteDebt,
    makeDebtPayment: s.makeDebtPayment,
    convertToCRC: s.convertToCRC,
    getTotalDebtPayments: s.getTotalDebtPayments,
  })));
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const [manualPayment, setManualPayment] = useState(false);
  const [form, setForm] = useState({
    description: "", totalAmount: "", currency: "CRC" as Currency, monthlyPayment: "", totalMonths: "", paidMonths: "0", startDate: getTodayStr(), paymentDay: "15",
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const autoCalcPayment = (total: string, months: string) => {
    const t = parseFloat(total); const m = parseInt(months);
    if (!t || !m || m <= 0) return "";
    return (t / m).toFixed(2);
  };

  const updateForm = (patch: Partial<typeof form>) => {
    const next = { ...form, ...patch };
    if (!manualPayment && ("totalAmount" in patch || "totalMonths" in patch)) {
      next.monthlyPayment = autoCalcPayment(next.totalAmount, next.totalMonths);
    }
    setForm(next);
  };

  const resetForm = () => {
    setForm({ description: "", totalAmount: "", currency: "CRC", monthlyPayment: "", totalMonths: "", paidMonths: "0", startDate: getTodayStr(), paymentDay: "15" });
    setEditingId(null);
    setManualPayment(false);
  };

  const activeDebts = debts.filter((d) => d.paidMonths < d.totalMonths);
  const completedDebts = debts.filter((d) => d.paidMonths >= d.totalMonths);
  const totalMonthly = getTotalDebtPayments();
  const totalDebtRemaining = activeDebts.reduce((s, d) => s + convertToCRC(d.monthlyPayment * (d.totalMonths - d.paidMonths), d.currency), 0);
  const totalPaid = debts.reduce((s, d) => s + convertToCRC(d.monthlyPayment * d.paidMonths, d.currency), 0);

  const openEdit = (debt: typeof debts[0]) => {
    setEditingId(debt.id);
    setForm({
      description: debt.description, totalAmount: debt.totalAmount.toString(), currency: debt.currency,
      monthlyPayment: debt.monthlyPayment.toString(), totalMonths: debt.totalMonths.toString(),
      paidMonths: debt.paidMonths.toString(), startDate: debt.startDate, paymentDay: debt.paymentDay.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.totalAmount || !form.totalMonths) return;
    const totalMonths = parseInt(form.totalMonths);
    const totalAmount = parseFloat(form.totalAmount);
    const data = {
      description: form.description, totalAmount, currency: form.currency,
      monthlyPayment: form.monthlyPayment ? parseFloat(form.monthlyPayment) : totalAmount / totalMonths,
      totalMonths, paidMonths: parseInt(form.paidMonths) || 0, startDate: form.startDate, paymentDay: parseInt(form.paymentDay) || 15,
    };
    if (editingId) updateDebt(editingId, data);
    else addDebt(data);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Cuota Mensual Total" value={formatCRC(totalMonthly)} icon={<CreditCard className="w-5 h-5" />} accentColor="orange" />
        <StatCard title="Deuda Restante" value={formatCRC(totalDebtRemaining)} icon={<AlertCircle className="w-5 h-5" />} accentColor="red" />
        <StatCard title="Total Pagado" value={formatCRC(totalPaid)} icon={<CheckCircle className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Deudas Activas" value={`${activeDebts.length}`} subtitle={`${completedDebts.length} completadas`} icon={<Clock className="w-5 h-5" />} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Deudas a Plazos ({activeDebts.length} activas)</h2>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />Agregar Deuda
        </motion.button>
      </div>

      {debts.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-8 h-8" />} title="Sin deudas registradas" description="Agrega tus préstamos o suscripciones con plazos para llevar un control automático de pagos."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primera deuda</motion.button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <AnimatePresence>
            {debts.map((debt, idx) => {
              const progress = (debt.paidMonths / debt.totalMonths) * 100;
              const remaining = debt.monthlyPayment * (debt.totalMonths - debt.paidMonths);
              const isComplete = debt.paidMonths >= debt.totalMonths;
              const isExpanded = expandedIds.has(debt.id);
              const totalPaidDebt = debt.monthlyPayment * debt.paidMonths;
              const remainingMonths = debt.totalMonths - debt.paidMonths;

              // Calculate payment timeline
              const startParts = debt.startDate.split("-").map(Number);
              const startYear = startParts[0];
              const startMonth = startParts[1] - 1;

              const getPaymentDate = (monthIndex: number) => {
                const d = new Date(startYear, startMonth + monthIndex, 1);
                const day = Math.min(debt.paymentDay, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
                return new Date(d.getFullYear(), d.getMonth(), day);
              };

              const estimatedEndDate = getPaymentDate(debt.totalMonths - 1);
              const nextPaymentDate = !isComplete ? getPaymentDate(debt.paidMonths) : null;

              const fmtDate = (d: Date) => d.toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "numeric" });

              return (
                <motion.div key={debt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-dark-card rounded-2xl border relative overflow-hidden transition-colors ${isComplete ? "border-green-200 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5" : "border-gray-100 dark:border-dark-border"}`}>

                  {/* Main card - clickable */}
                  <div className="p-5 cursor-pointer" onClick={() => toggleExpand(debt.id)}>
                    {isComplete && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">✓ Pagada</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{debt.description}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Día de pago: {debt.paymentDay} · Inicio: {debt.startDate}</p>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="p-1 text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className="min-w-0"><p className="text-xs text-gray-400">Total</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{formatCurrency(debt.totalAmount, debt.currency)}</p></div>
                      <div className="min-w-0"><p className="text-xs text-gray-400">Cuota</p><p className="text-xs sm:text-sm font-semibold text-orange-500 truncate">{formatCurrency(debt.monthlyPayment, debt.currency)}</p></div>
                      <div className="min-w-0"><p className="text-xs text-gray-400">Restante</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{formatCurrency(remaining, debt.currency)}</p></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{debt.paidMonths} de {debt.totalMonths} meses</span>
                        <span className="font-medium text-gray-600 dark:text-gray-300">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${isComplete ? "bg-green-400" : "bg-orange-400"}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-gray-100 dark:border-dark-border pt-4 space-y-4">
                          {/* Key summary stats */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-3">
                              <p className="text-[10px] uppercase font-medium text-green-600 dark:text-green-400 tracking-wide">Total Pagado</p>
                              <p className="text-sm font-bold text-green-700 dark:text-green-300 mt-0.5">{formatCurrency(totalPaidDebt, debt.currency)}</p>
                              <p className="text-[10px] text-green-500 mt-0.5">{debt.paidMonths} cuotas completadas</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3">
                              <p className="text-[10px] uppercase font-medium text-orange-600 dark:text-orange-400 tracking-wide">Por Pagar</p>
                              <p className="text-sm font-bold text-orange-700 dark:text-orange-300 mt-0.5">{formatCurrency(remaining, debt.currency)}</p>
                              <p className="text-[10px] text-orange-500 mt-0.5">{remainingMonths} cuotas restantes</p>
                            </div>
                          </div>

                          {/* Important dates */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Fechas Importantes
                            </h5>
                            <div className="bg-gray-50 dark:bg-dark-surface rounded-xl p-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Fecha de inicio</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{debt.startDate}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Día de cobro</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Cada día {debt.paymentDay} del mes</span>
                              </div>
                              {nextPaymentDate && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">Próximo pago</span>
                                  <span className="text-xs font-semibold text-orange-500">{fmtDate(nextPaymentDate)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">{isComplete ? "Fecha de liquidación" : "Liquidación estimada"}</span>
                                <span className={`text-xs font-medium ${isComplete ? "text-green-500" : "text-gray-700 dark:text-gray-200"}`}>{fmtDate(estimatedEndDate)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment timeline */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5" /> Historial de Cuotas
                            </h5>
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                              {Array.from({ length: debt.totalMonths }, (_, i) => {
                                const payDate = getPaymentDate(i);
                                const isPaid = i < debt.paidMonths;
                                const isCurrent = i === debt.paidMonths && !isComplete;
                                return (
                                  <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                                    isCurrent ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30" :
                                    isPaid ? "bg-gray-50 dark:bg-dark-surface" : "opacity-50"
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                        isPaid ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" :
                                        isCurrent ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400" :
                                        "bg-gray-200 dark:bg-dark-border text-gray-400"
                                      }`}>
                                        {isPaid ? "✓" : i + 1}
                                      </div>
                                      <span className={`${isPaid ? "text-gray-600 dark:text-gray-300" : isCurrent ? "text-orange-600 dark:text-orange-400 font-semibold" : "text-gray-400"}`}>
                                        Cuota {i + 1} — {fmtDate(payDate)}
                                      </span>
                                    </div>
                                    <span className={`font-medium ${isPaid ? "text-green-500" : isCurrent ? "text-orange-500" : "text-gray-400"}`}>
                                      {formatCurrency(debt.monthlyPayment, debt.currency)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Debt extra info */}
                          {debt.currency !== "CRC" && (
                            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3">
                              <p className="text-[10px] uppercase font-medium text-blue-600 dark:text-blue-400 tracking-wide">Equivalente en Colones</p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Total: {formatCRC(convertToCRC(debt.totalAmount, debt.currency))} · Cuota: {formatCRC(convertToCRC(debt.monthlyPayment, debt.currency))}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 px-5 pb-4">
                    {!isComplete && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={(e) => { e.stopPropagation(); makeDebtPayment(debt.id); }}
                        className="flex-1 py-2 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-xl transition-colors">
                        Registrar Pago
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); openEdit(debt); }}
                      className="p-2 rounded-xl text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); deleteDebt(debt.id); }}
                      className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Deuda" : "Agregar Deuda"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Préstamo Auto"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Monto Total</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.totalAmount)} onChange={(e) => updateForm({ totalAmount: rawNum(e.target.value) })} placeholder="0"
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Plazo (meses)</label>
              <input type="number" min="1" value={form.totalMonths} onChange={(e) => updateForm({ totalMonths: e.target.value })} placeholder="24"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cuota Mensual (opcional)</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.monthlyPayment)} onChange={(e) => { setManualPayment(true); setForm({ ...form, monthlyPayment: rawNum(e.target.value) }); }} placeholder="Auto-calculada"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Meses pagados</label>
              <input type="number" min="0" value={form.paidMonths} onChange={(e) => setForm({ ...form, paidMonths: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Día de pago</label>
              <input type="number" min="1" max="31" value={form.paymentDay} onChange={(e) => setForm({ ...form, paymentDay: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha inicio</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar Deuda"}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
>>>>>>> Stashed changes
