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
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div><p className="text-xs text-gray-400">Total</p><p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(debt.totalAmount, debt.currency)}</p></div>
                    <div><p className="text-xs text-gray-400">Cuota</p><p className="text-sm font-semibold text-orange-500">{formatCurrency(debt.monthlyPayment, debt.currency)}</p></div>
                    <div><p className="text-xs text-gray-400">Restante</p><p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(remaining, debt.currency)}</p></div>
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
          <div className="grid grid-cols-3 gap-4">
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
