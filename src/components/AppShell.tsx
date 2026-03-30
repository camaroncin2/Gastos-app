"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import DashboardView from "@/components/views/DashboardView";
import IncomesView from "@/components/views/IncomesView";
import ExpensesView from "@/components/views/ExpensesView";
import DebtsView from "@/components/views/DebtsView";
import SavingsView from "@/components/views/SavingsView";
import VaultView from "@/components/views/VaultView";
import SettingsView from "@/components/views/SettingsView";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  incomes: IncomesView,
  expenses: ExpensesView,
  debts: DebtsView,
  savings: SavingsView,
  vault: VaultView,
  settings: SettingsView,
};

export default function AppShell() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ViewComponent = views[activeView] || DashboardView;

  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Track screen size
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) setMobileMenuOpen(false);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Trigger resize so Recharts ResponsiveContainer recalculates during sidebar transition
  useEffect(() => {
    if (!hydrated) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    [0, 50, 100, 150, 200, 310].forEach((delay) => {
      timeouts.push(setTimeout(() => window.dispatchEvent(new Event("resize")), delay));
    });
    return () => timeouts.forEach(clearTimeout);
  }, [sidebarCollapsed, hydrated]);

  // Close mobile menu on view change
  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (isMobile) setMobileMenuOpen(false);
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-dark-bg">
        <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-dark-bg transition-colors overflow-x-hidden">
      {/* Mobile backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
      />

      <div
        className="flex-1 min-w-0 transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 72 : 260) }}
      >
        <TopBar
          activeView={activeView}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobile={isMobile}
        />

        <main className="p-3 md:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ViewComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
