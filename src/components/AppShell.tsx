"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import DashboardView from "@/components/views/DashboardView";
import IncomesView from "@/components/views/IncomesView";
import ExpensesView from "@/components/views/ExpensesView";
import DebtsView from "@/components/views/DebtsView";
import LoansView from "@/components/views/LoansView";
import SavingsView from "@/components/views/SavingsView";
import VaultView from "@/components/views/VaultView";
import SettingsView from "@/components/views/SettingsView";
import SubscriptionsView from "@/components/views/SubscriptionsView";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import FloatingCalculator from "@/components/ui/FloatingCalculator";
import FloatingCalendar from "@/components/ui/FloatingCalendar";

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  incomes: IncomesView,
  expenses: ExpensesView,
  debts: DebtsView,
  loans: LoansView,
  savings: SavingsView,
  subscriptions: SubscriptionsView,
  vault: VaultView,
  settings: SettingsView,
};

export default function AppShell() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const ViewComponent = views[activeView] || DashboardView;
  const isReady = useStore((s) => s._ready);
  const [slowConnect, setSlowConnect] = useState(false);

  useEffect(() => {
    if (isReady) setHydrated(true);
  }, [isReady]);

  // If loading takes a while (e.g. the server is down), show a clear message
  // instead of a bare spinner — the app never shows empty data in this state.
  useEffect(() => {
    if (hydrated) return;
    const t = setTimeout(() => setSlowConnect(true), 8000);
    return () => clearTimeout(t);
  }, [hydrated]);

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

  // Trigger resize so Recharts recalculates after sidebar transition ends
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
    return () => clearTimeout(t);
  }, [sidebarCollapsed, hydrated]);

  // Close mobile menu on view change
  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (isMobile) setMobileMenuOpen(false);
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 dark:bg-dark-bg gap-4 px-6 text-center">
        <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Conectando con tus datos…</p>
        {slowConnect && (
          <div className="max-w-xs space-y-3">
            <p className="text-xs text-gray-400">
              Está tardando más de lo normal. Verificá que tu servidor esté encendido y con internet. Reintentando automáticamente…
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
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
        className="flex-1 min-w-0 transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[margin-left]"
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

      <FloatingCalculator open={calcOpen} onToggle={() => setCalcOpen(o => !o)} />
      <FloatingCalendar open={calOpen} onToggle={() => setCalOpen(o => !o)} calcOpen={calcOpen} />
    </div>
  );
}
