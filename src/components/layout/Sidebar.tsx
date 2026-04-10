"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Repeat,
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "incomes", label: "Ingresos", icon: Wallet },
  { id: "expenses", label: "Gastos", icon: Receipt },
  { id: "debts", label: "Deudas", icon: CreditCard },
  { id: "loans", label: "Préstamos", icon: HandCoins },
  { id: "savings", label: "Ahorros", icon: PiggyBank },
  { id: "subscriptions", label: "Suscripciones", icon: Repeat },
  { id: "vault", label: "Bóveda", icon: ShieldCheck },
  { id: "settings", label: "Configuración", icon: Settings },
];

export default function Sidebar({ activeView, onViewChange, collapsed, onToggleCollapse, isMobile, mobileOpen }: SidebarProps) {
  const sidebarWidth = isMobile ? 260 : (collapsed ? 72 : 260);
  const darkMode = useStore((s) => s.darkMode);

  return (
    <aside
      style={{ width: sidebarWidth }}
      className={`h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col fixed left-0 top-0 z-40 transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden will-change-[width] ${
        isMobile
          ? mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : ""
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 dark:border-dark-border">
        <motion.div
          whileHover={{ rotate: 10 }}
          className="w-9 h-9 rounded-xl overflow-hidden shrink-0"
        >
          <Image
            src={darkMode ? "/logo-dark.jpg" : "/logo-light.jpg"}
            alt="MisGastos"
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <span
          className={`text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap transition-opacity duration-200 ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          MisGastos
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${
                isActive
                  ? "text-orange-500 bg-orange-50 dark:bg-orange-500/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-surface"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-400 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 shrink-0" />
              <span
                className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                  collapsed ? "opacity-0" : "opacity-100"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse toggle - desktop only */}
      {!isMobile && (
        <div className="px-3 pb-4">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center py-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
