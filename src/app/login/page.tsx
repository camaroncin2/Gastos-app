"use client";

import { motion } from "framer-motion";
import {
  Sun, Moon, Check, ChevronDown,
  BarChart2, DollarSign, CreditCard, TrendingDown, PiggyBank, Repeat, Shield,
} from "lucide-react";
import Image from "next/image";
import { useStore } from "@/store/useStore";

// ── Browser Frame wrapper ────────────────────────────────────────

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white dark:bg-gray-700 rounded-md mx-4 px-3 py-0.5 text-xs text-gray-400 text-center">
          mypersonalgastos.lat
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900">{children}</div>
    </div>
  );
}

// ── Mockup Components ────────────────────────────────────────────

function DashboardMock() {
  return (
    <BrowserFrame>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Ingresos", value: "₡850,000", color: "text-green-500" },
            { label: "Gastos", value: "₡420,000", color: "text-red-500" },
            { label: "Balance", value: "₡430,000", color: "text-blue-500" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 mb-2">Gastos por categoría</p>
          <div className="space-y-2">
            {[
              { label: "Casa", pct: 70, color: "bg-blue-400" },
              { label: "Personal", pct: 45, color: "bg-orange-400" },
              { label: "Gasolina", pct: 30, color: "bg-green-400" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-14">{b.label}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 items-end justify-center px-2 h-14">
          {[35, 55, 30, 70, 45, 60, 50].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-orange-400/70" style={{ height: `${h * 0.8}%` }} />
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function IngresosMock() {
  return (
    <BrowserFrame>
      <div className="space-y-2">
        {[
          { name: "Salario", amount: "₡650,000", date: "01/04", emoji: "💼" },
          { name: "Freelance", amount: "₡150,000", date: "10/04", emoji: "💻" },
          { name: "Inversión", amount: "₡50,000", date: "15/04", emoji: "📈" },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-base">{item.emoji}</div>
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.name}</p>
                <p className="text-[10px] text-gray-400">{item.date}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-green-500">+{item.amount}</span>
          </div>
        ))}
        <div className="text-center pt-1">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total: </span>
          <span className="text-xs font-bold text-green-500">₡850,000</span>
        </div>
      </div>
    </BrowserFrame>
  );
}

function GastosMock() {
  return (
    <BrowserFrame>
      <div className="space-y-2">
        {[
          { cat: "Casa", name: "Alquiler", amount: "₡250,000", tag: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" },
          { cat: "Personal", name: "Supermercado", amount: "₡85,000", tag: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400" },
          { cat: "Gasolina", name: "RECOPE", amount: "₡40,000", tag: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" },
          { cat: "Tarjeta", name: "Amazon", amount: "₡55,000", tag: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.tag}`}>{item.cat}</span>
              <span className="text-xs text-gray-700 dark:text-gray-200">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-red-500">-{item.amount}</span>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

function DeudasMock() {
  return (
    <BrowserFrame>
      <div className="space-y-3">
        {[
          { name: "Tarjeta Visa", paid: 8, total: 12, monthly: "₡35,000", color: "#f97316" },
          { name: "Préstamo banco", paid: 24, total: 48, monthly: "₡80,000", color: "#3b82f6" },
          { name: "Crédito muebles", paid: 3, total: 18, monthly: "₡20,000", color: "#10b981" },
        ].map((d) => (
          <div key={d.name} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{d.name}</span>
              <span className="text-[10px] text-gray-400">{d.paid}/{d.total} meses</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
              <div className="h-1.5 rounded-full" style={{ width: `${(d.paid / d.total) * 100}%`, backgroundColor: d.color }} />
            </div>
            <span className="text-[10px] text-gray-400">Cuota: {d.monthly}/mes</span>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

function AhorrosMock() {
  return (
    <BrowserFrame>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Vacaciones", saved: 180000, goal: 300000, color: "#10b981", emoji: "✈️" },
          { name: "Emergencia", saved: 500000, goal: 1000000, color: "#8b5cf6", emoji: "🛡️" },
          { name: "Computadora", saved: 120000, goal: 400000, color: "#f97316", emoji: "💻" },
          { name: "Auto", saved: 800000, goal: 5000000, color: "#3b82f6", emoji: "🚗" },
        ].map((s) => {
          const pct = Math.round((s.saved / s.goal) * 100);
          const dash = (pct / 100) * 100;
          return (
            <div key={s.name} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <div className="relative w-12 h-12 mx-auto mb-1.5">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={s.color} strokeWidth="3.5"
                    strokeDasharray={`${dash} ${100 - dash}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm">{s.emoji}</span>
              </div>
              <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">{s.name}</p>
              <p className="text-[10px] font-bold" style={{ color: s.color }}>{pct}%</p>
            </div>
          );
        })}
      </div>
    </BrowserFrame>
  );
}

function SuscripcionesMock() {
  return (
    <BrowserFrame>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5 text-center">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">₡29,700</p>
            <p className="text-[10px] text-gray-400">mensual</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 text-center">
            <p className="text-sm font-bold text-green-600 dark:text-green-400">₡356,400</p>
            <p className="text-[10px] text-gray-400">anual</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: "Netflix", color: "bg-red-500", days: 12 },
            { name: "Spotify", color: "bg-green-500", days: 5 },
            { name: "YouTube", color: "bg-red-600", days: 20 },
            { name: "iCloud", color: "bg-blue-400", days: 8 },
            { name: "Adobe CC", color: "bg-red-700", days: 3 },
            { name: "GitHub", color: "bg-gray-700", days: 15 },
          ].map((s) => (
            <div key={s.name} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
              <div className={`w-7 h-7 rounded-lg ${s.color} mx-auto mb-1 flex items-center justify-center`}>
                <Repeat className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[9px] font-semibold text-gray-700 dark:text-gray-200">{s.name}</p>
              <p className="text-[9px] text-gray-400">{s.days}d</p>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function BovedaMock() {
  return (
    <BrowserFrame>
      <div className="space-y-2">
        <div className="flex flex-col items-center py-3 gap-2">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Bóveda desbloqueada</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((d) => (
              <div key={d} className="w-2 h-2 rounded-full bg-orange-400" />
            ))}
          </div>
        </div>
        {[
          "PIN tarjeta débito",
          "Cuenta SINPE móvil",
          "Contraseña del banco",
        ].map((name) => (
          <div key={name} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Shield className="w-3 h-3 text-orange-500" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-300">{name}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-200 dark:text-gray-700 blur-[3px] select-none">••••••••</span>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

// ── Features data ────────────────────────────────────────────────

const FEATURES = [
  {
    id: "dashboard", title: "Dashboard", subtitle: "Todo en un vistazo",
    description: "Ve un resumen completo de tus finanzas del mes: balance disponible, gráficas de distribución por categoría y alertas sobre vencimientos importantes.",
    points: ["Balance mensual actualizado en tiempo real", "Gráfica de distribución por categorías", "Alertas de deudas y vencimientos próximos"],
    Icon: BarChart2, Mockup: DashboardMock,
  },
  {
    id: "ingresos", title: "Ingresos", subtitle: "Registra todo lo que entra",
    description: "Agrega todos tus fuentes de ingreso con descripción, fecha y moneda. Soporte para colones, dólares y euros con conversión automática al tipo de cambio.",
    points: ["Múltiples monedas: CRC, USD, EUR", "Ingresos recurrentes automáticos", "Historial completo filtrado por mes"],
    Icon: DollarSign, Mockup: IngresosMock,
  },
  {
    id: "gastos", title: "Gastos", subtitle: "Controla todo lo que sale",
    description: "Registra cada gasto y clasifícalo en categorías. Descubre en qué gastas más y toma mejores decisiones financieras mes a mes.",
    points: ["Categorías: casa, personal, gasolina, tarjeta, otros", "Gastos recurrentes automáticos", "Comparativas mensuales por categoría"],
    Icon: CreditCard, Mockup: GastosMock,
  },
  {
    id: "deudas", title: "Deudas & Préstamos", subtitle: "Sin sorpresas al final del mes",
    description: "Rastrea el progreso de cada deuda o préstamo activo. Visualiza cuántos meses faltan y el impacto exacto en tu balance mensual disponible.",
    points: ["Progreso visual de cada deuda", "Registro de pagos y abonos recibidos", "Impacto calculado en balance mensual"],
    Icon: TrendingDown, Mockup: DeudasMock,
  },
  {
    id: "ahorros", title: "Ahorros", subtitle: "Alcanza tus metas financieras",
    description: "Crea metas de ahorro con objetivos y plazos definidos. Registra abonos periódicos y sigue tu progreso con gráficas circulares en tiempo real.",
    points: ["Metas con fecha objetivo y monto", "Contribuciones mensuales automáticas", "Progreso visual circular por meta"],
    Icon: PiggyBank, Mockup: AhorrosMock,
  },
  {
    id: "suscripciones", title: "Suscripciones", subtitle: "Nada se te escapa",
    description: "Centraliza todas tus suscripciones digitales. Ve de un vistazo cuánto gastas mensual y anualmente en streaming, software, gaming y más.",
    points: ["Resumen total mensual y anual en CRC", "Ciclos: semanal, mensual, anual", "Contador de días hasta próximo cobro"],
    Icon: Repeat, Mockup: SuscripcionesMock,
  },
  {
    id: "boveda", title: "Bóveda Segura", subtitle: "Tus secretos, protegidos",
    description: "Guarda información sensible como PINs, contraseñas y notas privadas protegidas con tu PIN personal. Solo tú tienes acceso.",
    points: ["Protección con PIN personal de 4 dígitos", "Visualización bajo demanda con candado", "Datos guardados de forma cifrada"],
    Icon: Shield, Mockup: BovedaMock,
  },
];

// ── Palette per section index ───────────────────────────────────
const SECTION_PALETTES = [
  { panel: "bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/25 dark:to-amber-900/10", dot1: "bg-orange-300/40", dot2: "bg-amber-200/40" },
  { panel: "bg-gradient-to-br from-blue-100 to-sky-50 dark:from-blue-900/25 dark:to-sky-900/10",       dot1: "bg-blue-300/40",  dot2: "bg-sky-200/40" },
  { panel: "bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-900/25 dark:to-pink-900/10",     dot1: "bg-rose-300/40", dot2: "bg-pink-200/40" },
  { panel: "bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/25 dark:to-emerald-900/10", dot1: "bg-green-300/40", dot2: "bg-emerald-200/40" },
  { panel: "bg-gradient-to-br from-purple-100 to-violet-50 dark:from-purple-900/25 dark:to-violet-900/10", dot1: "bg-purple-300/40", dot2: "bg-violet-200/40" },
  { panel: "bg-gradient-to-br from-teal-100 to-cyan-50 dark:from-teal-900/25 dark:to-cyan-900/10",     dot1: "bg-teal-300/40",  dot2: "bg-cyan-200/40" },
  { panel: "bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/25 dark:to-blue-900/10", dot1: "bg-indigo-300/40", dot2: "bg-blue-200/40" },
];

// ── Feature Section ──────────────────────────────────────────────

function FeatureSection({ feature, reversed, index }: { feature: typeof FEATURES[0]; reversed: boolean; index: number }) {
  const { Mockup, Icon } = feature;
  const palette = SECTION_PALETTES[index % SECTION_PALETTES.length];
  return (
    <section className="py-16 px-6 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-20`}>

          {/* ── Text column ── */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold">
              <Icon className="w-3.5 h-3.5" />
              {feature.title}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{feature.subtitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            <ul className="space-y-2.5">
              {feature.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-orange-500" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Visual column: large colored panel + mockup card inside ── */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full"
          >
            {/* Large decorative panel (the "green" area in the sketch) */}
            <div className={`relative rounded-3xl ${palette.panel} p-6 md:p-10 overflow-hidden`}>
              {/* Background accent circles */}
              <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full ${palette.dot1} blur-2xl`} />
              <div className={`absolute -bottom-10 -left-10 w-36 h-36 rounded-full ${palette.dot2} blur-2xl`} />
              {/* Browser-frame card (the "blue" box in the sketch) */}
              <div className="relative z-10">
                <Mockup />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function LandingPage() {
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              <Image src={darkMode ? "/logo-dark.jpg" : "/logo-light.jpg"} alt="MisGastos" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">MisGastos</span>
          </a>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleDarkMode}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            <a href="/auth"
              className="px-4 py-1.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">
              Iniciar sesión
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 -skew-y-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/5 -z-10" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-6 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
            <Image src={darkMode ? "/logo-dark.jpg" : "/logo-light.jpg"} alt="MisGastos" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Toma el control de<br /><span className="text-orange-500">tus finanzas</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Registra ingresos, gastos, deudas, ahorros y suscripciones en un solo lugar. Gratis, privado y siempre disponible.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/auth?mode=register"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
              Crear cuenta gratis
            </a>
            <a href="/auth?mode=login"
              className="px-6 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
              Ya tengo cuenta
            </a>
          </div>
          <a href="#features" className="mt-12 inline-flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors">
            <span className="text-sm">Ver características</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </section>

      {/* ── Feature Sections ── */}
      <div id="features">
        {FEATURES.map((feature, i) => (
          <FeatureSection key={feature.id} feature={feature} reversed={i % 2 !== 0} index={i} />
        ))}
      </div>

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-sm text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-dark-border">
        MisGastos © {new Date().getFullYear()} · Control de Finanzas Personales
      </footer>
    </div>
  );
}
