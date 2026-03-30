"use client";

import { useStore } from "@/store/useStore";
import { formatCRC } from "@/lib/utils";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/types";
import StatCard from "@/components/ui/StatCard";
import {
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  casa: "#fb923c",
  deudas_fijas: "#f97316",
  tarjeta: "#fdba74",
  gasolina: "#9ca3af",
  personal: "#d1d5db",
  otros: "#e5e7eb",
};

export default function DashboardView() {
  const {
    getTotalIncomes,
    getTotalExpenses,
    getTotalDebtPayments,
    getTotalSavingsContributions,
    getRemainingBalance,
    getExpensesByCategory,
    incomes,
    expenses,
    debts,
    savings,
    currentMonth,
    convertToCRC,
    darkMode,
  } = useStore();

  const totalIncomes = getTotalIncomes();
  const totalExpenses = getTotalExpenses();
  const totalDebts = getTotalDebtPayments();
  const totalSavings = getTotalSavingsContributions();
  const remaining = getRemainingBalance();
  const categoryData = getExpensesByCategory();

  const pieData = Object.entries(categoryData)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: EXPENSE_CATEGORY_LABELS[key as ExpenseCategory],
      value,
      color: CATEGORY_COLORS[key as ExpenseCategory],
    }));

  const barData = [
    { name: "Ingresos", value: totalIncomes, fill: "#fb923c" },
    { name: "Gastos", value: totalExpenses, fill: "#9ca3af" },
    { name: "Deudas", value: totalDebts, fill: "#d1d5db" },
    { name: "Ahorros", value: totalSavings, fill: "#fdba74" },
  ];

  // Generate last 6 months trend data
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1 - (5 - i));
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthIncomes = incomes
      .filter((inc) => inc.date.startsWith(monthStr))
      .reduce((s, inc) => s + convertToCRC(inc.amount, inc.currency), 0);
    const monthExpenses = expenses
      .filter((exp) => exp.date.startsWith(monthStr))
      .reduce((s, exp) => s + convertToCRC(exp.amount, exp.currency), 0);
    return {
      month: d.toLocaleDateString("es-CR", { month: "short" }),
      ingresos: monthIncomes,
      gastos: monthExpenses,
    };
  });

  const incomePercent =
    totalIncomes > 0
      ? Math.round(((totalIncomes - totalExpenses - totalDebts) / totalIncomes) * 100)
      : 0;

  // Upcoming debt payments
  const upcomingDebts = debts
    .filter((d) => d.paidMonths < d.totalMonths)
    .slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Ingresos Totales"
          value={formatCRC(totalIncomes)}
          icon={<Wallet className="w-5 h-5" />}
          accentColor="green"
          trend="up"
          trendValue={`${incomes.filter((i) => i.date.startsWith(currentMonth)).length} registros`}
        />
        <StatCard
          title="Gastos Totales"
          value={formatCRC(totalExpenses)}
          icon={<Receipt className="w-5 h-5" />}
          accentColor="red"
          trend="down"
          trendValue={`${expenses.filter((e) => e.date.startsWith(currentMonth)).length} gastos`}
        />
        <StatCard
          title="Cuotas Mensuales"
          value={formatCRC(totalDebts)}
          icon={<CreditCard className="w-5 h-5" />}
          subtitle={`${debts.filter((d) => d.paidMonths < d.totalMonths).length} deudas activas`}
        />
        <StatCard
          title="Salario Restante"
          value={formatCRC(remaining)}
          icon={
            remaining >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )
          }
          accentColor={remaining >= 0 ? "green" : "red"}
          trend={remaining >= 0 ? "up" : "down"}
          trendValue={`${incomePercent}% disponible`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 md:p-6 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Tendencia de 6 meses
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#23262f" : "#f3f4f6"} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} stroke={darkMode ? "#23262f" : "#d1d5db"} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} stroke={darkMode ? "#23262f" : "#d1d5db"} width={45} hide={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: darkMode ? "1px solid #23262f" : "1px solid #e5e7eb",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    backgroundColor: darkMode ? "#181a20" : "#fff",
                    color: darkMode ? "#e5e7eb" : "#374151",
                  }}
                  formatter={(val) => formatCRC(Number(val))}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#fb923c"
                  strokeWidth={2}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 md:p-6 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Distribución de Gastos
          </h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: darkMode ? "1px solid #23262f" : "1px solid #e5e7eb",
                      backgroundColor: darkMode ? "#181a20" : "#fff",
                      color: darkMode ? "#e5e7eb" : "#374151",
                    }}
                    formatter={(val) => formatCRC(Number(val))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              Sin gastos registrados
            </div>
          )}
          <div className="space-y-2 mt-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {formatCRC(item.value)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 md:p-6 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Resumen General
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={barData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#23262f" : "#f3f4f6"} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} stroke={darkMode ? "#23262f" : "#d1d5db"} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? "#9ca3af" : "#6b7280" }} stroke={darkMode ? "#23262f" : "#d1d5db"} width={45} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: darkMode ? "1px solid #23262f" : "1px solid #e5e7eb",
                    backgroundColor: darkMode ? "#181a20" : "#fff",
                    color: darkMode ? "#e5e7eb" : "#374151",
                  }}
                  formatter={(val) => formatCRC(Number(val))}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming payments & savings */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 md:p-6 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Próximos Pagos y Metas
          </h3>
          <div className="space-y-4">
            {upcomingDebts.map((debt) => {
              const progress = (debt.paidMonths / debt.totalMonths) * 100;
              return (
                <div key={debt.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {debt.description}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {debt.paidMonths}/{debt.totalMonths} meses
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-orange-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
            {savings.slice(0, 3).map((saving) => {
              const progress = saving.targetAmount > 0
                ? (saving.currentAmount / saving.targetAmount) * 100
                : 0;
              return (
                <div key={saving.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {saving.description}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-green-400 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
            {upcomingDebts.length === 0 && savings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <DollarSign className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">
                  Agrega deudas o metas de ahorro para ver el progreso aquí
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 md:p-6 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Resumen Rápido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 text-center">
            <p className="text-xs text-orange-400 font-medium mb-1">Ahorro Mensual</p>
            <p className="text-lg font-bold text-orange-500">{formatCRC(totalSavings)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-surface rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 font-medium mb-1">Deudas Activas</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
              {debts.filter((d) => d.paidMonths < d.totalMonths).length}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 text-center">
            <p className="text-xs text-orange-400 font-medium mb-1">Gastos este Mes</p>
            <p className="text-lg font-bold text-orange-500">
              {expenses.filter((e) => e.date.startsWith(currentMonth)).length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-surface rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 font-medium mb-1">Metas de Ahorro</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{savings.length}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
