"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { formatCurrency, formatCRC, getTodayStr } from "@/lib/utils";
import {
  Currency,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
  BillingCycle,
  SUBSCRIPTION_CATEGORY_LABELS,
  BILLING_CYCLE_LABELS,
} from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Repeat, Trash2, Edit3, Tv, Music, Cloud, Gamepad2,
  Dumbbell, Newspaper, Package, Code, PauseCircle, XCircle, CheckCircle2,
} from "lucide-react";

const CATEGORY_ICONS: Record<SubscriptionCategory, React.ElementType> = {
  streaming: Tv,
  software: Code,
  gaming: Gamepad2,
  music: Music,
  cloud: Cloud,
  fitness: Dumbbell,
  news: Newspaper,
  otros: Package,
};

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; icon: React.ElementType; className: string }> = {
  active:    { label: "Activa",     icon: CheckCircle2, className: "text-green-500 bg-green-50 dark:bg-green-500/10" },
  paused:    { label: "Pausada",    icon: PauseCircle,  className: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" },
  cancelled: { label: "Cancelada",  icon: XCircle,      className: "text-red-500 bg-red-50 dark:bg-red-500/10" },
};

function getMonthlyEquivalent(amount: number, cycle: BillingCycle): number {
  if (cycle === "weekly")  return amount * 52 / 12;
  if (cycle === "yearly")  return amount / 12;
  return amount;
}

function getNextBillingDate(startDate: string, cycle: BillingCycle): string {
  const today = new Date();
  const start = new Date(startDate);
  let next = new Date(start);
  while (next <= today) {
    if (cycle === "weekly")  next.setDate(next.getDate() + 7);
    else if (cycle === "monthly") next.setMonth(next.getMonth() + 1);
    else next.setFullYear(next.getFullYear() + 1);
  }
  return next.toISOString().split("T")[0];
}

const defaultForm = {
  name: "",
  amount: "",
  currency: "USD" as Currency,
  billingCycle: "monthly" as BillingCycle,
  category: "streaming" as SubscriptionCategory,
  startDate: getTodayStr(),
  nextBillingDate: "",
  status: "active" as SubscriptionStatus,
  notes: "",
};

export default function SubscriptionsView() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, convertToCRC } = useStore(
    useShallow((s) => ({
      subscriptions: s.subscriptions,
      addSubscription: s.addSubscription,
      updateSubscription: s.updateSubscription,
      deleteSubscription: s.deleteSubscription,
      convertToCRC: s.convertToCRC,
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<SubscriptionCategory | "all">("all");
  const [form, setForm] = useState(defaultForm);

  const resetForm = () => { setForm(defaultForm); setEditingId(null); };

  const fmtNum = (v: string) => {
    if (!v) return "";
    const clean = v.replace(/[^0-9.,]/g, "");
    const parts = clean.replace(",", ".").split(".");
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? `${int},${parts[1]}` : int;
  };
  const rawNum = (v: string) => parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;

  const openEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setForm({
      name: sub.name,
      amount: sub.amount.toString(),
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      category: sub.category,
      startDate: sub.startDate,
      nextBillingDate: sub.nextBillingDate,
      status: sub.status,
      notes: sub.notes,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    const amount = rawNum(form.amount);
    const nextBillingDate = form.nextBillingDate || getNextBillingDate(form.startDate, form.billingCycle);
    const data = {
      name: form.name,
      amount,
      currency: form.currency,
      billingCycle: form.billingCycle,
      category: form.category,
      startDate: form.startDate,
      nextBillingDate,
      status: form.status,
      notes: form.notes,
    };
    if (editingId) updateSubscription(editingId, data);
    else addSubscription(data);
    resetForm();
    setShowModal(false);
  };

  // Filter
  const filtered = subscriptions
    .filter(s => filterStatus === "all" || s.status === filterStatus)
    .filter(s => filterCategory === "all" || s.category === filterCategory)
    .sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate));

  // Stats
  const active = subscriptions.filter(s => s.status === "active");
  const totalMonthly = active.reduce((sum, s) => sum + convertToCRC(getMonthlyEquivalent(s.amount, s.billingCycle), s.currency), 0);
  const totalYearly = totalMonthly * 12;

  // Days until next billing
  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().setHours(0,0,0,0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-shadow";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Activas" value={String(active.length)} icon={<Repeat className="w-5 h-5" />} accentColor="blue" />
        <StatCard title="Total Mes" value={formatCRC(totalMonthly)} icon={<Repeat className="w-5 h-5" />} />
        <StatCard title="Total Año" value={formatCRC(totalYearly)} icon={<Repeat className="w-5 h-5" />} />
        <StatCard title="Pausadas" value={String(subscriptions.filter(s => s.status === "paused").length)} icon={<PauseCircle className="w-5 h-5" />} />
      </div>

      {/* Filters + Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "paused", "cancelled"] as const).map(st => (
            <button key={st} onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterStatus === st ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}
            >
              {st === "all" ? "Todas" : STATUS_CONFIG[st].label}
            </button>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors shadow-sm shadow-sky-500/30"
        >
          <Plus size={16} /> Agregar
        </motion.button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCategory === "all" ? "bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}
        >Todas</button>
        {(Object.keys(SUBSCRIPTION_CATEGORY_LABELS) as SubscriptionCategory[]).map(cat => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterCategory === cat ? "bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800" : "bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-surface"}`}
            >
              <Icon size={12} />{SUBSCRIPTION_CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <EmptyState icon={<Repeat className="w-8 h-8" />} title="Sin suscripciones" description="Agrega tus servicios de streaming, software u otros." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {filtered.map(sub => {
              const Icon = CATEGORY_ICONS[sub.category];
              const StatusIcon = STATUS_CONFIG[sub.status].icon;
              const days = daysUntil(sub.nextBillingDate);
              const monthlyInCRC = convertToCRC(getMonthlyEquivalent(sub.amount, sub.billingCycle), sub.currency);
              return (
                <motion.div key={sub.id}
                  layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative bg-white dark:bg-dark-card rounded-2xl border p-4 shadow-sm flex flex-col gap-3 transition-opacity ${sub.status === "cancelled" ? "opacity-50 border-red-200 dark:border-red-900/40" : "border-gray-200 dark:border-dark-border"}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-sky-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{sub.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{SUBSCRIPTION_CATEGORY_LABELS[sub.category]}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => deleteSubscription(sub.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(sub.amount, sub.currency)}</span>
                      <span className="ml-1 text-xs text-gray-400">/ {BILLING_CYCLE_LABELS[sub.billingCycle].toLowerCase()}</span>
                    </div>
                    {sub.currency !== "CRC" && (
                      <span className="text-xs text-gray-400">{formatCRC(monthlyInCRC)}/mes</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-dark-border">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${STATUS_CONFIG[sub.status].className}`}>
                      <StatusIcon size={12} />
                      {STATUS_CONFIG[sub.status].label}
                    </div>
                    {sub.status === "active" && (
                      <p className={`text-xs font-medium ${days <= 3 ? "text-red-500" : days <= 7 ? "text-yellow-500" : "text-gray-400 dark:text-gray-500"}`}>
                        {days === 0 ? "¡Hoy!" : days < 0 ? "Vencida" : `en ${days}d`}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Suscripción" : "Nueva Suscripción"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nombre del servicio</label>
            <input className={inputCls} placeholder="Ej. Netflix, Spotify..." value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Monto</label>
              <input className={inputCls} placeholder="0" value={fmtNum(form.amount)}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required inputMode="decimal" />
            </div>
            <div>
              <label className={labelCls}>Moneda</label>
              <select className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value as Currency }))}>
                <option value="CRC">₡ Colones</option>
                <option value="USD">$ Dólares</option>
                <option value="EUR">€ Euros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ciclo de cobro</label>
              <select className={inputCls} value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value as BillingCycle }))}>
                {(Object.keys(BILLING_CYCLE_LABELS) as BillingCycle[]).map(c => (
                  <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Categoría</label>
              <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as SubscriptionCategory }))}>
                {(Object.keys(SUBSCRIPTION_CATEGORY_LABELS) as SubscriptionCategory[]).map(c => (
                  <option key={c} value={c}>{SUBSCRIPTION_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha de inicio</label>
              <input type="date" className={inputCls} value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Próximo cobro</label>
              <input type="date" className={inputCls} value={form.nextBillingDate}
                onChange={e => setForm(f => ({ ...f, nextBillingDate: e.target.value }))}
                placeholder="Auto" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Estado</label>
            <div className="flex gap-2">
              {(["active", "paused", "cancelled"] as SubscriptionStatus[]).map(st => {
                const Icon = STATUS_CONFIG[st].icon;
                return (
                  <button key={st} type="button"
                    onClick={() => setForm(f => ({ ...f, status: st }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${form.status === st ? `${STATUS_CONFIG[st].className} border-transparent` : "border-gray-200 dark:border-dark-border text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface"}`}
                  >
                    <Icon size={13} />{STATUS_CONFIG[st].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas (opcional)</label>
            <input className={inputCls} placeholder="Plan, cuenta, etc." value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors shadow-sm">
              {editingId ? "Guardar cambios" : "Agregar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
