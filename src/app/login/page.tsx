"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Wallet, Loader2, Sun, Moon, Check, ChevronDown,
  BarChart2, DollarSign, CreditCard, TrendingDown, PiggyBank, Repeat, Shield,
} from "lucide-react";
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

// ── Feature Section ──────────────────────────────────────────────

function FeatureSection({ feature, reversed, index }: { feature: typeof FEATURES[0]; reversed: boolean; index: number }) {
  const { Mockup, Icon } = feature;
  const isEven = index % 2 === 0;
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className={`absolute inset-0 ${isEven ? "skew-y-1" : "-skew-y-1"} bg-gray-50 dark:bg-dark-card/30 -z-10`} />
      <div className="max-w-5xl mx-auto relative">
        <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}>
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
          <motion.div
            initial={{ opacity: 0, x: reversed ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full max-w-md"
          >
            <Mockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">MisGastos</span>
          </a>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleDarkMode}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            <a href="#auth" onClick={() => setMode("login")}
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
          <div className="w-20 h-20 rounded-3xl bg-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Toma el control de<br /><span className="text-orange-500">tus finanzas</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Registra ingresos, gastos, deudas, ahorros y suscripciones en un solo lugar. Gratis, privado y siempre disponible.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="#auth" onClick={() => setMode("register")}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
              Crear cuenta gratis
            </a>
            <a href="#auth" onClick={() => setMode("login")}
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

      {/* ── Auth Section ── */}
      <section id="auth" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -skew-y-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/5 -z-10" />
        <div className="max-w-sm mx-auto relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comienza hoy</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gratis, sin tarjeta de crédito</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6">
            <div className="flex rounded-xl bg-gray-100 dark:bg-dark-surface p-1 mb-6">
              {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === m ? "bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
                  {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete={mode === "register" ? "new-password" : "current-password"}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? "Entrar" : "Crear cuenta"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-sm text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-dark-border">
        MisGastos © {new Date().getFullYear()} · Control de Finanzas Personales
      </footer>
    </div>
  );
}
