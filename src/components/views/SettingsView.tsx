<<<<<<< Updated upstream
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Settings, RefreshCw, Save, User, Lock, Download, Upload, RotateCw, CheckCircle, AlertTriangle, Wifi, Loader2 } from "lucide-react";

async function fetchLiveRates(): Promise<{ USD_TO_CRC: number; EUR_TO_CRC: number } | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/CRC");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result !== "success" || !data.rates) return null;
    // API returns CRC as base — we need inverse: how many CRC per 1 USD/EUR
    const usdRate = data.rates["USD"];
    const eurRate = data.rates["EUR"];
    if (!usdRate || !eurRate) return null;
    return {
      USD_TO_CRC: Math.round((1 / usdRate) * 100) / 100,
      EUR_TO_CRC: Math.round((1 / eurRate) * 100) / 100,
    };
  } catch {
    return null;
  }
}

export default function SettingsView() {
  const { exchangeRates, setExchangeRates, lastRatesUpdate, userName, setUserName, vaultPin, setVaultPin, exportData, importData, generateRecurring } = useStore();
  const [rates, setRates] = useState({ USD_TO_CRC: exchangeRates.USD_TO_CRC.toString(), EUR_TO_CRC: exchangeRates.EUR_TO_CRC.toString() });
  const [name, setName] = useState(userName);
  const [pinForm, setPinForm] = useState({ current: "", newPin: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [importMsg, setImportMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [recurringMsg, setRecurringMsg] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [rateMsg, setRateMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFetchLiveRates = useCallback(async (silent = false) => {
    setFetchingRates(true);
    setRateMsg(null);
    const live = await fetchLiveRates();
    setFetchingRates(false);
    if (live) {
      setRates({ USD_TO_CRC: live.USD_TO_CRC.toString(), EUR_TO_CRC: live.EUR_TO_CRC.toString() });
      setExchangeRates(live);
      if (!silent) setRateMsg({ type: "ok", text: `Tipos de cambio actualizados: $1 = ₡${live.USD_TO_CRC}, €1 = ₡${live.EUR_TO_CRC}` });
    } else {
      if (!silent) setRateMsg({ type: "err", text: "No se pudo obtener el tipo de cambio. Intenta más tarde." });
    }
    if (!silent) setTimeout(() => setRateMsg(null), 5000);
  }, [setExchangeRates]);

  // Auto-fetch if rates are stale (>24h) or never fetched
  useEffect(() => {
    if (!lastRatesUpdate) { handleFetchLiveRates(true); return; }
    const elapsed = Date.now() - new Date(lastRatesUpdate).getTime();
    if (elapsed > 24 * 60 * 60 * 1000) handleFetchLiveRates(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveRates = () => {
    setExchangeRates({ USD_TO_CRC: parseFloat(rates.USD_TO_CRC) || 510, EUR_TO_CRC: parseFloat(rates.EUR_TO_CRC) || 555 });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveName = () => {
    if (name.trim()) { setUserName(name.trim()); setNameSaved(true); setTimeout(() => setNameSaved(false), 2000); }
  };

  const handleChangePin = () => {
    setPinMsg(null);
    if (pinForm.current !== vaultPin) { setPinMsg({ type: "err", text: "PIN actual incorrecto" }); return; }
    if (pinForm.newPin.length < 4) { setPinMsg({ type: "err", text: "El nuevo PIN debe tener al menos 4 caracteres" }); return; }
    if (pinForm.newPin !== pinForm.confirm) { setPinMsg({ type: "err", text: "Los PINs no coinciden" }); return; }
    setVaultPin(pinForm.newPin);
    setPinForm({ current: "", newPin: "", confirm: "" });
    setPinMsg({ type: "ok", text: "PIN actualizado correctamente" });
    setTimeout(() => setPinMsg(null), 3000);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `misgastos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importData(text)) setImportMsg({ type: "ok", text: "Datos importados correctamente" });
      else setImportMsg({ type: "err", text: "Archivo inválido" });
      setTimeout(() => setImportMsg(null), 3000);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRecurring = () => {
    generateRecurring();
    setRecurringMsg(true);
    setTimeout(() => setRecurringMsg(false), 3000);
  };

  const cardClass = "bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 transition-colors";
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent";

  return (
    <div className="max-w-2xl space-y-6">
      {/* User Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><User className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Perfil de Usuario</h3>
            <p className="text-xs text-gray-400">Tu nombre aparecerá en el avatar del menú</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={inputClass} />
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSaveName}
            className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm whitespace-nowrap">
            {nameSaved ? "¡Guardado!" : "Guardar"}
          </motion.button>
        </div>
      </motion.div>

      {/* Vault PIN */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><Lock className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">PIN de la Bóveda</h3>
            <p className="text-xs text-gray-400">Cambia el PIN para acceder a la bóveda segura</p>
          </div>
        </div>
        <div className="space-y-3">
          <input type="password" value={pinForm.current} onChange={(e) => setPinForm({ ...pinForm, current: e.target.value })} placeholder="PIN actual" maxLength={10} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input type="password" value={pinForm.newPin} onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })} placeholder="Nuevo PIN" maxLength={10} className={inputClass} />
            <input type="password" value={pinForm.confirm} onChange={(e) => setPinForm({ ...pinForm, confirm: e.target.value })} placeholder="Confirmar PIN" maxLength={10} className={inputClass} />
          </div>
          {pinMsg && (
            <div className={`flex items-center gap-2 text-xs ${pinMsg.type === "ok" ? "text-green-500" : "text-red-400"}`}>
              {pinMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {pinMsg.text}
            </div>
          )}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleChangePin}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
            <Lock className="w-4 h-4" />Cambiar PIN
          </motion.button>
        </div>
      </motion.div>

      {/* Exchange Rates */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><RefreshCw className="w-5 h-5" /></div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Tipo de Cambio</h3>
            <p className="text-xs text-gray-400">Se actualiza automáticamente cada 24 horas con datos en tiempo real</p>
          </div>
        </div>
        {rateMsg && (
          <div className={`flex items-center gap-2 text-xs mb-4 ${rateMsg.type === "ok" ? "text-green-500" : "text-red-400"}`}>
            {rateMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {rateMsg.text}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">1 USD = ? CRC</label>
            <input type="number" step="0.01" value={rates.USD_TO_CRC} onChange={(e) => setRates({ ...rates, USD_TO_CRC: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">1 EUR = ? CRC</label>
            <input type="number" step="0.01" value={rates.EUR_TO_CRC} onChange={(e) => setRates({ ...rates, EUR_TO_CRC: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSaveRates}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
            <Save className="w-4 h-4" />{saved ? "¡Guardado!" : "Guardar manual"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => handleFetchLiveRates(false)} disabled={fetchingRates}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium rounded-xl transition-colors text-sm">
            {fetchingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
            {fetchingRates ? "Consultando..." : "Actualizar en vivo"}
          </motion.button>
        </div>
        {lastRatesUpdate && (
          <p className="mt-3 text-[11px] text-gray-400">
            Última actualización: {new Date(lastRatesUpdate).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </motion.div>

      {/* Recurring */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><RotateCw className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Ingresos y Gastos Recurrentes</h3>
            <p className="text-xs text-gray-400">Genera automáticamente los registros marcados como recurrentes para el mes actual</p>
          </div>
        </div>
        {recurringMsg && <p className="text-xs text-green-500 mb-3 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Registros generados para el mes actual</p>}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleRecurring}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
          <RotateCw className="w-4 h-4" />Generar Recurrentes
        </motion.button>
      </motion.div>

      {/* Export / Import */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><Download className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Respaldo de Datos</h3>
            <p className="text-xs text-gray-400">Exporta o importa tus datos en formato JSON</p>
          </div>
        </div>
        {importMsg && (
          <div className={`flex items-center gap-2 text-xs mb-3 ${importMsg.type === "ok" ? "text-green-500" : "text-red-400"}`}>
            {importMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {importMsg.text}
          </div>
        )}
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
            <Download className="w-4 h-4" />Exportar
          </motion.button>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-600 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm">
            <Upload className="w-4 h-4" />Importar
          </motion.button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </motion.div>

      {/* App Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface text-gray-400"><Settings className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Información de la App</h3>
            <p className="text-xs text-gray-400">MisGastos v1.0</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Los datos se almacenan localmente en tu navegador usando LocalStorage.</p>
          <p>Las contraseñas de la bóveda se encriptan con AES-256.</p>
          <p>Todos los cálculos multimoneda se hacen en tiempo real.</p>
        </div>
      </motion.div>
    </div>
  );
}
=======
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { motion } from "framer-motion";
import { Settings, RefreshCw, Save, User, Lock, Download, Upload, RotateCw, CheckCircle, AlertTriangle, Wifi, Loader2 } from "lucide-react";

async function fetchLiveRates(): Promise<{ USD_TO_CRC: number; EUR_TO_CRC: number } | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/CRC");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result !== "success" || !data.rates) return null;
    // API returns CRC as base — we need inverse: how many CRC per 1 USD/EUR
    const usdRate = data.rates["USD"];
    const eurRate = data.rates["EUR"];
    if (!usdRate || !eurRate) return null;
    return {
      USD_TO_CRC: Math.round((1 / usdRate) * 100) / 100,
      EUR_TO_CRC: Math.round((1 / eurRate) * 100) / 100,
    };
  } catch {
    return null;
  }
}

export default function SettingsView() {
  const { exchangeRates, setExchangeRates, lastRatesUpdate, userName, setUserName, vaultPin, setVaultPin, exportData, importData, generateRecurring } = useStore(useShallow((s) => ({
    exchangeRates: s.exchangeRates,
    setExchangeRates: s.setExchangeRates,
    lastRatesUpdate: s.lastRatesUpdate,
    userName: s.userName,
    setUserName: s.setUserName,
    vaultPin: s.vaultPin,
    setVaultPin: s.setVaultPin,
    exportData: s.exportData,
    importData: s.importData,
    generateRecurring: s.generateRecurring,
  })));
  const [rates, setRates] = useState({ USD_TO_CRC: exchangeRates.USD_TO_CRC.toString(), EUR_TO_CRC: exchangeRates.EUR_TO_CRC.toString() });
  const [name, setName] = useState(userName);
  const [pinForm, setPinForm] = useState({ current: "", newPin: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [importMsg, setImportMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [recurringMsg, setRecurringMsg] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [rateMsg, setRateMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFetchLiveRates = useCallback(async (silent = false) => {
    setFetchingRates(true);
    setRateMsg(null);
    const live = await fetchLiveRates();
    setFetchingRates(false);
    if (live) {
      setRates({ USD_TO_CRC: live.USD_TO_CRC.toString(), EUR_TO_CRC: live.EUR_TO_CRC.toString() });
      setExchangeRates(live);
      if (!silent) setRateMsg({ type: "ok", text: `Tipos de cambio actualizados: $1 = ₡${live.USD_TO_CRC}, €1 = ₡${live.EUR_TO_CRC}` });
    } else {
      if (!silent) setRateMsg({ type: "err", text: "No se pudo obtener el tipo de cambio. Intenta más tarde." });
    }
    if (!silent) setTimeout(() => setRateMsg(null), 5000);
  }, [setExchangeRates]);

  // Auto-fetch if rates are stale (>24h) or never fetched
  useEffect(() => {
    if (!lastRatesUpdate) { handleFetchLiveRates(true); return; }
    const elapsed = Date.now() - new Date(lastRatesUpdate).getTime();
    if (elapsed > 24 * 60 * 60 * 1000) handleFetchLiveRates(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveRates = () => {
    setExchangeRates({ USD_TO_CRC: parseFloat(rates.USD_TO_CRC) || 510, EUR_TO_CRC: parseFloat(rates.EUR_TO_CRC) || 555 });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveName = () => {
    if (name.trim()) { setUserName(name.trim()); setNameSaved(true); setTimeout(() => setNameSaved(false), 2000); }
  };

  const handleChangePin = () => {
    setPinMsg(null);
    if (pinForm.current !== vaultPin) { setPinMsg({ type: "err", text: "PIN actual incorrecto" }); return; }
    if (pinForm.newPin.length < 4) { setPinMsg({ type: "err", text: "El nuevo PIN debe tener al menos 4 caracteres" }); return; }
    if (pinForm.newPin !== pinForm.confirm) { setPinMsg({ type: "err", text: "Los PINs no coinciden" }); return; }
    setVaultPin(pinForm.newPin);
    setPinForm({ current: "", newPin: "", confirm: "" });
    setPinMsg({ type: "ok", text: "PIN actualizado correctamente" });
    setTimeout(() => setPinMsg(null), 3000);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `misgastos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importData(text)) setImportMsg({ type: "ok", text: "Datos importados correctamente" });
      else setImportMsg({ type: "err", text: "Archivo inválido" });
      setTimeout(() => setImportMsg(null), 3000);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRecurring = () => {
    generateRecurring();
    setRecurringMsg(true);
    setTimeout(() => setRecurringMsg(false), 3000);
  };

  const cardClass = "bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 transition-colors";
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border dark:bg-dark-surface dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent";

  return (
    <div className="max-w-2xl space-y-6">
      {/* User Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><User className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Perfil de Usuario</h3>
            <p className="text-xs text-gray-400">Tu nombre aparecerá en el avatar del menú</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={inputClass} />
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSaveName}
            className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm whitespace-nowrap">
            {nameSaved ? "¡Guardado!" : "Guardar"}
          </motion.button>
        </div>
      </motion.div>

      {/* Vault PIN */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><Lock className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">PIN de la Bóveda</h3>
            <p className="text-xs text-gray-400">Cambia el PIN para acceder a la bóveda segura</p>
          </div>
        </div>
        <div className="space-y-3">
          <input type="password" value={pinForm.current} onChange={(e) => setPinForm({ ...pinForm, current: e.target.value })} placeholder="PIN actual" maxLength={10} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input type="password" value={pinForm.newPin} onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })} placeholder="Nuevo PIN" maxLength={10} className={inputClass} />
            <input type="password" value={pinForm.confirm} onChange={(e) => setPinForm({ ...pinForm, confirm: e.target.value })} placeholder="Confirmar PIN" maxLength={10} className={inputClass} />
          </div>
          {pinMsg && (
            <div className={`flex items-center gap-2 text-xs ${pinMsg.type === "ok" ? "text-green-500" : "text-red-400"}`}>
              {pinMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {pinMsg.text}
            </div>
          )}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleChangePin}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
            <Lock className="w-4 h-4" />Cambiar PIN
          </motion.button>
        </div>
      </motion.div>

      {/* Exchange Rates */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><RefreshCw className="w-5 h-5" /></div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Tipo de Cambio</h3>
            <p className="text-xs text-gray-400">Se actualiza automáticamente cada 24 horas con datos en tiempo real</p>
          </div>
        </div>
        {rateMsg && (
          <div className={`flex items-center gap-2 text-xs mb-4 ${rateMsg.type === "ok" ? "text-green-500" : "text-red-400"}`}>
            {rateMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {rateMsg.text}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">1 USD = ? CRC</label>
            <input type="number" step="0.01" value={rates.USD_TO_CRC} onChange={(e) => setRates({ ...rates, USD_TO_CRC: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">1 EUR = ? CRC</label>
            <input type="number" step="0.01" value={rates.EUR_TO_CRC} onChange={(e) => setRates({ ...rates, EUR_TO_CRC: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSaveRates}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
            <Save className="w-4 h-4" />{saved ? "¡Guardado!" : "Guardar manual"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => handleFetchLiveRates(false)} disabled={fetchingRates}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium rounded-xl transition-colors text-sm">
            {fetchingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
            {fetchingRates ? "Consultando..." : "Actualizar en vivo"}
          </motion.button>
        </div>
        {lastRatesUpdate && (
          <p className="mt-3 text-[11px] text-gray-400">
            Última actualización: {new Date(lastRatesUpdate).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </motion.div>

      {/* Recurring */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><RotateCw className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Ingresos y Gastos Recurrentes</h3>
            <p className="text-xs text-gray-400">Genera automáticamente los registros marcados como recurrentes para el mes actual</p>
          </div>
        </div>
        {recurringMsg && <p className="text-xs text-green-500 mb-3 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Registros generados para el mes actual</p>}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleRecurring}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
          <RotateCw className="w-4 h-4" />Generar Recurrentes
        </motion.button>
      </motion.div>

      {/* Export / Import */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><Download className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Respaldo de Datos</h3>
            <p className="text-xs text-gray-400">Exporta o importa tus datos en formato JSON</p>
          </div>
        </div>
        {importMsg && (
          <div className={`flex items-center gap-2 text-xs mb-3 ${importMsg.type === "ok" ? "text-green-500" : "text-red-400"}`}>
            {importMsg.type === "ok" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {importMsg.text}
          </div>
        )}
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors text-sm">
            <Download className="w-4 h-4" />Exportar
          </motion.button>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-600 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm">
            <Upload className="w-4 h-4" />Importar
          </motion.button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </motion.div>

      {/* App Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface text-gray-400"><Settings className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Información de la App</h3>
            <p className="text-xs text-gray-400">MisGastos v1.0</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Los datos se almacenan localmente en tu navegador usando LocalStorage.</p>
          <p>Las contraseñas de la bóveda se encriptan con AES-256.</p>
          <p>Todos los cálculos multimoneda se hacen en tiempo real.</p>
        </div>
      </motion.div>
    </div>
  );
}
>>>>>>> Stashed changes
