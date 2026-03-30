"use client";

import { useStore } from "@/store/useStore";
import { formatCRC } from "@/lib/utils";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  TrendingDown,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  X,
  Sparkles,
  Clock,
  Flame,
} from "lucide-react";

export interface Notification {
  id: string;
  type: "warning" | "danger" | "success" | "info";
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TYPE_STYLES: Record<string, { bg: string; iconBg: string; border: string }> = {
  danger: {
    bg: "bg-red-50 dark:bg-red-500/10",
    iconBg: "bg-red-100 dark:bg-red-500/20 text-red-500",
    border: "border-red-100 dark:border-red-500/20",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    iconBg: "bg-amber-100 dark:bg-amber-500/20 text-amber-500",
    border: "border-amber-100 dark:border-amber-500/20",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-500/10",
    iconBg: "bg-green-100 dark:bg-green-500/20 text-green-500",
    border: "border-green-100 dark:border-green-500/20",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconBg: "bg-blue-100 dark:bg-blue-500/20 text-blue-500",
    border: "border-blue-100 dark:border-blue-500/20",
  },
};

export function useNotifications(): Notification[] {
  const {
    incomes,
    expenses,
    debts,
    savings,
    currentMonth,
    convertToCRC,
    getTotalIncomes,
    getTotalExpenses,
    getTotalDebtPayments,
    getTotalSavingsContributions,
  } = useStore();

  return useMemo(() => {
    const notifications: Notification[] = [];
    const totalIncomes = getTotalIncomes();
    const totalExpenses = getTotalExpenses();
    const totalDebts = getTotalDebtPayments();
    const totalSavings = getTotalSavingsContributions();
    const balance = totalIncomes - totalExpenses - totalDebts - totalSavings;
    const today = new Date();
    const currentDay = today.getDate();

    // 1. Negative balance
    if (totalIncomes > 0 && balance < 0) {
      notifications.push({
        id: "negative-balance",
        type: "danger",
        icon: <TrendingDown className="w-4 h-4" />,
        title: "Balance negativo",
        description: `Tus gastos superan tus ingresos por ${formatCRC(Math.abs(balance))} este mes.`,
      });
    }

    // 2. Expenses exceed 80% of income
    if (totalIncomes > 0 && totalExpenses > totalIncomes * 0.8 && balance >= 0) {
      const pct = Math.round((totalExpenses / totalIncomes) * 100);
      notifications.push({
        id: "high-expenses",
        type: "warning",
        icon: <Flame className="w-4 h-4" />,
        title: "Gastos elevados",
        description: `Has gastado el ${pct}% de tus ingresos. ¡Cuidado con los gastos!`,
      });
    }

    // 3. Upcoming debt payments (within 5 days)
    const activeDebts = debts.filter((d) => d.paidMonths < d.totalMonths);
    activeDebts.forEach((debt) => {
      const daysUntilPayment = debt.paymentDay - currentDay;
      if (daysUntilPayment >= 0 && daysUntilPayment <= 5) {
        const amountCRC = convertToCRC(debt.monthlyPayment, debt.currency);
        notifications.push({
          id: `debt-due-${debt.id}`,
          type: "warning",
          icon: <CreditCard className="w-4 h-4" />,
          title: `Pago próximo: ${debt.description}`,
          description:
            daysUntilPayment === 0
              ? `¡Hoy vence! Monto: ${formatCRC(amountCRC)}`
              : `Vence en ${daysUntilPayment} día${daysUntilPayment > 1 ? "s" : ""}. Monto: ${formatCRC(amountCRC)}`,
        });
      }
    });

    // 4. Overdue debt payments (already passed this month, not paid)
    activeDebts.forEach((debt) => {
      if (debt.paymentDay < currentDay) {
        notifications.push({
          id: `debt-overdue-${debt.id}`,
          type: "danger",
          icon: <AlertTriangle className="w-4 h-4" />,
          title: `Pago atrasado: ${debt.description}`,
          description: `El pago del día ${debt.paymentDay} ya pasó. Verifica si fue realizado.`,
        });
      }
    });

    // 5. Debts about to finish (<=2 months remaining)
    debts
      .filter((d) => d.paidMonths < d.totalMonths && d.totalMonths - d.paidMonths <= 2)
      .forEach((debt) => {
        const remaining = debt.totalMonths - debt.paidMonths;
        notifications.push({
          id: `debt-ending-${debt.id}`,
          type: "success",
          icon: <CheckCircle2 className="w-4 h-4" />,
          title: `${debt.description} casi lista`,
          description: `¡Solo ${remaining === 1 ? "falta 1 cuota" : `faltan ${remaining} cuotas`}! Ya casi terminas.`,
        });
      });

    // 6. Savings goals near completion (>=90%)
    savings.forEach((saving) => {
      if (saving.targetAmount > 0) {
        const pct = (saving.currentAmount / saving.targetAmount) * 100;
        if (pct >= 90 && pct < 100) {
          notifications.push({
            id: `saving-near-${saving.id}`,
            type: "success",
            icon: <PiggyBank className="w-4 h-4" />,
            title: `Meta casi alcanzada: ${saving.description}`,
            description: `¡Llevas el ${Math.round(pct)}%! Solo te faltan ${formatCRC(convertToCRC(saving.targetAmount - saving.currentAmount, saving.currency))}.`,
          });
        }
        if (pct >= 100) {
          notifications.push({
            id: `saving-done-${saving.id}`,
            type: "success",
            icon: <Sparkles className="w-4 h-4" />,
            title: `¡Meta completada! ${saving.description}`,
            description: `Alcanzaste tu objetivo de ${formatCRC(convertToCRC(saving.targetAmount, saving.currency))}.`,
          });
        }
      }
    });

    // 7. No incomes registered this month
    const monthIncomes = incomes.filter((i) => i.date.startsWith(currentMonth));
    if (monthIncomes.length === 0) {
      notifications.push({
        id: "no-incomes",
        type: "info",
        icon: <Clock className="w-4 h-4" />,
        title: "Sin ingresos registrados",
        description: "Aún no has registrado ingresos para este mes.",
      });
    }

    // 8. No expenses registered this month
    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
    if (monthExpenses.length === 0 && monthIncomes.length > 0) {
      notifications.push({
        id: "no-expenses",
        type: "info",
        icon: <Clock className="w-4 h-4" />,
        title: "Sin gastos registrados",
        description: "Aún no has registrado gastos para este mes.",
      });
    }

    return notifications;
  }, [incomes, expenses, debts, savings, currentMonth, convertToCRC, getTotalIncomes, getTotalExpenses, getTotalDebtPayments, getTotalSavingsContributions]);
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { dismissedNotifications, dismissNotification, clearDismissedNotifications } = useStore();
  const allNotifications = useNotifications();
  const notifications = allNotifications.filter((n) => !dismissedNotifications.includes(n.id));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Notificaciones
                {notifications.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </h3>
              {dismissedNotifications.length > 0 && (
                <button
                  onClick={clearDismissedNotifications}
                  className="text-[11px] text-orange-400 hover:text-orange-500 font-medium transition-colors"
                >
                  Restaurar
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    ¡Todo en orden! No hay notificaciones.
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1.5">
                  <AnimatePresence mode="popLayout">
                    {notifications.map((n) => {
                      const style = TYPE_STYLES[n.type];
                      return (
                        <motion.div
                          key={n.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-start gap-3 p-3 rounded-xl border ${style.bg} ${style.border} group`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${style.iconBg}`}>
                            {n.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                              {n.description}
                            </p>
                          </div>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200/50 dark:hover:bg-dark-surface text-gray-400 transition-opacity shrink-0"
                            title="Descartar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
