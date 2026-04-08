"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { formatCurrency, getTodayStr } from "@/lib/utils";
import { Currency } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, HandCoins, Trash2, Edit3, CheckCircle, ChevronDown, DollarSign, X, UserCheck, Clock, PlusCircle } from "lucide-react";

export default function LoansView() {
  const { loans, addLoan, updateLoan, deleteLoan, addLoanPayment, deleteLoanPayment, convertToCRC, formatAmount } = useStore(useShallow((s) => ({
    loans: s.loans,
    addLoan: s.addLoan,
    updateLoan: s.updateLoan,
    deleteLoan: s.deleteLoan,
    addLoanPayment: s.addLoanPayment,
    deleteLoanPayment: s.deleteLoanPayment,
    convertToCRC: s.convertToCRC,
    formatAmount: s.formatAmount,
  })));
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraLoanId, setExtraLoanId] = useState<string | null>(null);
  const [extraForm, setExtraForm] = useState({ amount: "", description: "" });

  const [form, setForm] = useState({
    borrowerName: "",
    description: "",
    amount: "",
    currency: "CRC" as Currency,
    date: getTodayStr(),
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: getTodayStr(),
    note: "",
  });

  const fmtNum = (v: string) => { if (!v) return ""; const clean = v.replace(/[^0-9.,]/g, ""); const parts = clean.replace(",", ".").split("."); const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); return parts.length > 1 ? `${int},${parts[1]}` : int; };
  const rawNum = (v: string) => v.replace(/\./g, "").replace(",", ".");

  const resetForm = () => {
    setForm({ borrowerName: "", description: "", amount: "", currency: "CRC", date: getTodayStr() });
    setEditingId(null);
  };

  const openExtraLoan = (loanId: string) => {
    setExtraLoanId(loanId);
    setExtraForm({ amount: "", description: "" });
    setShowExtraModal(true);
  };

  const handleExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraLoanId || !extraForm.amount) return;
    const loan = loans.find((l) => l.id === extraLoanId);
    if (!loan) return;
    const extraAmount = parseFloat(extraForm.amount);
    if (!extraAmount || extraAmount <= 0) return;
    const newAmount = loan.amount + extraAmount;
    const newDesc = extraForm.description
      ? (loan.description ? `${loan.description} + ${extraForm.description}` : extraForm.description)
      : loan.description;
    updateLoan(extraLoanId, { amount: newAmount, description: newDesc });
    setShowExtraModal(false);
    setExtraLoanId(null);
  };

  const resetPaymentForm = () => {
    setPaymentForm({ amount: "", date: getTodayStr(), note: "" });
    setPaymentLoanId(null);
  };

  // Computed totals
  const totalLent = loans.reduce((s, l) => s + convertToCRC(l.amount, l.currency), 0);
  const totalRecovered = loans.reduce((s, l) => s + convertToCRC(l.payments.reduce((ps, p) => ps + p.amount, 0), l.currency), 0);
  const totalPending = totalLent - totalRecovered;
  const activeLoans = loans.filter((l) => {
    const paid = l.payments.reduce((s, p) => s + p.amount, 0);
    return paid < l.amount;
  });
  const completedLoans = loans.filter((l) => {
    const paid = l.payments.reduce((s, p) => s + p.amount, 0);
    return paid >= l.amount;
  });

  const openEdit = (loan: typeof loans[0]) => {
    setEditingId(loan.id);
    setForm({
      borrowerName: loan.borrowerName,
      description: loan.description,
      amount: loan.amount.toString(),
      currency: loan.currency,
      date: loan.date,
    });
    setShowModal(true);
  };

  const openPayment = (loanId: string) => {
    setPaymentForm({ amount: "", date: getTodayStr(), note: "" });
    setPaymentLoanId(loanId);
    setShowPaymentModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.borrowerName || !form.amount) return;
    const data = {
      borrowerName: form.borrowerName,
      description: form.description,
      amount: parseFloat(form.amount),
      currency: form.currency,
      date: form.date,
    };
    if (editingId) updateLoan(editingId, data);
    else addLoan(data);
    resetForm();
    setShowModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLoanId || !paymentForm.amount) return;
    addLoanPayment(paymentLoanId, {
      amount: parseFloat(paymentForm.amount),
      date: paymentForm.date,
      note: paymentForm.note || undefined,
    });
    resetPaymentForm();
    setShowPaymentModal(false);
  };

  const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total Prestado" value={formatAmount(totalLent)} icon={<HandCoins className="w-5 h-5" />} accentColor="purple" />
        <StatCard title="Total Recuperado" value={formatAmount(totalRecovered)} icon={<CheckCircle className="w-5 h-5" />} accentColor="green" />
        <StatCard title="Pendiente por Cobrar" value={formatAmount(totalPending)} icon={<Clock className="w-5 h-5" />} accentColor="orange" />
        <StatCard title="Préstamos Activos" value={`${activeLoans.length}`} subtitle={`${completedLoans.length} completados`} icon={<UserCheck className="w-5 h-5" />} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Préstamos ({activeLoans.length} activos)</h2>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus className="w-4 h-4" />Nuevo Préstamo
        </motion.button>
      </div>

      {loans.length === 0 ? (
        <EmptyState icon={<HandCoins className="w-8 h-8" />} title="Sin préstamos registrados" description="Registra el dinero que has prestado para llevar un control de los pagos."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-xl">Registrar primer préstamo</motion.button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <AnimatePresence>
            {loans.map((loan, idx) => {
              const totalPaid = loan.payments.reduce((s, p) => s + p.amount, 0);
              const remaining = loan.amount - totalPaid;
              const progress = Math.min((totalPaid / loan.amount) * 100, 100);
              const isComplete = totalPaid >= loan.amount;
              const isExpanded = expandedIds.has(loan.id);

              return (
                <motion.div key={loan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-dark-card rounded-2xl border relative overflow-hidden transition-colors ${isComplete ? "border-green-200 dark:border-green-500/30 bg-green-50/30 dark:bg-green-500/5" : "border-gray-100 dark:border-dark-border"}`}>

                  {/* Main card - clickable */}
                  <div className="p-5 cursor-pointer" onClick={() => toggleExpand(loan.id)}>
                    {isComplete && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">✓ Pagado</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{loan.borrowerName}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{loan.description || "Sin descripción"} · {fmtDate(loan.date)}</p>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="p-1 text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className="min-w-0"><p className="text-xs text-gray-400">Prestado</p><p className="text-xs sm:text-sm font-semibold text-purple-500 truncate">{formatCurrency(loan.amount, loan.currency)}</p></div>
                      <div className="min-w-0"><p className="text-xs text-gray-400">Recibido</p><p className="text-xs sm:text-sm font-semibold text-green-500 truncate">{formatCurrency(totalPaid, loan.currency)}</p></div>
                      <div className="min-w-0"><p className="text-xs text-gray-400">Pendiente</p><p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{formatCurrency(Math.max(remaining, 0), loan.currency)}</p></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{loan.payments.length} pago{loan.payments.length !== 1 ? "s" : ""} registrado{loan.payments.length !== 1 ? "s" : ""}</span>
                        <span className="font-medium text-gray-600 dark:text-gray-300">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${isComplete ? "bg-green-400" : "bg-purple-400"}`} />
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
                          {/* Key summary */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-3">
                              <p className="text-[10px] uppercase font-medium text-purple-600 dark:text-purple-400 tracking-wide">Monto Prestado</p>
                              <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mt-0.5">{formatCurrency(loan.amount, loan.currency)}</p>
                              <p className="text-[10px] text-purple-500 mt-0.5">Fecha: {fmtDate(loan.date)}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-3">
                              <p className="text-[10px] uppercase font-medium text-green-600 dark:text-green-400 tracking-wide">Total Recuperado</p>
                              <p className="text-sm font-bold text-green-700 dark:text-green-300 mt-0.5">{formatCurrency(totalPaid, loan.currency)}</p>
                              <p className="text-[10px] text-green-500 mt-0.5">{loan.payments.length} pago{loan.payments.length !== 1 ? "s" : ""}</p>
                            </div>
                          </div>

                          {/* Payment history */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> Historial de Pagos
                              </h5>
                              {!isComplete && (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); openPayment(loan.id); }}
                                  className="text-xs font-medium text-purple-500 hover:text-purple-600 flex items-center gap-1">
                                  <Plus className="w-3.5 h-3.5" /> Registrar Pago
                                </motion.button>
                              )}
                            </div>
                            {loan.payments.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-4">No hay pagos registrados aún</p>
                            ) : (
                              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {[...loan.payments].sort((a, b) => b.date.localeCompare(a.date)).map((payment) => (
                                  <div key={payment.id} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-dark-surface group">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex-shrink-0">✓</div>
                                      <div className="min-w-0">
                                        <span className="text-gray-600 dark:text-gray-300">{fmtDate(payment.date)}</span>
                                        {payment.note && <span className="text-gray-400 ml-1.5">— {payment.note}</span>}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <span className="font-medium text-green-500">{formatCurrency(payment.amount, loan.currency)}</span>
                                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); deleteLoanPayment(loan.id, payment.id); }}
                                        className="p-1 rounded text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                      </motion.button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* CRC equivalent */}
                          {loan.currency !== "CRC" && (
                            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3">
                              <p className="text-[10px] uppercase font-medium text-blue-600 dark:text-blue-400 tracking-wide">Equivalente en Colones</p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Prestado: {formatAmount(convertToCRC(loan.amount, loan.currency))} · Recuperado: {formatAmount(convertToCRC(totalPaid, loan.currency))}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 px-5 pb-4">
                    {!isComplete && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={(e) => { e.stopPropagation(); openPayment(loan.id); }}
                        className="flex-1 py-2 text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-xl transition-colors">
                        Registrar Pago
                      </motion.button>
                    )}
                    {!isComplete && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); openExtraLoan(loan.id); }}
                        title="Agregar préstamo extra"
                        className="p-2 rounded-xl text-gray-300 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all">
                        <PlusCircle className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); openEdit(loan); }}
                      className="p-2 rounded-xl text-gray-300 hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); deleteLoan(loan.id); }}
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

      {/* Loan form modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Préstamo" : "Nuevo Préstamo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del deudor</label>
            <input type="text" value={form.borrowerName} onChange={(e) => setForm({ ...form, borrowerName: e.target.value })} placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción (opcional)</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Para reparación del carro"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Monto</label>
              <input type="text" inputMode="decimal" value={fmtNum(form.amount)} onChange={(e) => setForm({ ...form, amount: rawNum(e.target.value) })} placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Moneda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100">
                <option value="CRC">₡ Colones</option><option value="USD">$ Dólares</option><option value="EUR">€ Euros</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Fecha del préstamo</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100" />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Registrar Préstamo"}
          </motion.button>
        </form>
      </Modal>

      {/* Payment form modal */}
      <Modal isOpen={showPaymentModal} onClose={() => { setShowPaymentModal(false); resetPaymentForm(); }} title="Registrar Pago">
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Monto del pago</label>
            <input type="text" inputMode="decimal" value={fmtNum(paymentForm.amount)} onChange={(e) => setPaymentForm({ ...paymentForm, amount: rawNum(e.target.value) })} placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
            <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nota (opcional)</label>
            <input type="text" value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} placeholder="Ej: Abono parcial"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent dark:bg-dark-surface dark:border-dark-border dark:text-gray-100" />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors">
            Registrar Pago
          </motion.button>
        </form>
      </Modal>

      {/* Extra loan modal */}
      <Modal isOpen={showExtraModal} onClose={() => { setShowExtraModal(false); setExtraLoanId(null); }} title="Agregar Préstamo Extra">
        {extraLoanId && (() => {
          const loan = loans.find((l) => l.id === extraLoanId);
          if (!loan) return null;
          const totalPaidLoan = loan.payments.reduce((s, p) => s + p.amount, 0);
          const extraAmt = parseFloat(extraForm.amount) || 0;
          const newTotal = loan.amount + extraAmt;
          const newPending = newTotal - totalPaidLoan;
          return (
            <form onSubmit={handleExtraSubmit} className="space-y-4">
              <div className="bg-gray-50 dark:bg-dark-surface rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Préstamo a: <span className="font-bold text-gray-700 dark:text-gray-200">{loan.borrowerName}</span></p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monto prestado actual</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(loan.amount, loan.currency)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Ya recuperado</span>
                  <span className="font-semibold text-green-500">{formatCurrency(totalPaidLoan, loan.currency)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Pendiente actual</span>
                  <span className="font-semibold text-purple-500">{formatCurrency(loan.amount - totalPaidLoan, loan.currency)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Monto extra prestado</label>
                <input type="text" inputMode="decimal" value={fmtNum(extraForm.amount)} onChange={(e) => setExtraForm({ ...extraForm, amount: rawNum(e.target.value) })} placeholder="Ej: 50.000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Motivo (opcional)</label>
                <input type="text" value={extraForm.description} onChange={(e) => setExtraForm({ ...extraForm, description: e.target.value })} placeholder="Ej: Para emergencia médica"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" />
              </div>
              {extraAmt > 0 && (
                <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-3 space-y-1.5">
                  <p className="text-[10px] uppercase font-medium text-purple-600 dark:text-purple-400 tracking-wide">Resultado</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-500">Nuevo monto total</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">{formatCurrency(newTotal, loan.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-500">Nuevo pendiente</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">{formatCurrency(newPending, loan.currency)}</span>
                  </div>
                </div>
              )}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors">
                Agregar Préstamo Extra
              </motion.button>
            </form>
          );
        })()}
      </Modal>
    </div>
  );
}
