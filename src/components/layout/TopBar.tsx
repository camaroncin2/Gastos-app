"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { getMonthName } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Bell, Sun, Moon, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NotificationsPanel, { useNotifications } from "@/components/ui/NotificationsPanel";

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  incomes: "Gestión de Ingresos",
  expenses: "Gestión de Gastos",
  debts: "Control de Deudas",
  loans: "Control de Préstamos",
  savings: "Módulo de Ahorros",
  vault: "Bóveda Segura",
  settings: "Configuración",
};

const VIEW_TITLES_SHORT: Record<string, string> = {
  dashboard: "Dashboard",
  incomes: "Ingresos",
  expenses: "Gastos",
  debts: "Deudas",
  loans: "Préstamos",
  savings: "Ahorros",
  vault: "Bóveda",
  settings: "Ajustes",
};

interface TopBarProps {
  activeView: string;
  onMenuToggle: () => void;
  isMobile: boolean;
}

export default function TopBar({ activeView, onMenuToggle, isMobile }: TopBarProps) {
  const router = useRouter();
  const { currentMonth, setCurrentMonth, darkMode, toggleDarkMode, dismissedNotifications, userName } = useStore(useShallow((s) => ({
    currentMonth: s.currentMonth,
    setCurrentMonth: s.setCurrentMonth,
    darkMode: s.darkMode,
    toggleDarkMode: s.toggleDarkMode,
    dismissedNotifications: s.dismissedNotifications,
    userName: s.userName,
  })));
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };
  const allNotifications = useNotifications();
  const visibleCount = allNotifications.filter((n) => !dismissedNotifications.includes(n.id)).length;

  const navigateMonth = (direction: number) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction);
    const newMonth = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
  };

  return (
    <header className="bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border transition-colors relative">
      {/* Row 1: hamburger + title + actions */}
      <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8">
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburger menu - mobile only */}
          {isMobile && (
            <button
              onClick={onMenuToggle}
              className="p-2 -ml-1 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
            {isMobile ? (VIEW_TITLES_SHORT[activeView] || "Dashboard") : (VIEW_TITLES[activeView] || "Dashboard")}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {/* Dark mode toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="relative p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface text-gray-400 dark:text-gray-300 transition-colors"
            title={darkMode ? "Modo claro" : "Modo noche"}
          >
            <motion.div
              key={darkMode ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface text-gray-400 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {visibleCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[9px] font-bold bg-orange-400 text-white rounded-full">
                  {visibleCount}
                </span>
              )}
            </motion.button>
            <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Avatar + logout — visible on all screen sizes */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs md:text-sm font-bold text-orange-500">{userName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "U"}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-1.5 md:p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Row 2: Month selector - separate row on mobile for breathing room */}
      <div className="flex items-center justify-center px-3 md:px-8 pb-2 md:pb-0 md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2 md:h-16">
        <div className="flex items-center gap-1.5 md:gap-2 bg-gray-50 dark:bg-dark-surface rounded-xl px-2 md:px-3 py-1.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border text-gray-500 dark:text-gray-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-[120px] md:min-w-[140px] text-center capitalize">
            {getMonthName(currentMonth)}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(1)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border text-gray-500 dark:text-gray-400"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
