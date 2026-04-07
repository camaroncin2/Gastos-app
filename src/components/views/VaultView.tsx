<<<<<<< Updated upstream
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { encrypt, decrypt } from "@/lib/crypto";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShieldCheck, Trash2, Edit3, Eye, EyeOff, Lock, Unlock, Key, Copy, Check } from "lucide-react";

export default function VaultView() {
  const { vault, vaultUnlocked, vaultPin, addVaultEntry, updateVaultEntry, deleteVaultEntry, setVaultUnlocked } = useStore();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", pin: "", notes: "", category: "banco" });

  const resetForm = () => { setForm({ name: "", username: "", password: "", pin: "", notes: "", category: "banco" }); setEditingId(null); };

  useEffect(() => {
    if (!vaultUnlocked) return;
    const timer = setTimeout(() => { setVaultUnlocked(false); setRevealedIds(new Set()); }, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [vaultUnlocked, setVaultUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === vaultPin) { setVaultUnlocked(true); setPinError(false); setPin(""); }
    else setPinError(true);
  };

  const openEdit = (entry: typeof vault[0]) => {
    setEditingId(entry.id);
    setForm({
      name: entry.name, username: entry.username,
      password: entry.encryptedPassword ? decryptField(entry.encryptedPassword) : "",
      pin: entry.encryptedPin ? decryptField(entry.encryptedPin) : "",
      notes: entry.notes, category: entry.category,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const data = {
      name: form.name, username: form.username,
      encryptedPassword: form.password ? encrypt(form.password, vaultPin) : "",
      encryptedPin: form.pin ? encrypt(form.pin, vaultPin) : "",
      notes: form.notes, category: form.category,
    };
    if (editingId) updateVaultEntry(editingId, data);
    else addVaultEntry(data);
    resetForm();
    setShowModal(false);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const decryptField = (encrypted: string): string => {
    if (!encrypted) return "";
    try { return decrypt(encrypted, vaultPin); } catch { return "***"; }
  };

  if (!vaultUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 md:p-10 w-full max-w-md text-center transition-colors">
          <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-flex p-5 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-400 mb-6">
            <Lock className="w-10 h-10" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Bóveda Segura</h2>
          <p className="text-sm text-gray-400 mb-6">Ingresa tu PIN para acceder a tus contraseñas y datos bancarios</p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setPinError(false); }} placeholder="PIN de acceso" maxLength={10}
              className={`w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 ${pinError ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-orange-300"}`} autoFocus />
            {pinError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400">PIN incorrecto. Intenta de nuevo.</motion.p>}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
              className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">Desbloquear</motion.button>
          </form>
          <p className="text-xs text-gray-300 mt-4">Configura tu PIN en Ajustes</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500"><Unlock className="w-5 h-5" /></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Bóveda Desbloqueada</h2>
            <p className="text-xs text-gray-400">Se bloqueará automáticamente en 5 minutos de inactividad</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setVaultUnlocked(false); setRevealedIds(new Set()); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-600 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
            <Lock className="w-4 h-4" />Bloquear
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Agregar Entrada
          </motion.button>
        </div>
      </div>

      {vault.length === 0 ? (
        <EmptyState icon={<Key className="w-8 h-8" />} title="Bóveda vacía" description="Guarda tus contraseñas bancarias y pines de forma encriptada y segura."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primera entrada</motion.button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {vault.map((entry, idx) => {
              const isRevealed = revealedIds.has(entry.id);
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><ShieldCheck className="w-4 h-4" /></div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{entry.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 capitalize">{entry.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(entry)}
                        className="p-2 rounded-lg text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteVaultEntry(entry.id)}
                        className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {entry.username && (
                      <div className="flex items-center justify-between">
                        <div><p className="text-xs text-gray-400">Usuario</p><p className="text-sm font-medium text-gray-700 dark:text-gray-200">{entry.username}</p></div>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(entry.username, `user-${entry.id}`)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500">
                          {copiedId === `user-${entry.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </motion.button>
                      </div>
                    )}
                    {entry.encryptedPassword && (
                      <div className="flex items-center justify-between">
                        <div><p className="text-xs text-gray-400">Contraseña</p><p className="text-sm font-mono text-gray-700 dark:text-gray-200">{isRevealed ? decryptField(entry.encryptedPassword) : "••••••••"}</p></div>
                        <div className="flex items-center gap-1">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleReveal(entry.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500">
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </motion.button>
                          {isRevealed && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(decryptField(entry.encryptedPassword), `pass-${entry.id}`)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500">
                              {copiedId === `pass-${entry.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    )}
                    {entry.encryptedPin && (
                      <div className="flex items-center justify-between">
                        <div><p className="text-xs text-gray-400">PIN</p><p className="text-sm font-mono text-gray-700 dark:text-gray-200">{isRevealed ? decryptField(entry.encryptedPin) : "••••"}</p></div>
                      </div>
                    )}
                    {entry.notes && (<div><p className="text-xs text-gray-400">Notas</p><p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p></div>)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Entrada" : "Agregar Entrada a Bóveda"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Banco Nacional"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
              <option value="banco">Banco</option><option value="tarjeta">Tarjeta</option><option value="crypto">Crypto</option><option value="servicio">Servicio</option><option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Usuario</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="usuario@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">PIN</label>
              <input type="password" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notas adicionales..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none" />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar en Bóveda"}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
=======
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import { encrypt, decrypt } from "@/lib/crypto";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShieldCheck, Trash2, Edit3, Eye, EyeOff, Lock, Unlock, Key, Copy, Check } from "lucide-react";

export default function VaultView() {
  const { vault, vaultUnlocked, vaultPin, addVaultEntry, updateVaultEntry, deleteVaultEntry, setVaultUnlocked } = useStore(useShallow((s) => ({
    vault: s.vault,
    vaultUnlocked: s.vaultUnlocked,
    vaultPin: s.vaultPin,
    addVaultEntry: s.addVaultEntry,
    updateVaultEntry: s.updateVaultEntry,
    deleteVaultEntry: s.deleteVaultEntry,
    setVaultUnlocked: s.setVaultUnlocked,
  })));
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", pin: "", notes: "", category: "banco" });

  const resetForm = () => { setForm({ name: "", username: "", password: "", pin: "", notes: "", category: "banco" }); setEditingId(null); };

  useEffect(() => {
    if (!vaultUnlocked) return;
    const timer = setTimeout(() => { setVaultUnlocked(false); setRevealedIds(new Set()); }, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [vaultUnlocked, setVaultUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === vaultPin) { setVaultUnlocked(true); setPinError(false); setPin(""); }
    else setPinError(true);
  };

  const openEdit = (entry: typeof vault[0]) => {
    setEditingId(entry.id);
    setForm({
      name: entry.name, username: entry.username,
      password: entry.encryptedPassword ? decryptField(entry.encryptedPassword) : "",
      pin: entry.encryptedPin ? decryptField(entry.encryptedPin) : "",
      notes: entry.notes, category: entry.category,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const data = {
      name: form.name, username: form.username,
      encryptedPassword: form.password ? encrypt(form.password, vaultPin) : "",
      encryptedPin: form.pin ? encrypt(form.pin, vaultPin) : "",
      notes: form.notes, category: form.category,
    };
    if (editingId) updateVaultEntry(editingId, data);
    else addVaultEntry(data);
    resetForm();
    setShowModal(false);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const decryptField = (encrypted: string): string => {
    if (!encrypted) return "";
    try { return decrypt(encrypted, vaultPin); } catch { return "***"; }
  };

  if (!vaultUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 md:p-10 w-full max-w-md text-center transition-colors">
          <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-flex p-5 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-400 mb-6">
            <Lock className="w-10 h-10" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Bóveda Segura</h2>
          <p className="text-sm text-gray-400 mb-6">Ingresa tu PIN para acceder a tus contraseñas y datos bancarios</p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setPinError(false); }} placeholder="PIN de acceso" maxLength={10}
              className={`w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 ${pinError ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-orange-300"}`} autoFocus />
            {pinError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400">PIN incorrecto. Intenta de nuevo.</motion.p>}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
              className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">Desbloquear</motion.button>
          </form>
          <p className="text-xs text-gray-300 mt-4">Configura tu PIN en Ajustes</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500"><Unlock className="w-5 h-5" /></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Bóveda Desbloqueada</h2>
            <p className="text-xs text-gray-400">Se bloqueará automáticamente en 5 minutos de inactividad</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setVaultUnlocked(false); setRevealedIds(new Set()); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-surface text-gray-600 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
            <Lock className="w-4 h-4" />Bloquear
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Agregar Entrada
          </motion.button>
        </div>
      </div>

      {vault.length === 0 ? (
        <EmptyState icon={<Key className="w-8 h-8" />} title="Bóveda vacía" description="Guarda tus contraseñas bancarias y pines de forma encriptada y segura."
          action={<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setShowModal(true); }} className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-xl">Agregar primera entrada</motion.button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {vault.map((entry, idx) => {
              const isRevealed = revealedIds.has(entry.id);
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-400"><ShieldCheck className="w-4 h-4" /></div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{entry.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400 capitalize">{entry.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(entry)}
                        className="p-2 rounded-lg text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteVaultEntry(entry.id)}
                        className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {entry.username && (
                      <div className="flex items-center justify-between">
                        <div><p className="text-xs text-gray-400">Usuario</p><p className="text-sm font-medium text-gray-700 dark:text-gray-200">{entry.username}</p></div>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(entry.username, `user-${entry.id}`)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500">
                          {copiedId === `user-${entry.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </motion.button>
                      </div>
                    )}
                    {entry.encryptedPassword && (
                      <div className="flex items-center justify-between">
                        <div><p className="text-xs text-gray-400">Contraseña</p><p className="text-sm font-mono text-gray-700 dark:text-gray-200">{isRevealed ? decryptField(entry.encryptedPassword) : "••••••••"}</p></div>
                        <div className="flex items-center gap-1">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleReveal(entry.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500">
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </motion.button>
                          {isRevealed && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(decryptField(entry.encryptedPassword), `pass-${entry.id}`)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500">
                              {copiedId === `pass-${entry.id}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    )}
                    {entry.encryptedPin && (
                      <div className="flex items-center justify-between">
                        <div><p className="text-xs text-gray-400">PIN</p><p className="text-sm font-mono text-gray-700 dark:text-gray-200">{isRevealed ? decryptField(entry.encryptedPin) : "••••"}</p></div>
                      </div>
                    )}
                    {entry.notes && (<div><p className="text-xs text-gray-400">Notas</p><p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p></div>)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Editar Entrada" : "Agregar Entrada a Bóveda"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Banco Nacional"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent">
              <option value="banco">Banco</option><option value="tarjeta">Tarjeta</option><option value="crypto">Crypto</option><option value="servicio">Servicio</option><option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Usuario</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="usuario@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">PIN</label>
              <input type="password" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notas adicionales..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none" />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
            {editingId ? "Guardar Cambios" : "Guardar en Bóveda"}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}
>>>>>>> Stashed changes
